const pool = require('../db/pool');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const generateOrderNumber = require('../utils/generateOrderNumber');
const priceService = require('../services/priceService');
const emailService = require('../services/emailService');

const orderController = {
    /**
     * POST /api/orders (Checkout)
     */
    async createOrder(req, res, next) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const { shipping_address, billing_address, payment_method, notes } = req.body;

            // Get cart items
            const cartItems = await CartItem.findByUser(req.user.id);
            if (cartItems.length === 0) {
                await client.query('ROLLBACK');
                client.release();
                return res.status(400).json({ error: 'Cart is empty.' });
            }

            // Calculate totals
            let subtotal = 0;
            const orderItems = [];
            for (const item of cartItems) {
                const total = parseFloat(item.unit_price) * item.quantity;
                subtotal += total;
                const product = await Product.findById(item.product_id);
                orderItems.push({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    unit_price: parseFloat(item.unit_price),
                    configuration: item.configuration,
                    product_name: product ? product.name : item.product_name,
                    product_sku: product ? product.sku : 'N/A',
                });
            }

            const totals = priceService.calculateOrderTotals(subtotal);

            // Create order
            const order = await Order.create({
                order_number: generateOrderNumber(),
                user_id: req.user.id,
                ...totals,
                shipping_address,
                billing_address: billing_address || shipping_address,
                payment_method,
                notes,
            }, client);

            // Create order items
            await OrderItem.createMany(order.id, orderItems, client);

            // Clear cart
            await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user.id]);

            await client.query('COMMIT');

            // Send confirmation email (non-blocking)
            emailService.sendOrderConfirmation(order, req.user.email).catch(() => { });

            // Fetch items for the response
            const items = await OrderItem.findByOrder(order.id);

            res.status(201).json({
                message: 'Order placed successfully.',
                order: { ...order, items },
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    /**
     * GET /api/orders
     */
    async getUserOrders(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await Order.findByUser(req.user.id, {
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/orders/:id
     */
    async getOrder(req, res, next) {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found.' });
            }

            // Check ownership (admin can view any)
            if (order.user_id !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied.' });
            }

            const items = await OrderItem.findByOrder(order.id);
            res.json({ order: { ...order, items } });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/orders/:id/cancel
     */
    async cancelOrder(req, res, next) {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            if (order.user_id !== req.user.id) {
                return res.status(403).json({ error: 'Access denied.' });
            }
            if (!['pending', 'confirmed'].includes(order.status)) {
                return res.status(400).json({ error: 'Order cannot be cancelled at this stage.' });
            }

            const updated = await Order.updateStatus(order.id, 'cancelled');
            res.json({ message: 'Order cancelled.', order: updated });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = orderController;
