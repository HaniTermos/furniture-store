const pool = require('../db/pool');

const Order = {
    async create(data, client) {
        const db = client || pool;
        const {
            order_number, user_id, subtotal, tax_amount = 0, shipping_amount = 0,
            discount_amount = 0, total_amount, shipping_address, billing_address,
            payment_method, payment_intent_id, notes,
        } = data;
        const { rows } = await db.query(
            `INSERT INTO orders
        (order_number, user_id, subtotal, tax_amount, shipping_amount,
         discount_amount, total_amount, shipping_address, billing_address,
         payment_method, payment_intent_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
            [order_number, user_id, subtotal, tax_amount, shipping_amount,
                discount_amount, total_amount,
                JSON.stringify(shipping_address), JSON.stringify(billing_address),
                payment_method, payment_intent_id, notes]
        );
        return rows[0];
    },

    async findById(id) {
        const { rows } = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async findByOrderNumber(orderNumber) {
        const { rows } = await pool.query(
            `SELECT * FROM orders WHERE order_number = $1`,
            [orderNumber]
        );
        return rows[0] || null;
    },

    async findByUser(user_id, { page = 1, limit = 10 } = {}) {
        const offset = (page - 1) * limit;
        const { rows } = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [user_id, limit, offset]
        );
        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) FROM orders WHERE user_id = $1`,
            [user_id]
        );
        return { orders: rows, total: parseInt(countRows[0].count) };
    },

    async findAll({ page = 1, limit = 20, status } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT o.*, u.name AS user_name, u.email AS user_email FROM orders o LEFT JOIN users u ON u.id = o.user_id`;
        const params = [];
        if (status) {
            query += ` WHERE o.status = $1`;
            params.push(status);
        }
        query += ` ORDER BY o.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        const { rows } = await pool.query(query, params);

        let countQuery = `SELECT COUNT(*) FROM orders`;
        const countParams = [];
        if (status) {
            countQuery += ` WHERE status = $1`;
            countParams.push(status);
        }
        const { rows: countRows } = await pool.query(countQuery, countParams);
        return { orders: rows, total: parseInt(countRows[0].count) };
    },

    async updateStatus(id, status) {
        const extra = {};
        if (status === 'shipped') extra.shipped_at = new Date();
        if (status === 'delivered') extra.delivered_at = new Date();
        const setClauses = [`status = $2`, `updated_at = CURRENT_TIMESTAMP`];
        const params = [id, status];
        let idx = 3;
        for (const [key, val] of Object.entries(extra)) {
            setClauses.push(`${key} = $${idx++}`);
            params.push(val);
        }
        const { rows } = await pool.query(
            `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
            params
        );
        return rows[0] || null;
    },

    async updatePaymentStatus(id, paymentStatus, paymentIntentId) {
        const setClauses = [`payment_status = $2`, `updated_at = CURRENT_TIMESTAMP`];
        const params = [id, paymentStatus];
        if (paymentStatus === 'completed') {
            setClauses.push(`paid_at = $3`);
            params.push(new Date());
        }
        if (paymentIntentId) {
            setClauses.push(`payment_intent_id = $${params.length + 1}`);
            params.push(paymentIntentId);
        }
        const { rows } = await pool.query(
            `UPDATE orders SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
            params
        );
        return rows[0] || null;
    },

    async getStats() {
        const { rows } = await pool.query(`
      SELECT
        COUNT(*) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(AVG(total_amount), 0) AS avg_order_value,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) AS processing_count,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) AS shipped_count,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) AS cancelled_count
      FROM orders
    `);
        return rows[0];
    },

    async getRecentOrders(limit = 5) {
        const { rows } = await pool.query(
            `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC LIMIT $1`,
            [limit]
        );
        return rows;
    },
};

module.exports = Order;
