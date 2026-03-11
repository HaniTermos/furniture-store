const pool = require('../db/pool');

const Review = {
    async create({ user_id, product_id, order_id, rating, title, comment }) {
        // Check for verified purchase
        let isVerified = false;
        if (order_id) {
            const { rows } = await pool.query(
                `SELECT id FROM order_items WHERE order_id = $1 AND product_id = $2 LIMIT 1`,
                [order_id, product_id]
            );
            isVerified = rows.length > 0;
        }

        const { rows } = await pool.query(
            `INSERT INTO reviews (user_id, product_id, order_id, rating, title, comment, is_verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, product_id, order_id || null, rating, title, comment, isVerified]
        );
        return rows[0];
    },

    async findByProduct(product_id, { page = 1, limit = 10, approvedOnly = true } = {}) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT r.*, u.name AS user_name, u.avatar_url AS user_avatar
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.product_id = $1
    `;
        const params = [product_id];
        if (approvedOnly) {
            query += ` AND r.is_approved = true`;
        }
        query += ` ORDER BY r.created_at DESC LIMIT $2 OFFSET $3`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);

        // Count
        let countQuery = `SELECT COUNT(*) FROM reviews WHERE product_id = $1`;
        const countParams = [product_id];
        if (approvedOnly) {
            countQuery += ` AND is_approved = true`;
        }
        const { rows: countRows } = await pool.query(countQuery, countParams);

        // Stats
        const { rows: statsRows } = await pool.query(
            `SELECT COALESCE(AVG(rating), 0) AS avg_rating, COUNT(*) AS total
       FROM reviews WHERE product_id = $1 AND is_approved = true`,
            [product_id]
        );

        return {
            reviews: rows,
            total: parseInt(countRows[0].count),
            avgRating: parseFloat(statsRows[0].avg_rating).toFixed(1),
            totalApproved: parseInt(statsRows[0].total),
        };
    },

    async findById(id) {
        const { rows } = await pool.query(`SELECT * FROM reviews WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async approve(id) {
        const { rows } = await pool.query(
            `UPDATE reviews SET is_approved = true WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0] || null;
    },

    async adminReply(id, reply) {
        const { rows } = await pool.query(
            `UPDATE reviews SET admin_reply = $1, admin_reply_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
            [reply, id]
        );
        return rows[0] || null;
    },

    async toggleFeatured(id) {
        const { rows } = await pool.query(
            `UPDATE reviews SET is_featured = NOT is_featured WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM reviews WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    async findAll({ page = 1, limit = 20, isApproved } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT r.*, u.name AS user_name, p.name AS product_name
                 FROM reviews r
                 JOIN users u ON u.id = r.user_id
                 JOIN products p ON p.id = r.product_id`;
        const params = [];
        if (isApproved !== undefined) {
            query += ` WHERE r.is_approved = $1`;
            params.push(isApproved);
        }
        query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);
        const { rows } = await pool.query(query, params);
        return rows;
    },
};

module.exports = Review;
