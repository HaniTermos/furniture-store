const pool = require('../db/pool');

const ConfigurationValue = {
    async create({ option_id, value, price_adjustment = 0, image_url, thumbnail_url, stock_status = 'in_stock', stock_quantity = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO configuration_values
        (option_id, value, price_adjustment, image_url, thumbnail_url, stock_status, stock_quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [option_id, value, price_adjustment, image_url, thumbnail_url, stock_status, stock_quantity]
        );
        return rows[0];
    },

    async findByOption(option_id) {
        const { rows } = await pool.query(
            `SELECT * FROM configuration_values WHERE option_id = $1 ORDER BY created_at ASC`,
            [option_id]
        );
        return rows;
    },

    async findById(id) {
        const { rows } = await pool.query(
            `SELECT * FROM configuration_values WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async findByIds(ids) {
        if (!ids || ids.length === 0) return [];
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
        const { rows } = await pool.query(
            `SELECT * FROM configuration_values WHERE id IN (${placeholders})`,
            ids
        );
        return rows;
    },

    async update(id, fields) {
        const keys = Object.keys(fields);
        if (keys.length === 0) return null;
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);
        const { rows } = await pool.query(
            `UPDATE configuration_values SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(
            `DELETE FROM configuration_values WHERE id = $1`,
            [id]
        );
        return rowCount > 0;
    },
};

module.exports = ConfigurationValue;
