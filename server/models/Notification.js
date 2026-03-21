const pool = require('../db/pool');

const Notification = {
    async findAllForUser(userId, { limit = 20, onlyUnread = false } = {}) {
        let query = `SELECT * FROM notifications WHERE user_id = $1`;
        const params = [userId];

        if (onlyUnread) {
            query += ` AND is_read = false`;
        }

        query += ` ORDER BY created_at DESC LIMIT $2`;
        params.push(limit);

        const { rows } = await pool.query(query, params);
        return rows;
    },

    async getUnreadCount(userId) {
        const { rows } = await pool.query(
            `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return parseInt(rows[0].count);
    },

    async markRead(id, userId) {
        const { rows } = await pool.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, userId]
        );
        return rows[0] || null;
    },

    async markAllRead(userId) {
        const { rowCount } = await pool.query(
            `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return rowCount;
    },

    async create({ userId, type, title, message, link }, dbClient = pool) {
        const { rows } = await dbClient.query(
            `INSERT INTO notifications (user_id, type, title, message, link)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, type, title, message, link]
        );
        return rows[0];
    },

    async delete(id, userId) {
        const { rowCount } = await pool.query(
            `DELETE FROM notifications WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );
        return rowCount > 0;
    }
};

module.exports = Notification;
