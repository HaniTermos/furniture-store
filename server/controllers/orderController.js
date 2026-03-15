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
                return res.status(400).json({ error: 'Cart is empty.' });
            }

            // Calculate totals
            let subtotal = 0;
            const orderItems = [];
            for (const item of cartItems) {
                const total = parseFloat(item.unit_price) * item.quantity;
                subtotal += total;
                const product = await Product.findById(item.product_id);
<<<<<<< HEAD
                orderItems.push({
                    product_id: item.product_id,
=======
                let productSku = product ? product.sku : 'N/A';
                if (item.variant_id) {
                    const ProductVariant = require('../models/ProductVariant');
                    const variant = await ProductVariant.findById(item.variant_id);
                    if (variant) productSku = variant.sku;
                }
                orderItems.push({
                    product_id: item.product_id,
                    variant_id: item.variant_id,
>>>>>>> d1d77d0 (dashboard and variants edits)
                    quantity: item.quantity,
                    unit_price: parseFloat(item.unit_price),
                    configuration: item.configuration,
                    product_name: product ? product.name : item.product_name,
<<<<<<< HEAD
                    product_sku: product ? product.sku : 'N/A',
=======
                    product_sku: productSku,
>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
=======
            // Decrement stock for each item
            for (const item of cartItems) {
                if (item.variant_id) {
                    // Variant product: decrement stock on product_variants
                    await client.query(
                        `UPDATE product_variants
                         SET stock_quantity = GREATEST(0, stock_quantity - $1),
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2`,
                        [item.quantity, item.variant_id]
                    );
                } else if (item.configuration && typeof item.configuration === 'object' && Object.keys(item.configuration).length > 0) {
                    // Configurable product: decrement stock on configuration_values
                    const valueIds = Object.values(item.configuration);
                    for (const valueId of valueIds) {
                        await client.query(
                            `UPDATE configuration_values
                             SET stock_quantity = GREATEST(0, stock_quantity - $1),
                                 stock_status = CASE
                                     WHEN GREATEST(0, stock_quantity - $1) = 0 THEN 'out_of_stock'
                                     WHEN GREATEST(0, stock_quantity - $1) < 10 THEN 'low_stock'
                                     ELSE 'in_stock'
                                 END
                             WHERE id = $2`,
                            [item.quantity, valueId]
                        );
                    }
                } else {
                    // Non-configurable (simple) product: decrement stock on products table
                    await client.query(
                        `UPDATE products
                         SET stock_quantity = GREATEST(0, stock_quantity - $1),
                             stock_status = CASE
                                 WHEN GREATEST(0, stock_quantity - $1) = 0 THEN 'out_of_stock'
                                 WHEN GREATEST(0, stock_quantity - $1) < (SELECT COALESCE(low_stock_threshold, 5) FROM products WHERE id = $2) THEN 'low_stock'
                                 ELSE 'in_stock'
                             END,
                             updated_at = CURRENT_TIMESTAMP
                         WHERE id = $2`,
                        [item.quantity, item.product_id]
                    );
                }
            }

>>>>>>> d1d77d0 (dashboard and variants edits)
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
