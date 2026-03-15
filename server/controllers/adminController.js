// ═══════════════════════════════════════════════════════════════
//  controllers/adminController.js — Enhanced Admin Controller
//  Full CRUD for products, orders, customers, analytics,
//  coupons, settings, and activity logs
// ═══════════════════════════════════════════════════════════════

const pool = require('../db/pool');
const Order = require('../models/Order');
const User = require('../models/User');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Tag = require('../models/Tag');
const ConfigurationOption = require('../models/ConfigurationOption');
const ConfigurationValue = require('../models/ConfigurationValue');
const Coupon = require('../models/Coupon');
const ActivityLog = require('../models/ActivityLog');
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification'); // Placeholder for next step
const Setting = require('../models/Setting');
const Currency = require('../models/Currency');
const { jsonToCsv } = require('../utils/exportUtils');
const emailService = require('../services/emailService');

const adminController = {
    // ═══════════════════════════════════════════════════════════
    //  ANALYTICS / DASHBOARD
    // ═══════════════════════════════════════════════════════════
    async getDashboard(req, res, next) {
        try {
            const [orderStats, userCount, productCount, categoryCount, recentOrders, pendingReviews, lowStockCount] = await Promise.all([
                Order.getStats(),
                pool.query(`SELECT COUNT(*) FROM users WHERE role = 'user'`),
                pool.query(`SELECT COUNT(*) FROM products WHERE is_active = true`),
                pool.query(`SELECT COUNT(*) FROM categories WHERE is_active = true`),
                Order.getRecentOrders(5),
                pool.query(`SELECT COUNT(*) FROM reviews WHERE is_approved = false`),
<<<<<<< HEAD
                pool.query(`SELECT COUNT(*) FROM configuration_values WHERE stock_quantity > 0 AND stock_quantity < 10`),
=======
                pool.query(`
                    SELECT (
                        (SELECT COUNT(*) FROM configuration_values WHERE stock_quantity > 0 AND stock_quantity < 10)
                        +
                        (SELECT COUNT(*) FROM products WHERE is_configurable = false AND is_active = true AND stock_quantity > 0 AND stock_quantity < low_stock_threshold)
                    ) as count
                `),
>>>>>>> d1d77d0 (dashboard and variants edits)
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

            // Today vs yesterday
            const { rows: todayRevenue } = await pool.query(`
                SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders
                FROM orders WHERE DATE(created_at) = CURRENT_DATE AND payment_status = 'completed'
            `);
            const { rows: yesterdayRevenue } = await pool.query(`
                SELECT COALESCE(SUM(total_amount), 0) as revenue, COUNT(*) as orders
                FROM orders WHERE DATE(created_at) = CURRENT_DATE - 1 AND payment_status = 'completed'
            `);

            // New customers this week vs last week
            const { rows: newCustomersThisWeek } = await pool.query(`
                SELECT COUNT(*) FROM users WHERE role = 'user' AND created_at >= DATE_TRUNC('week', CURRENT_DATE)
            `);
            const { rows: newCustomersLastWeek } = await pool.query(`
                SELECT COUNT(*) FROM users WHERE role = 'user'
                AND created_at >= DATE_TRUNC('week', CURRENT_DATE) - INTERVAL '7 days'
                AND created_at < DATE_TRUNC('week', CURRENT_DATE)
            `);

            // Recent activity
            const recentActivity = await ActivityLog.getRecent(10);

            // Sales by category
            const { rows: salesByCategory } = await pool.query(`
                SELECT c.name as category, COALESCE(SUM(oi.total_price), 0) as revenue, COUNT(oi.id) as items_sold
                FROM categories c
                LEFT JOIN products p ON p.category_id = c.id
                LEFT JOIN order_items oi ON oi.product_id = p.id
                LEFT JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'completed'
                WHERE c.is_active = true
                GROUP BY c.id, c.name
                ORDER BY revenue DESC
                LIMIT 10
            `);

            // Top products
            const { rows: topProducts } = await pool.query(`
                SELECT p.name, p.sku, SUM(oi.quantity) as units_sold, SUM(oi.total_price) as revenue
                FROM order_items oi
                JOIN products p ON p.id = oi.product_id
                JOIN orders o ON o.id = oi.order_id AND o.payment_status = 'completed'
                GROUP BY p.id, p.name, p.sku
                ORDER BY revenue DESC
                LIMIT 10
            `);

            res.json({
                stats: {
                    ...orderStats,
                    total_customers: parseInt(userCount.rows[0].count),
                    total_products: parseInt(productCount.rows[0].count),
                    total_categories: parseInt(categoryCount.rows[0].count),
                    pending_reviews: parseInt(pendingReviews.rows[0].count),
                    low_stock_count: parseInt(lowStockCount.rows[0].count),
                    today_revenue: parseFloat(todayRevenue[0].revenue),
                    today_orders: parseInt(todayRevenue[0].orders),
                    yesterday_revenue: parseFloat(yesterdayRevenue[0].revenue),
                    new_customers_this_week: parseInt(newCustomersThisWeek[0].count),
                    new_customers_last_week: parseInt(newCustomersLastWeek[0].count),
                },
                recentOrders,
                revenueByDay,
                recentActivity,
                salesByCategory,
                topProducts,
            });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  SALES ANALYTICS
    // ═══════════════════════════════════════════════════════════
    async getSalesAnalytics(req, res, next) {
        try {
            const { period = '30d' } = req.query;
<<<<<<< HEAD
            const intervals = { '7d': '7 days', '30d': '30 days', '90d': '90 days', '1y': '365 days' };
            const interval = intervals[period] || '30 days';

            const { rows: revenueByDay } = await pool.query(`
                SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(*) AS orders
                FROM orders WHERE created_at >= CURRENT_DATE - CAST($1 AS INTERVAL) AND payment_status = 'completed'
                GROUP BY DATE(created_at) ORDER BY date ASC
            `, [interval]);

            const { rows: ordersByStatus } = await pool.query(`
                SELECT status, COUNT(*) as count FROM orders
                WHERE created_at >= CURRENT_DATE - CAST($1 AS INTERVAL)
                GROUP BY status
            `, [interval]);
=======
            // Whitelist period → integer days (fully parameterized, no string interpolation)
            const VALID_PERIODS = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
            const days = VALID_PERIODS[period] || 30;

            const { rows: revenueByDay } = await pool.query(`
                SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(*) AS orders
                FROM orders WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day') AND payment_status = 'completed'
                GROUP BY DATE(created_at) ORDER BY date ASC
            `, [days]);

            const { rows: ordersByStatus } = await pool.query(`
                SELECT status, COUNT(*) as count FROM orders
                WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day')
                GROUP BY status
            `, [days]);
>>>>>>> d1d77d0 (dashboard and variants edits)

            // Average order value
            const { rows: aov } = await pool.query(`
                SELECT COALESCE(AVG(total_amount), 0) as aov FROM orders
<<<<<<< HEAD
                WHERE created_at >= CURRENT_DATE - CAST($1 AS INTERVAL) AND payment_status = 'completed'
            `, [interval]);
=======
                WHERE created_at >= CURRENT_DATE - ($1 * INTERVAL '1 day') AND payment_status = 'completed'
            `, [days]);
>>>>>>> d1d77d0 (dashboard and variants edits)

            res.json({ revenueByDay, ordersByStatus, averageOrderValue: parseFloat(aov[0].aov) });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  ORDERS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getOrders(req, res, next) {
        try {
            const { page, limit, status, search, dateFrom, dateTo } = req.query;
            const result = await Order.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status,
                search,
                dateFrom,
                dateTo,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getOrderDetail(req, res, next) {
        try {
            const order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ error: 'Order not found.' });
            }
            res.json({ order });
        } catch (error) {
            next(error);
        }
    },

    async updateOrderStatus(req, res, next) {
        try {
            const { status, trackingNumber, notes } = req.body;
            const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status.' });
            }

            const oldOrder = await Order.findById(req.params.id);
            if (!oldOrder) {
                return res.status(404).json({ error: 'Order not found.' });
            }

            const updateData = { status };
            if (trackingNumber) updateData.tracking_number = trackingNumber;
            if (notes) updateData.notes = notes;
            if (status === 'shipped') updateData.shipped_at = new Date();
            if (status === 'delivered') updateData.delivered_at = new Date();

            const order = await Order.updateStatus(req.params.id, status, updateData);

            // Log activity
            ActivityLog.create({
                userId: req.user.id,
                action: 'update_order_status',
                entityType: 'order',
                entityId: order.id,
                oldValues: { status: oldOrder.status },
                newValues: { status },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

            // Send email notification to customer
            if (oldOrder.user_id) {
                const customer = await User.findById(oldOrder.user_id);
                if (customer) {
                    emailService.sendOrderStatusUpdate({
                        email: customer.email,
                        name: customer.name,
                        orderNumber: order.order_number,
                        status,
                        trackingNumber,
                    }).catch(() => { });
                }
            }

            res.json({ message: 'Order status updated.', order });
        } catch (error) {
            next(error);
        }
    },

    async bulkUpdateOrderStatus(req, res, next) {
        try {
            const { orderIds, status } = req.body;
            if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
                return res.status(400).json({ error: 'Order IDs array required.' });
            }
<<<<<<< HEAD
=======
            // Validate all IDs are UUIDs
            const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!orderIds.every(id => UUID_RE.test(id))) {
                return res.status(400).json({ error: 'Invalid order ID format.' });
            }
>>>>>>> d1d77d0 (dashboard and variants edits)
            const placeholders = orderIds.map((_, i) => `$${i + 2}`).join(',');
            const { rowCount } = await pool.query(
                `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
                [status, ...orderIds]
            );
            res.json({ message: `${rowCount} orders updated.` });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  CUSTOMERS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getCustomers(req, res, next) {
        try {
            const { page, limit, search } = req.query;
            const result = await User.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                role: 'user',
                search,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getCustomerDetail(req, res, next) {
        try {
            const customer = await User.findById(req.params.id);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found.' });
            }

            // Get customer orders
            const { rows: orders } = await pool.query(
                `SELECT id, order_number, status, payment_status, total_amount, created_at
         FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
                [req.params.id]
            );

            // Get total spent
            const { rows: totalSpent } = await pool.query(
                `SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE user_id = $1 AND payment_status = 'completed'`,
                [req.params.id]
            );

            res.json({
                customer,
                orders,
                totalSpent: parseFloat(totalSpent[0].total),
                orderCount: orders.length,
            });
        } catch (error) {
            next(error);
        }
    },

    async updateCustomer(req, res, next) {
        try {
            const customer = await User.update(req.params.id, req.body);
            if (!customer) {
                return res.status(404).json({ error: 'Customer not found.' });
            }

            ActivityLog.create({
                userId: req.user.id,
                action: 'update_customer',
                entityType: 'user',
                entityId: req.params.id,
                newValues: req.body,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Customer updated.', customer });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  PRODUCTS MANAGEMENT (Enhanced CRUD)
    // ═══════════════════════════════════════════════════════════
    async getProducts(req, res, next) {
        try {
            const { page = 1, limit = 25, search, category, status, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            let query = `
                SELECT p.*, c.name as category_name,
                    (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
            `;
            const conditions = [];
            const params = [];

            if (search) {
                params.push(`%${search}%`);
                conditions.push(`(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`);
            }
            if (category) {
                params.push(category);
                conditions.push(`p.category_id = $${params.length}`);
            }
            if (status === 'active') conditions.push(`p.is_active = true`);
            if (status === 'inactive') conditions.push(`p.is_active = false`);
            if (status === 'featured') conditions.push(`p.is_featured = true`);

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            const validSortColumns = ['name', 'sku', 'base_price', 'created_at', 'updated_at'];
            const sortColumn = validSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.created_at';
            const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
            query += ` ORDER BY ${sortColumn} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
            params.push(parseInt(limit), offset);

            const { rows } = await pool.query(query, params);

            // Count
            let countQuery = `SELECT COUNT(*) FROM products p`;
            const countParams = [];
            const countConditions = [];
            if (search) { countParams.push(`%${search}%`); countConditions.push(`(p.name ILIKE $${countParams.length} OR p.sku ILIKE $${countParams.length})`); }
            if (category) { countParams.push(category); countConditions.push(`p.category_id = $${countParams.length}`); }
            if (status === 'active') countConditions.push(`p.is_active = true`);
            if (status === 'inactive') countConditions.push(`p.is_active = false`);
            if (status === 'featured') countConditions.push(`p.is_featured = true`);
            if (countConditions.length > 0) countQuery += ` WHERE ${countConditions.join(' AND ')}`;
            const { rows: countRows } = await pool.query(countQuery, countParams);

            res.json({ products: rows, total: parseInt(countRows[0].count), page: parseInt(page), limit: parseInt(limit) });
        } catch (error) {
            next(error);
        }
    },

    async getProductDetail(req, res, next) {
        try {
            const { rows: products } = await pool.query(
                `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
                [req.params.id]
            );
            if (products.length === 0) return res.status(404).json({ error: 'Product not found.' });

            const product = products[0];

            // Get images
            const { rows: images } = await pool.query(
                `SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order`, [product.id]
            );

            // Get configuration options with values
            const { rows: options } = await pool.query(
                `SELECT * FROM configuration_options WHERE product_id = $1 ORDER BY sort_order`, [product.id]
            );
            for (const opt of options) {
                const { rows: values } = await pool.query(
                    `SELECT * FROM configuration_values WHERE option_id = $1 ORDER BY value`, [opt.id]
                );
                opt.values = values;
            }

            // Get Tags
            const { rows: tags } = await pool.query(
                `SELECT t.* FROM tags t
                 JOIN product_tags pt ON pt.tag_id = t.id
                 WHERE pt.product_id = $1`, [product.id]
            );

<<<<<<< HEAD
            // Get Global Attributes
            const { rows: attributes } = await pool.query(
                `SELECT pa.attribute_id, pa.value_id, pa.is_variation_maker,
                        a.name as attribute_name, a.type as attribute_type,
                        av.value as value_name, av.color_hex, av.image_url
                 FROM product_attributes pa
                 JOIN attributes a ON a.id = pa.attribute_id
                 JOIN attribute_values av ON av.id = pa.value_id
                 WHERE pa.product_id = $1`, [product.id]
=======
            // Get Assigned Attributes for variants
            const { rows: attributes } = await pool.query(
                `SELECT pa.attribute_id, a.name as attribute_name, a.type as attribute_type
                 FROM product_attributes pa
                 JOIN attributes a ON a.id = pa.attribute_id
                 WHERE pa.product_id = $1
                 ORDER BY pa.sort_order`, [product.id]
>>>>>>> d1d77d0 (dashboard and variants edits)
            );

            res.json({ product: { ...product, images, configuration_options: options, tags, attributes } });
        } catch (error) {
            next(error);
        }
    },

    async createProduct(req, res, next) {
<<<<<<< HEAD
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
=======
        try {
>>>>>>> d1d77d0 (dashboard and variants edits)
            const { generateSlug } = require('../utils/generateSlug');
            const data = req.body;
            if (!data.slug) data.slug = generateSlug(data.name);

<<<<<<< HEAD
            const { rows } = await client.query(
=======
            const { rows } = await pool.query(
>>>>>>> d1d77d0 (dashboard and variants edits)
                `INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id,
                 is_active, is_configurable, weight_kg, dimensions_cm, is_featured, is_new, meta_title, meta_description, size_guide_id)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
                [data.name, data.slug, data.sku, data.description, data.short_description, data.base_price,
                data.category_id, data.is_active !== false, data.is_configurable || false, data.weight_kg || null,
                data.dimensions_cm ? JSON.stringify(data.dimensions_cm) : null,
                data.is_featured || false, data.is_new || false, data.meta_title || data.name,
                data.meta_description || data.short_description, data.size_guide_id || null]
            );
            const productId = rows[0].id;

            // Handle Tags
            if (data.tags && Array.isArray(data.tags)) {
                for (const tagId of data.tags) {
<<<<<<< HEAD
                    await client.query(`INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)`, [productId, tagId]);
                }
            }

            // Handle Global Attributes
            if (data.attributes && Array.isArray(data.attributes)) {
                for (const attr of data.attributes) {
                    await client.query(
                        `INSERT INTO product_attributes (product_id, attribute_id, value_id, is_variation_maker) VALUES ($1, $2, $3, $4)`,
                        [productId, attr.attribute_id, attr.value_id, attr.is_variation_maker || false]
=======
                    await pool.query(`INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)`, [productId, tagId]);
                }
            }

            // Handle Attribute Assignments
            if (data.attributes && Array.isArray(data.attributes)) {
                for (const attrId of data.attributes) {
                    await pool.query(
                        `INSERT INTO product_attributes (product_id, attribute_id) VALUES ($1, $2)
                         ON CONFLICT (product_id, attribute_id) DO NOTHING`,
                        [productId, attrId]
>>>>>>> d1d77d0 (dashboard and variants edits)
                    );
                }
            }

            ActivityLog.create({
                userId: req.user.id,
                action: 'create_product',
                entityType: 'product',
                entityId: rows[0].id,
                newValues: { name: data.name, sku: data.sku },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

<<<<<<< HEAD
            await client.query('COMMIT');
            res.status(201).json({ message: 'Product created.', product: rows[0] });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
=======
            res.status(201).json({ message: 'Product created.', product: rows[0] });
        } catch (error) {
            next(error);
>>>>>>> d1d77d0 (dashboard and variants edits)
        }
    },

    async updateProduct(req, res, next) {
<<<<<<< HEAD
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
=======
        try {
>>>>>>> d1d77d0 (dashboard and variants edits)
            const data = req.body;
            if (data.name) {
                const { generateSlug } = require('../utils/generateSlug');
                if (!data.slug) data.slug = generateSlug(data.name);
            }

            const ALLOWED = ['name', 'slug', 'sku', 'description', 'short_description', 'base_price',
<<<<<<< HEAD
                'category_id', 'is_active', 'is_configurable', 'weight_kg', 'dimensions_cm',
                'is_featured', 'is_new', 'meta_title', 'meta_description', 'size_guide_id'];
=======
                'category_id', 'is_active', 'is_configurable', 'has_variants', 'weight_kg', 'dimensions_cm',
                'is_featured', 'is_new', 'meta_title', 'meta_description', 'size_guide_id',
                'stock_quantity', 'stock_status', 'low_stock_threshold'];
>>>>>>> d1d77d0 (dashboard and variants edits)
            const keys = Object.keys(data).filter(k => ALLOWED.includes(k));
            let productRow = null;

            if (keys.length > 0) {
                const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
                const values = keys.map(k => {
                    if (k === 'dimensions_cm' && data[k]) return JSON.stringify(data[k]);
                    return data[k];
                });

<<<<<<< HEAD
                const { rows } = await client.query(
                    `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
                    [req.params.id, ...values]
                );
                if (rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Product not found.' });
                }
                productRow = rows[0];
            } else {
                const { rows } = await client.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
                if (rows.length === 0) {
                    await client.query('ROLLBACK');
                    return res.status(404).json({ error: 'Product not found.' });
                }
                productRow = rows[0];
            }

            // Sync Tags
            if (data.tags !== undefined) {
                await client.query(`DELETE FROM product_tags WHERE product_id = $1`, [req.params.id]);
                if (Array.isArray(data.tags)) {
                    for (const tagId of data.tags) {
                        try {
                            await client.query(`INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)`, [req.params.id, tagId]);
                        } catch (e) {
                            console.error('Error connecting tag', e);
                            throw e;
                        }
=======
                const { rows } = await pool.query(
                    `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
                    [req.params.id, ...values]
                );
                if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
                productRow = rows[0];
            } else {
                const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
                if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });
                productRow = rows[0];
            }

            // ── Sync Images ─────────────────────────────────────
            if (data.images !== undefined && Array.isArray(data.images)) {
                // Get existing image IDs for this product
                const { rows: existingImages } = await pool.query(
                    `SELECT id FROM product_images WHERE product_id = $1`, [req.params.id]
                );
                const existingIds = new Set(existingImages.map(img => img.id));

                // IDs sent from frontend (only real DB IDs, not temp- prefixed)
                const incomingIds = new Set(
                    data.images
                        .filter(img => img.id && !String(img.id).startsWith('temp-'))
                        .map(img => img.id)
                );

                // Delete images that were removed by the user
                for (const existingId of existingIds) {
                    if (!incomingIds.has(existingId)) {
                        await pool.query(`DELETE FROM product_images WHERE id = $1`, [existingId]);
                    }
                }

                // Upsert each image: update existing, insert new
                for (let i = 0; i < data.images.length; i++) {
                    const img = data.images[i];
                    const imageUrl = img.image_url || img.url;
                    const altText = img.alt_text || img.alt || productRow.name;
                    const isPrimary = img.is_primary || false;
                    const sortOrder = img.sort_order !== undefined ? img.sort_order : i;

                    if (img.id && !String(img.id).startsWith('temp-') && existingIds.has(img.id)) {
                        // Update existing image (sort_order, is_primary)
                        await pool.query(
                            `UPDATE product_images SET url = $1, alt_text = $2, is_primary = $3, sort_order = $4 WHERE id = $5`,
                            [imageUrl, altText, isPrimary, sortOrder, img.id]
                        );
                    } else {
                        // Insert new image (uploaded during this edit session)
                        await pool.query(
                            `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order) VALUES ($1, $2, $3, $4, $5)`,
                            [req.params.id, imageUrl, altText, isPrimary, sortOrder]
                        );
                    }
                }
            }

            // ── Sync Tags ───────────────────────────────────────
            if (data.tags !== undefined) {
                await pool.query(`DELETE FROM product_tags WHERE product_id = $1`, [req.params.id]);
                if (Array.isArray(data.tags)) {
                    for (const tagId of data.tags) {
                        try {
                            await pool.query(`INSERT INTO product_tags (product_id, tag_id) VALUES ($1, $2)`, [req.params.id, tagId]);
                        } catch (e) { console.error('Error connecting tag', e); }
>>>>>>> d1d77d0 (dashboard and variants edits)
                    }
                }
            }

<<<<<<< HEAD
            // Sync Global Attributes
            if (data.attributes !== undefined) {
                await client.query(`DELETE FROM product_attributes WHERE product_id = $1`, [req.params.id]);
                if (Array.isArray(data.attributes)) {
                    for (const attr of data.attributes) {
                        try {
                            await client.query(
                                `INSERT INTO product_attributes (product_id, attribute_id, value_id, is_variation_maker) VALUES ($1, $2, $3, $4)`,
                                [req.params.id, attr.attribute_id, attr.value_id, attr.is_variation_maker || false]
                            );
                        } catch (e) {
                            console.error('Error connecting attribute', e);
                            throw e;
                        }
=======
            // ── Sync Product Attribute Assignments ──────────────────
            if (data.attributes !== undefined) {
                await pool.query(`DELETE FROM product_attributes WHERE product_id = $1`, [req.params.id]);
                if (Array.isArray(data.attributes)) {
                    for (const attrId of data.attributes) {
                        try {
                            await pool.query(
                                `INSERT INTO product_attributes (product_id, attribute_id) VALUES ($1, $2)
                                 ON CONFLICT (product_id, attribute_id) DO NOTHING`,
                                [req.params.id, attrId]
                            );
                        } catch (e) { console.error('Error connecting attribute', e); }
>>>>>>> d1d77d0 (dashboard and variants edits)
                    }
                }
            }

<<<<<<< HEAD
            // Sync Product Variation Combinations (configurations)
            if (data.configurations !== undefined && Array.isArray(data.configurations)) {
                // 1. Find or create a 'Variations' option for this product
                let optionId;
                const { rows: existingOptions } = await client.query(
=======
            // ── Update Configuration Values (stock/price per variant) ──
            if (data.configuration_values_update !== undefined && Array.isArray(data.configuration_values_update)) {
                for (const val of data.configuration_values_update) {
                    if (!val.id) continue;
                    const updates = [];
                    const params = [];
                    if (val.stock_quantity !== undefined) {
                        params.push(parseInt(val.stock_quantity) || 0);
                        updates.push(`stock_quantity = $${params.length}`);
                    }
                    if (val.price_adjustment !== undefined) {
                        params.push(parseFloat(val.price_adjustment) || 0);
                        updates.push(`price_adjustment = $${params.length}`);
                    }
                    if (val.stock_status !== undefined) {
                        params.push(val.stock_status);
                        updates.push(`stock_status = $${params.length}`);
                    }
                    if (updates.length > 0) {
                        params.push(val.id);
                        await pool.query(
                            `UPDATE configuration_values SET ${updates.join(', ')} WHERE id = $${params.length}`,
                            params
                        );
                    }
                }
            }

            // ── Sync Configuration Options (Full CRUD — unified attributes) ──
            if (data.configuration_options_sync !== undefined && Array.isArray(data.configuration_options_sync)) {
                const incoming = data.configuration_options_sync;

                // Get existing options for this product
                const { rows: existingOptions } = await pool.query(
                    `SELECT id FROM configuration_options WHERE product_id = $1`, [req.params.id]
                );
                const existingOptionIds = new Set(existingOptions.map(o => o.id));
                const incomingOptionIds = new Set(incoming.filter(o => o.id).map(o => o.id));

                // Delete removed options (cascade deletes values automatically)
                for (const existingId of existingOptionIds) {
                    if (!incomingOptionIds.has(existingId)) {
                        await pool.query(`DELETE FROM configuration_options WHERE id = $1`, [existingId]);
                    }
                }

                // Upsert options
                for (let i = 0; i < incoming.length; i++) {
                    const opt = incoming[i];
                    let optionId = opt.id;

                    if (opt.id && existingOptionIds.has(opt.id)) {
                        // Update existing option
                        await pool.query(
                            `UPDATE configuration_options SET name = $1, type = $2, sort_order = $3 WHERE id = $4`,
                            [opt.name, opt.type || 'select', i, opt.id]
                        );
                    } else {
                        // Insert new option
                        const { rows: newOpt } = await pool.query(
                            `INSERT INTO configuration_options (product_id, name, type, is_required, sort_order)
                             VALUES ($1, $2, $3, true, $4) RETURNING id`,
                            [req.params.id, opt.name, opt.type || 'select', i]
                        );
                        optionId = newOpt[0].id;
                    }

                    // Sync values for this option
                    const { rows: existingValues } = await pool.query(
                        `SELECT id FROM configuration_values WHERE option_id = $1`, [optionId]
                    );
                    const existingValueIds = new Set(existingValues.map(v => v.id));
                    const incomingValueIds = new Set((opt.values || []).filter(v => v.id).map(v => v.id));

                    // Delete removed values
                    for (const existingValId of existingValueIds) {
                        if (!incomingValueIds.has(existingValId)) {
                            await pool.query(`DELETE FROM configuration_values WHERE id = $1`, [existingValId]);
                        }
                    }

                    // Upsert values
                    for (const val of (opt.values || [])) {
                        const qty = parseInt(val.stock_quantity) || 0;
                        const stockStatus = qty <= 0 ? 'out_of_stock' : qty < 10 ? 'low_stock' : 'in_stock';

                        if (val.id && existingValueIds.has(val.id)) {
                            // Update existing value
                            await pool.query(
                                `UPDATE configuration_values SET value = $1, price_adjustment = $2, stock_quantity = $3, stock_status = $4, image_url = $5 WHERE id = $6`,
                                [val.value, parseFloat(val.price_adjustment) || 0, qty, stockStatus, val.image_url || null, val.id]
                            );
                        } else {
                            // Insert new value
                            await pool.query(
                                `INSERT INTO configuration_values (option_id, value, price_adjustment, stock_quantity, stock_status, image_url)
                                 VALUES ($1, $2, $3, $4, $5, $6)`,
                                [optionId, val.value, parseFloat(val.price_adjustment) || 0, qty, stockStatus, val.image_url || null]
                            );
                        }
                    }
                }

                // Auto-set is_configurable based on whether options exist
                await pool.query(
                    `UPDATE products SET is_configurable = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                    [incoming.length > 0, req.params.id]
                );
            }

            // ── Sync Product Variation Combinations (configurations) ──
            if (data.configurations !== undefined && Array.isArray(data.configurations)) {
                let optionId;
                const { rows: existingOptions } = await pool.query(
>>>>>>> d1d77d0 (dashboard and variants edits)
                    `SELECT id FROM configuration_options WHERE product_id = $1 AND name = 'Variations'`,
                    [req.params.id]
                );

                if (existingOptions.length > 0) {
                    optionId = existingOptions[0].id;
                } else {
<<<<<<< HEAD
                    const { rows: newOption } = await client.query(
=======
                    const { rows: newOption } = await pool.query(
>>>>>>> d1d77d0 (dashboard and variants edits)
                        `INSERT INTO configuration_options (product_id, name, type, is_required, sort_order)
                         VALUES ($1, 'Variations', 'select', true, 0) RETURNING id`,
                        [req.params.id]
                    );
                    optionId = newOption[0].id;
                }

<<<<<<< HEAD
                // 2. Clear old values for this specific 'Variations' option
                await client.query(`DELETE FROM configuration_values WHERE option_id = $1`, [optionId]);

                // 3. Insert new values
                for (const config of data.configurations) {
                    await client.query(
=======
                await pool.query(`DELETE FROM configuration_values WHERE option_id = $1`, [optionId]);

                for (const config of data.configurations) {
                    await pool.query(
>>>>>>> d1d77d0 (dashboard and variants edits)
                        `INSERT INTO configuration_values (option_id, value, price_adjustment, stock_quantity, stock_status)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [
                            optionId,
                            config.value,
                            parseFloat(config.price_adjustment) || 0,
                            parseInt(config.stock_quantity) || 0,
                            config.stock_status || 'in_stock'
                        ]
                    );
                }
            }

            ActivityLog.create({
                userId: req.user.id,
                action: 'update_product',
                entityType: 'product',
                entityId: req.params.id,
                newValues: data,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

<<<<<<< HEAD
            await client.query('COMMIT');
            res.json({ message: 'Product updated.', product: productRow });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
=======
            // ── Return full product (matching getProductDetail shape) ──
            const { rows: fullProducts } = await pool.query(
                `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1`,
                [req.params.id]
            );
            const fullProduct = fullProducts[0];

            const { rows: finalImages } = await pool.query(
                `SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order`, [req.params.id]
            );

            const { rows: finalOptions } = await pool.query(
                `SELECT * FROM configuration_options WHERE product_id = $1 ORDER BY sort_order`, [req.params.id]
            );
            for (const opt of finalOptions) {
                const { rows: vals } = await pool.query(
                    `SELECT * FROM configuration_values WHERE option_id = $1 ORDER BY value`, [opt.id]
                );
                opt.values = vals;
            }

            const { rows: finalTags } = await pool.query(
                `SELECT t.* FROM tags t JOIN product_tags pt ON pt.tag_id = t.id WHERE pt.product_id = $1`, [req.params.id]
            );

            const { rows: finalAttrs } = await pool.query(
                `SELECT pa.attribute_id, pa.value_id,
                        a.name as attribute_name, a.type as attribute_type,
                        av.value as value_name, av.color_hex, av.image_url
                 FROM product_attributes pa
                 JOIN attributes a ON a.id = pa.attribute_id
                 JOIN attribute_values av ON av.id = pa.value_id
                 WHERE pa.product_id = $1`, [req.params.id]
            );

            res.json({
                message: 'Product updated.',
                product: { ...fullProduct, images: finalImages, configuration_options: finalOptions, tags: finalTags, attributes: finalAttrs }
            });
        } catch (error) {
            next(error);
>>>>>>> d1d77d0 (dashboard and variants edits)
        }
    },

    async deleteProduct(req, res, next) {
        try {
            const { rows } = await pool.query(
                `UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name`,
                [req.params.id]
            );
            if (rows.length === 0) return res.status(404).json({ error: 'Product not found.' });

            ActivityLog.create({
                userId: req.user.id,
                action: 'delete_product',
                entityType: 'product',
                entityId: req.params.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Product deleted.', product: rows[0] });
        } catch (error) {
            next(error);
        }
    },

    async duplicateProduct(req, res, next) {
        try {
            const { rows: original } = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
            if (original.length === 0) return res.status(404).json({ error: 'Product not found.' });

            const p = original[0];
            const { generateSlug } = require('../utils/generateSlug');
            const newName = `${p.name} (Copy)`;
            const newSlug = generateSlug(newName) + '-' + Date.now();
            const newSku = `${p.sku}-COPY-${Date.now().toString(36).toUpperCase()}`;

            const { rows } = await pool.query(
                `INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id,
         is_active, is_configurable, weight_kg, dimensions_cm, is_featured, is_new, meta_title, meta_description)
         VALUES ($1,$2,$3,$4,$5,$6,$7,false,$8,$9,$10,false,false,$11,$12) RETURNING *`,
                [newName, newSlug, newSku, p.description, p.short_description, p.base_price, p.category_id,
                    p.is_configurable, p.weight_kg, p.dimensions_cm, p.meta_title, p.meta_description]
            );

            res.status(201).json({ message: 'Product duplicated.', product: rows[0] });
        } catch (error) {
            next(error);
        }
    },

    async bulkDeleteProducts(req, res, next) {
        try {
            const { productIds } = req.body;
<<<<<<< HEAD
            if (!productIds || !Array.isArray(productIds)) return res.status(400).json({ error: 'Product IDs required.' });
=======
            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ error: 'Product IDs required.' });
            }
            // Validate all IDs are UUIDs
            const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!productIds.every(id => UUID_RE.test(id))) {
                return res.status(400).json({ error: 'Invalid product ID format.' });
            }
>>>>>>> d1d77d0 (dashboard and variants edits)
            const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
            const { rowCount } = await pool.query(
                `UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
                productIds
            );
            res.json({ message: `${rowCount} products deactivated.` });
        } catch (error) {
            next(error);
        }
    },

    async bulkUpdateProductStatus(req, res, next) {
        try {
            const { productIds, is_active, is_featured } = req.body;
<<<<<<< HEAD
            if (!productIds || !Array.isArray(productIds)) return res.status(400).json({ error: 'Product IDs required.' });
            const updates = [];
            const params = [...productIds];
            if (is_active !== undefined) updates.push(`is_active = ${is_active}`);
            if (is_featured !== undefined) updates.push(`is_featured = ${is_featured}`);
            if (updates.length === 0) return res.status(400).json({ error: 'No updates specified.' });

            const placeholders = productIds.map((_, i) => `$${i + 1}`).join(',');
            const { rowCount } = await pool.query(
                `UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id IN (${placeholders})`,
                params
=======
            if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
                return res.status(400).json({ error: 'Product IDs required.' });
            }
            // Validate all IDs are UUIDs
            const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!productIds.every(id => UUID_RE.test(id))) {
                return res.status(400).json({ error: 'Invalid product ID format.' });
            }
            // Build parameterized SET clause using explicit params (not string interpolation)
            const setClauses = [];
            const params = [];
            if (is_active !== undefined) {
                params.push(Boolean(is_active));
                setClauses.push(`is_active = $${params.length}`);
            }
            if (is_featured !== undefined) {
                params.push(Boolean(is_featured));
                setClauses.push(`is_featured = $${params.length}`);
            }
            if (setClauses.length === 0) return res.status(400).json({ error: 'No updates specified.' });

            const idPlaceholders = productIds.map((_, i) => `$${params.length + i + 1}`).join(',');
            const { rowCount } = await pool.query(
                `UPDATE products SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id IN (${idPlaceholders})`,
                [...params, ...productIds]
>>>>>>> d1d77d0 (dashboard and variants edits)
            );
            res.json({ message: `${rowCount} products updated.` });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  REVIEWS MODERATION
    // ═══════════════════════════════════════════════════════════
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

    async approveReview(req, res, next) {
        try {
            const review = await Review.approve(req.params.id);
            if (!review) return res.status(404).json({ error: 'Review not found.' });
            res.json({ message: 'Review approved.', review });
        } catch (error) {
            next(error);
        }
    },

    async deleteReview(req, res, next) {
        try {
            const deleted = await Review.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Review not found.' });
            res.json({ message: 'Review deleted.' });
        } catch (error) {
            next(error);
        }
    },

    async replyToReview(req, res, next) {
        try {
            const { reply } = req.body;
            if (!reply) return res.status(400).json({ error: 'Reply content is required.' });
            const review = await Review.adminReply(req.params.id, reply);
            if (!review) return res.status(404).json({ error: 'Review not found.' });
            res.json({ message: 'Reply saved.', review });
        } catch (error) {
            next(error);
        }
    },

    async toggleReviewFeatured(req, res, next) {
        try {
            const review = await Review.toggleFeatured(req.params.id);
            if (!review) return res.status(404).json({ error: 'Review not found.' });
            res.json({ message: 'Featured status toggled.', review });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  CATEGORIES MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getCategoriesTree(req, res, next) {
        try {
            const tree = await Category.getTree();
            res.json(tree);
        } catch (error) {
            next(error);
        }
    },

    async getCategoryDetail(req, res, next) {
        try {
            const category = await Category.findById(req.params.id);
            if (!category) return res.status(404).json({ error: 'Category not found.' });

            // Get product count
            const { rows } = await pool.query(
                `SELECT COUNT(*) FROM products WHERE category_id = $1`, [req.params.id]
            );
            category.product_count = parseInt(rows[0].count);

            res.json(category);
        } catch (error) {
            next(error);
        }
    },

    async reorderCategories(req, res, next) {
        try {
            const { categories } = req.body; // Array of { id, sort_order, parent_id }
            if (!Array.isArray(categories)) return res.status(400).json({ error: 'Categories array required.' });

            for (const cat of categories) {
                await Category.update(cat.id, {
                    sort_order: cat.sort_order,
                    parent_id: cat.parent_id
                });
            }
            res.json({ message: 'Categories reordered.' });
        } catch (error) {
            next(error);
        }
    },

    async createCategory(req, res, next) {
        try {
            const { generateSlug } = require('../utils/generateSlug');
            const data = req.body;
            data.slug = generateSlug(data.name);
            const category = await Category.create(data);

            ActivityLog.create({
                userId: req.user.id, action: 'create_category', entityType: 'category',
                entityId: category.id, ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.status(201).json({ message: 'Category created.', category });
        } catch (error) {
            next(error);
        }
    },

    async updateCategory(req, res, next) {
        try {
            const fields = req.body;
            if (fields.name) {
                const { generateSlug } = require('../utils/generateSlug');
                fields.slug = generateSlug(fields.name);
            }
            const category = await Category.update(req.params.id, fields);
            if (!category) return res.status(404).json({ error: 'Category not found.' });
            res.json({ message: 'Category updated.', category });
        } catch (error) {
            next(error);
        }
    },

    async deleteCategory(req, res, next) {
        try {
            // Prevent deletion if it has products
            const { rows } = await pool.query(`SELECT COUNT(*) FROM products WHERE category_id = $1`, [req.params.id]);
            if (parseInt(rows[0].count) > 0) {
                return res.status(400).json({ error: `Cannot delete category: ${rows[0].count} products are currently assigned to it.` });
            }

            const deleted = await Category.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Category not found.' });
            res.json({ message: 'Category deleted.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  TAGS MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getTags(req, res, next) {
        try {
            const tags = await Tag.findAll();
            res.json(tags);
        } catch (error) {
            next(error);
        }
    },

    async createTag(req, res, next) {
        try {
            const { generateSlug } = require('../utils/generateSlug');
            const data = req.body;
            if (!data.slug) data.slug = generateSlug(data.name);
            const tag = await Tag.create(data);
            res.status(201).json({ message: 'Tag created.', tag });
        } catch (error) {
            next(error);
        }
    },

    async updateTag(req, res, next) {
        try {
            const fields = req.body;
            if (fields.name && !fields.slug) {
                const { generateSlug } = require('../utils/generateSlug');
                fields.slug = generateSlug(fields.name);
            }
            const tag = await Tag.update(req.params.id, fields);
            if (!tag) return res.status(404).json({ error: 'Tag not found.' });
            res.json({ message: 'Tag updated.', tag });
        } catch (error) {
            next(error);
        }
    },

    async deleteTag(req, res, next) {
        try {
            const deleted = await Tag.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Tag not found.' });
            res.json({ message: 'Tag deleted.' });
        } catch (error) {
            next(error);
        }
    },

    async bulkCreateTags(req, res, next) {
        try {
            const { tags } = req.body; // Array of strings or objects
            if (!Array.isArray(tags)) return res.status(400).json({ error: 'Tags array required.' });

            const { generateSlug } = require('../utils/generateSlug');
            const created = [];

            for (const item of tags) {
                const name = typeof item === 'string' ? item : item.name;
                const slug = typeof item === 'object' && item.slug ? item.slug : generateSlug(name);
                const description = typeof item === 'object' && item.description ? item.description : null;

                const { rows } = await pool.query(
                    `INSERT INTO tags (name, slug, description) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING RETURNING *`,
                    [name, slug, description]
                );
                if (rows.length > 0) created.push(rows[0]);
            }

            res.status(201).json({ message: `${created.length} tags created.`, tags: created });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  CONFIGURATION OPTIONS & VALUES
    // ═══════════════════════════════════════════════════════════
    async createConfigurationOption(req, res, next) {
        try {
            const option = await ConfigurationOption.create(req.body);
            res.status(201).json(option);
        } catch (error) {
            next(error);
        }
    },

    async createConfigurationValue(req, res, next) {
        try {
            const value = await ConfigurationValue.create(req.body);
            res.status(201).json(value);
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  COUPON MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getCoupons(req, res, next) {
        try {
            const { page, limit, search, isActive } = req.query;
            const result = await Coupon.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                search,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async createCoupon(req, res, next) {
        try {
            const coupon = await Coupon.create({ ...req.body, created_by: req.user.id });

            ActivityLog.create({
                userId: req.user.id, action: 'create_coupon', entityType: 'coupon',
                entityId: coupon.id, newValues: { code: coupon.code },
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.status(201).json({ message: 'Coupon created.', coupon });
        } catch (error) {
            next(error);
        }
    },

    async updateCoupon(req, res, next) {
        try {
            const coupon = await Coupon.update(req.params.id, req.body);
            if (!coupon) return res.status(404).json({ error: 'Coupon not found.' });
            res.json({ message: 'Coupon updated.', coupon });
        } catch (error) {
            next(error);
        }
    },

    async deleteCoupon(req, res, next) {
        try {
            const deleted = await Coupon.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Coupon not found.' });
            res.json({ message: 'Coupon deleted.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  INVENTORY MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getLowStock(req, res, next) {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
<<<<<<< HEAD
            const { rows } = await pool.query(`
                SELECT cv.id, cv.value, cv.stock_quantity, cv.stock_status,
                       co.name as option_name, co.type as option_type,
                       p.name as product_name, p.sku as product_sku, p.id as product_id
=======

            // Configurable products: low stock on configuration_values
            const { rows: configRows } = await pool.query(`
                SELECT cv.id, cv.value, cv.stock_quantity, cv.stock_status,
                       co.name as option_name, co.type as option_type,
                       p.name as product_name, p.sku as product_sku, p.id as product_id,
                       'configuration' as stock_type
>>>>>>> d1d77d0 (dashboard and variants edits)
                FROM configuration_values cv
                JOIN configuration_options co ON cv.option_id = co.id
                JOIN products p ON co.product_id = p.id
                WHERE cv.stock_quantity > 0 AND cv.stock_quantity <= $1
                ORDER BY cv.stock_quantity ASC
            `, [threshold]);
<<<<<<< HEAD
            res.json({ lowStock: rows, total: rows.length });
=======

            // Non-configurable products: low stock on products table
            const { rows: simpleRows } = await pool.query(`
                SELECT p.id, p.name as value, p.stock_quantity, p.stock_status,
                       'Product' as option_name, 'simple' as option_type,
                       p.name as product_name, p.sku as product_sku, p.id as product_id,
                       'product' as stock_type
                FROM products p
                WHERE p.is_configurable = false
                  AND p.is_active = true
                  AND p.stock_quantity > 0
                  AND p.stock_quantity <= $1
                ORDER BY p.stock_quantity ASC
            `, [threshold]);

            const allLowStock = [...configRows, ...simpleRows].sort((a, b) => a.stock_quantity - b.stock_quantity);
            res.json({ lowStock: allLowStock, total: allLowStock.length });
>>>>>>> d1d77d0 (dashboard and variants edits)
        } catch (error) {
            next(error);
        }
    },

    async adjustStock(req, res, next) {
        try {
            const { valueId, adjustment, reason } = req.body;
            if (!valueId || adjustment === undefined) {
                return res.status(400).json({ error: 'valueId and adjustment are required.' });
            }

            const { rows: oldRows } = await pool.query(`SELECT * FROM configuration_values WHERE id = $1`, [valueId]);
            if (oldRows.length === 0) return res.status(404).json({ error: 'Configuration value not found.' });

            const newQty = oldRows[0].stock_quantity + parseInt(adjustment);
            const newStatus = newQty <= 0 ? 'out_of_stock' : newQty < 10 ? 'low_stock' : 'in_stock';

            const { rows } = await pool.query(
                `UPDATE configuration_values SET stock_quantity = $1, stock_status = $2 WHERE id = $3 RETURNING *`,
                [Math.max(0, newQty), newStatus, valueId]
            );

            ActivityLog.create({
                userId: req.user.id,
                action: 'adjust_stock',
                entityType: 'configuration_value',
                entityId: valueId,
                oldValues: { stock_quantity: oldRows[0].stock_quantity },
                newValues: { stock_quantity: newQty, reason },
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Stock adjusted.', value: rows[0] });
        } catch (error) {
            next(error);
        }
    },

    async getStockMovements(req, res, next) {
        try {
            const { page = 1, limit = 50 } = req.query;
            const result = await ActivityLog.findAll({
                page: parseInt(page),
                limit: parseInt(limit),
                action: 'adjust_stock',
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  STAFF / USER MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getStaff(req, res, next) {
        try {
            const { rows } = await pool.query(
                `SELECT id, email, name, role, avatar_url, is_active, last_login_ip, created_at
         FROM users WHERE role IN ('super_admin', 'admin', 'manager') ORDER BY created_at DESC`
            );
            res.json({ staff: rows });
        } catch (error) {
            next(error);
        }
    },

    async updateStaffRole(req, res, next) {
        try {
            const { role } = req.body;
            const validRoles = ['admin', 'manager', 'user'];
            if (req.user.role !== 'super_admin') {
                return res.status(403).json({ error: 'Only super admins can change roles.' });
            }
            if (!validRoles.includes(role)) {
                return res.status(400).json({ error: 'Invalid role.' });
            }

            const user = await User.update(req.params.id, { role });
            if (!user) return res.status(404).json({ error: 'User not found.' });

            ActivityLog.create({
                userId: req.user.id, action: 'update_role', entityType: 'user',
                entityId: req.params.id, newValues: { role },
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Role updated.', user });
        } catch (error) {
            next(error);
        }
    },

    async createStaff(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            if (!name || !email || !password || !role) {
                return res.status(400).json({ error: 'All fields are required.' });
            }

            // Only super_admin can create admin/manager
            if (req.user.role !== 'super_admin' && ['admin', 'manager'].includes(role)) {
                return res.status(403).json({ error: 'Only super admins can create staff accounts.' });
            }

            const existingUser = await User.findByEmail(email);
            if (existingUser) return res.status(400).json({ error: 'User already exists.' });

            const user = await User.create({ name, email, password, role });

            ActivityLog.create({
                userId: req.user.id, action: 'create_staff', entityType: 'user',
                entityId: user.id, newValues: { email, role },
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.status(201).json({ message: 'Staff member created successfully.', user });
        } catch (error) {
            next(error);
        }
    },

    async toggleStaffStatus(req, res, next) {
        try {
            const { is_active } = req.body;
            if (is_active === undefined) return res.status(400).json({ error: 'is_active is required.' });

            if (req.user.role !== 'super_admin' && req.user.id !== req.params.id) {
                return res.status(403).json({ error: 'Not authorized.' });
            }

            const user = await User.setActive(req.params.id, is_active);
            if (!user) return res.status(404).json({ error: 'User not found.' });

            ActivityLog.create({
                userId: req.user.id, action: 'toggle_staff_status', entityType: 'user',
                entityId: req.params.id, newValues: { is_active },
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: `Staff member ${is_active ? 'activated' : 'deactivated'}.`, user });
        } catch (error) {
            next(error);
        }
    },

    async deleteStaff(req, res, next) {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(403).json({ error: 'Only super admins can delete accounts.' });
            }

            const deleted = await User.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'User not found.' });

            ActivityLog.create({
                userId: req.user.id, action: 'delete_staff', entityType: 'user',
                entityId: req.params.id,
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Staff member deleted.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  ACTIVITY LOGS
    // ═══════════════════════════════════════════════════════════
    async getActivityLogs(req, res, next) {
        try {
            const { page, limit, userId, entityType, action } = req.query;
            const result = await ActivityLog.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 50,
                userId, entityType, action,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  CONTACT MESSAGES (INBOX)
    // ═══════════════════════════════════════════════════════════
    async getContactMessages(req, res, next) {
        try {
            const { page, limit, status } = req.query;
            const result = await ContactMessage.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                status
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    async getContactMessageDetail(req, res, next) {
        try {
            const message = await ContactMessage.findById(req.params.id);
            if (!message) return res.status(404).json({ error: 'Message not found.' });

            if (message.status === 'unread') {
                await ContactMessage.updateStatus(message.id, 'read');
                message.status = 'read';
            }
            res.json(message);
        } catch (error) {
            next(error);
        }
    },

    async replyToContactMessage(req, res, next) {
        try {
            const { reply } = req.body;
            if (!reply) return res.status(400).json({ error: 'Reply content required.' });
            const message = await ContactMessage.reply(req.params.id, reply);
            if (!message) return res.status(404).json({ error: 'Message not found.' });
            res.json({ message: 'Reply saved and status updated.', contactMessage: message });
        } catch (error) {
            next(error);
        }
    },

    async deleteContactMessage(req, res, next) {
        try {
            const deleted = await ContactMessage.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Message not found.' });
            res.json({ message: 'Message deleted.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════
    async getNotifications(req, res, next) {
        try {
            const { limit, onlyUnread } = req.query;
            const notifications = await Notification.findAllForUser(req.user.id, {
                limit: parseInt(limit) || 20,
                onlyUnread: onlyUnread === 'true'
            });
            const unreadCount = await Notification.getUnreadCount(req.user.id);
            res.json({ notifications, unreadCount });
        } catch (error) {
            next(error);
        }
    },

    async markNotificationRead(req, res, next) {
        try {
            const notification = await Notification.markRead(req.params.id, req.user.id);
            if (!notification) return res.status(404).json({ error: 'Notification not found.' });
            res.json({ message: 'Notification marked as read.', notification });
        } catch (error) {
            next(error);
        }
    },

    async clearAllNotifications(req, res, next) {
        try {
            await Notification.markAllRead(req.user.id);
            res.json({ message: 'All notifications marked as read.' });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  SITE SETTINGS
    // ═══════════════════════════════════════════════════════════
    async getSettings(req, res, next) {
        try {
            const settings = await Setting.getAll();
            res.json(settings);
        } catch (error) {
            next(error);
        }
    },

    async updateSettings(req, res, next) {
        try {
            const { key, value } = req.body;
            if (!key || value === undefined) {
                return res.status(400).json({ error: 'Key and value are required.' });
            }

            const updated = await Setting.update(key, value);

            ActivityLog.create({
                userId: req.user.id, action: 'update_settings', entityType: 'setting',
                entityId: key, newValues: value,
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Setting updated.', setting: updated });
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  DATA EXPORT
    // ═══════════════════════════════════════════════════════════
    async exportData(req, res, next) {
        try {
            const { type } = req.params;
<<<<<<< HEAD
            let data = [];
            let fields = [];
            let filename = '';

            switch (type) {
                case 'products':
                    const { rows: products } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
                    data = products;
                    fields = ['id', 'sku', 'name', 'price', 'stock_quantity', 'is_active', 'is_featured', 'created_at'];
                    filename = 'products_export.csv';
                    break;
                case 'orders':
                    const { rows: orders } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
                    data = orders;
                    fields = ['id', 'order_number', 'total_amount', 'status', 'payment_status', 'shipping_address', 'created_at'];
                    filename = 'orders_export.csv';
                    break;
                case 'customers':
                    const { rows: customers } = await pool.query("SELECT id, email, name, phone, role, is_active, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC");
                    data = customers;
                    fields = ['id', 'email', 'name', 'phone', 'is_active', 'created_at'];
                    filename = 'customers_export.csv';
                    break;
                default:
                    return res.status(400).json({ error: 'Invalid export type.' });
=======
            // Whitelist export types
            const VALID_TYPES = ['products', 'orders', 'customers'];
            if (!VALID_TYPES.includes(type)) {
                return res.status(400).json({ error: 'Invalid export type.' });
            }

            let data = [];
            let fields = [];
            let filename = '';
            // Use LIMIT to prevent memory exhaustion — max 10,000 rows per export
            const EXPORT_LIMIT = 10000;

            switch (type) {
                case 'products': {
                    const { rows } = await pool.query(
                        'SELECT * FROM products ORDER BY created_at DESC LIMIT $1', [EXPORT_LIMIT]
                    );
                    data = rows;
                    fields = ['id', 'sku', 'name', 'base_price', 'is_active', 'is_featured', 'created_at'];
                    filename = 'products_export.csv';
                    break;
                }
                case 'orders': {
                    const { rows } = await pool.query(
                        'SELECT * FROM orders ORDER BY created_at DESC LIMIT $1', [EXPORT_LIMIT]
                    );
                    data = rows;
                    fields = ['id', 'order_number', 'total_amount', 'status', 'payment_status', 'created_at'];
                    filename = 'orders_export.csv';
                    break;
                }
                case 'customers': {
                    const { rows } = await pool.query(
                        "SELECT id, email, name, phone, role, is_active, created_at FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT $1",
                        [EXPORT_LIMIT]
                    );
                    data = rows;
                    fields = ['id', 'email', 'name', 'phone', 'is_active', 'created_at'];
                    filename = 'customers_export.csv';
                    break;
                }
>>>>>>> d1d77d0 (dashboard and variants edits)
            }

            const csv = jsonToCsv(data, fields);

            ActivityLog.create({
                userId: req.user.id, action: 'export_data', entityType: 'export',
                entityId: type,
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.setHeader('Content-Type', 'text/csv');
<<<<<<< HEAD
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
=======
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
>>>>>>> d1d77d0 (dashboard and variants edits)
            res.status(200).send(csv);
        } catch (error) {
            next(error);
        }
    },

    // ═══════════════════════════════════════════════════════════
    //  CURRENCY MANAGEMENT
    // ═══════════════════════════════════════════════════════════
    async getCurrencies(req, res, next) {
        try {
            const currencies = await Currency.findAll();
            res.json(currencies);
        } catch (error) {
            next(error);
        }
    },

    async createCurrency(req, res, next) {
        try {
            const currency = await Currency.create(req.body);

            ActivityLog.create({
                userId: req.user.id, action: 'create_currency', entityType: 'currency',
                entityId: currency.id, newValues: currency,
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.status(201).json({ message: 'Currency created.', currency });
        } catch (error) {
            next(error);
        }
    },

    async updateCurrency(req, res, next) {
        try {
            const currency = await Currency.update(req.params.id, req.body);
            if (!currency) return res.status(404).json({ error: 'Currency not found.' });

            ActivityLog.create({
                userId: req.user.id, action: 'update_currency', entityType: 'currency',
                entityId: req.params.id, newValues: req.body,
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Currency updated.', currency });
        } catch (error) {
            next(error);
        }
    },

    async deleteCurrency(req, res, next) {
        try {
            const deleted = await Currency.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Currency not found.' });

            ActivityLog.create({
                userId: req.user.id, action: 'delete_currency', entityType: 'currency',
                entityId: req.params.id,
                ipAddress: req.ip, userAgent: req.headers['user-agent'],
            }).catch(() => { });

            res.json({ message: 'Currency deleted.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = adminController;
