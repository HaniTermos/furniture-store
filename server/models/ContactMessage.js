const pool = require('../db/pool');

const ContactMessage = {
    async findAll({ page = 1, limit = 20, status } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT * FROM contact_messages`;
        const params = [];

        if (status) {
            query += ` WHERE status = $1`;
            params.push(status);
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);

        const { rows: countRows } = await pool.query(
            `SELECT COUNT(*) FROM contact_messages ${status ? 'WHERE status = $1' : ''}`,
            status ? [status] : []
        );

        return {
            messages: rows,
            total: parseInt(countRows[0].count)
        };
    },

    async findById(id) {
        const { rows } = await pool.query(`SELECT * FROM contact_messages WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async updateStatus(id, status) {
        const { rows } = await pool.query(
            `UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );
        return rows[0] || null;
    },

    async reply(id, replyText) {
        const { rows } = await pool.query(
            `UPDATE contact_messages SET admin_reply = $1, replied_at = CURRENT_TIMESTAMP, status = 'replied' WHERE id = $2 RETURNING *`,
            [replyText, id]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM contact_messages WHERE id = $1`, [id]);
        return rowCount > 0;
    }
};

module.exports = ContactMessage;
