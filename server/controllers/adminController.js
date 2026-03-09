const pool = require('../db/pool');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const Review = require('../models/Review');
const ConfigurationOption = require('../models/ConfigurationOption');
const ConfigurationValue = require('../models/ConfigurationValue');

const adminController = {
    /**
     * GET /api/admin/dashboard
     */
    async getDashboard(req, res, next) {
        try {
            // Run all stats queries in parallel
            const [orderStats, userCount, productCount, categoryCount, recentOrders, pendingReviews] = await Promise.all([
                Order.getStats(),
                pool.query(`SELECT COUNT(*) FROM users WHERE role = 'customer'`),
                pool.query(`SELECT COUNT(*) FROM products WHERE is_active = true`),
                pool.query(`SELECT COUNT(*) FROM categories WHERE is_active = true`),
                Order.getRecentOrders(5),
                pool.query(`SELECT COUNT(*) FROM reviews WHERE is_approved = false`),
            ]);

            // Revenue over time (last 30 days)
            const { rows: revenueByDay } = await pool.query(`
        SELECT DATE(created_at) AS date,
               SUM(total_amount) AS revenue,
               COUNT(*) AS orders
        FROM orders
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          AND payment_status = 'completed'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `);

            res.json({
                stats: {
                    ...orderStats,
                    total_customers: parseInt(userCount.rows[0].count),
                    total_products: parseInt(productCount.rows[0].count),
                    total_categories: parseInt(categoryCount.rows[0].count),
                    pending_reviews: parseInt(pendingReviews.rows[0].count),
                },
                recentOrders,
                revenueByDay,
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/orders
     */
    async getOrders(req, res, next) {
        try {
            const { page, limit, status } = req.query;
            const result = await Order.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/orders/:id/status
     */
    async updateOrderStatus(req, res, next) {
        try {
            const { status } = req.body;
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status.' });
            }
            const order = await Order.updateStatus(req.params.id, status);
            if (!order) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            res.json({ message: 'Order status updated.', order });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/customers
     */
    async getCustomers(req, res, next) {
        try {
            const { page, limit } = req.query;
            const result = await User.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                role: 'customer',
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/admin/reviews
     */
    async getReviews(req, res, next) {
        try {
            const { page, limit, is_approved } = req.query;
            const reviews = await Review.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                isApproved: is_approved !== undefined ? is_approved === 'true' : undefined,
            });
            res.json({ reviews });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/reviews/:id/approve
     */
    async approveReview(req, res, next) {
        try {
            const review = await Review.approve(req.params.id);
            if (!review) {
                return res.status(404).json({ error: 'Review not found.' });
            }
            res.json({ message: 'Review approved.', review });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/reviews/:id
     */
    async deleteReview(req, res, next) {
        try {
            const deleted = await Review.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Review not found.' });
            }
            res.json({ message: 'Review deleted.' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/categories
     */
    async createCategory(req, res, next) {
        try {
            const { generateSlug } = require('../utils/generateSlug');
            const data = req.body;
            data.slug = generateSlug(data.name);
            const category = await Category.create(data);
            res.status(201).json({ message: 'Category created.', category });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/admin/categories/:id
     */
    async updateCategory(req, res, next) {
        try {
            const fields = req.body;
            if (fields.name) {
                const { generateSlug } = require('../utils/generateSlug');
                fields.slug = generateSlug(fields.name);
            }
            const category = await Category.update(req.params.id, fields);
            if (!category) {
                return res.status(404).json({ error: 'Category not found.' });
            }
            res.json({ message: 'Category updated.', category });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/admin/categories/:id
     */
    async deleteCategory(req, res, next) {
        try {
            const deleted = await Category.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Category not found.' });
            }
            res.json({ message: 'Category deleted.' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/config-options
     */
    async createConfigurationOption(req, res, next) {
        try {
            const option = await ConfigurationOption.create(req.body);
            res.status(201).json(option);
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/admin/config-values
     */
    async createConfigurationValue(req, res, next) {
        try {
            const value = await ConfigurationValue.create(req.body);
            res.status(201).json(value);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = adminController;
