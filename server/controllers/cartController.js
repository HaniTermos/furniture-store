const pool = require('../config/database');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const priceService = require('../services/priceService');

const cartController = {
    /**
     * GET /api/cart
     */
    async getCart(req, res, next) {
        try {
            const items = await CartItem.findByUser(req.user.id);
            const totals = await CartItem.getCartTotal(req.user.id);
            res.json({ items, ...totals });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/cart
     */
    async addItem(req, res, next) {
        const client = await pool.connect();
        try {
            const { product_id, variant_id, quantity = 1, configuration } = req.body;

            await client.query('BEGIN'); // Start transaction

            // Validate product exists
            const product = await Product.findById(product_id);
            if (!product) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Product not found.' });
            }

            // Calculate unit price with configuration if no variant is provided
            let totalPrice;
            if (variant_id) {
                // If variant_id is provided, CartItem.add will fetch and use the variant's price directly.
                // We pass 0 here as a fallback, but CartItem will overwrite it.
                totalPrice = 0;
            } else {
                const priceResult = await priceService.calculatePrice(product.base_price, configuration);
                totalPrice = priceResult.totalPrice;
            }

            const item = await CartItem.add({
                user_id: req.user.id,
                product_id,
                variant_id,
                quantity,
                configuration,
                unit_price: totalPrice,
            }, client); // Pass client to use within transaction

            await client.query('COMMIT'); // Commit transaction

            // Fetch updated cart data (outside transaction is fine since it's just a read)
            const items = await CartItem.findByUser(req.user.id);
            const totals = await CartItem.getCartTotal(req.user.id);

            res.status(201).json({ message: 'Item added to cart.', item, items, ...totals });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    /**
     * PUT /api/cart/:id
     */
    async updateItem(req, res, next) {
        try {
            const { quantity } = req.body;
            if (!quantity || quantity < 1) {
                return res.status(400).json({ error: 'Quantity must be at least 1.' });
            }

            const item = await CartItem.updateQuantity(req.params.id, quantity, req.user.id);
            if (!item) {
                return res.status(404).json({ error: 'Cart item not found.' });
            }

            const items = await CartItem.findByUser(req.user.id);
            const totals = await CartItem.getCartTotal(req.user.id);

            res.json({ message: 'Cart updated.', item, items, ...totals });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/cart/:id
     */
    async removeItem(req, res, next) {
        try {
            const removed = await CartItem.remove(req.params.id, req.user.id);
            if (!removed) {
                return res.status(404).json({ error: 'Cart item not found.' });
            }

            const items = await CartItem.findByUser(req.user.id);
            const totals = await CartItem.getCartTotal(req.user.id);

            res.json({ message: 'Item removed from cart.', items, ...totals });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/cart
     */
    /**
     * DELETE /api/cart
     */
    async clearCart(req, res, next) {
        try {
            await CartItem.clearCart(req.user.id);
            res.json({ message: 'Cart cleared.', items: [], total: 0, item_count: 0 });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/cart/sync
     */
    async syncCart(req, res, next) {
        const client = await pool.connect();
        try {
            const { items } = req.body;
            if (!Array.isArray(items)) {
                return res.status(400).json({ error: 'Items must be an array.' });
            }

            await client.query('BEGIN');

            // Clear existing cart for user
            await CartItem.clearCart(req.user.id, client);

            // Add all items from the request
            for (const item of items) {
                // Determine price
                let unitPrice = 0;
                if (!item.variant_id) {
                    const product = await Product.findById(item.product_id);
                    if (product) {
                        const priceResult = await priceService.calculatePrice(product.base_price, item.configuration);
                        unitPrice = priceResult.totalPrice;
                    }
                }

                await CartItem.add({
                    user_id: req.user.id,
                    product_id: item.product_id,
                    variant_id: item.variant_id,
                    quantity: item.quantity,
                    configuration: item.configuration,
                    unit_price: unitPrice,
                }, client);
            }

            await client.query('COMMIT');

            const updatedItems = await CartItem.findByUser(req.user.id);
            const totals = await CartItem.getCartTotal(req.user.id);

            res.json({ message: 'Cart synced.', items: updatedItems, ...totals });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },
};

module.exports = cartController;
