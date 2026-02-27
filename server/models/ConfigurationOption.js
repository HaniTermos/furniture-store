const pool = require('../db/pool');

const ConfigurationOption = {
    async create({ product_id, name, type, is_required = true, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO configuration_options (product_id, name, type, is_required, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [product_id, name, type, is_required, sort_order]
        );
        return rows[0];
    },

    async findByProduct(product_id) {
        const { rows } = await pool.query(
            `SELECT * FROM configuration_options
       WHERE product_id = $1
       ORDER BY sort_order ASC`,
            [product_id]
        );
        return rows;
    },

    async findById(id) {
        const { rows } = await pool.query(
            `SELECT * FROM configuration_options WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async update(id, fields) {
        const keys = Object.keys(fields);
        if (keys.length === 0) return null;
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);
        const { rows } = await pool.query(
            `UPDATE configuration_options SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(
            `DELETE FROM configuration_options WHERE id = $1`,
            [id]
        );
        return rowCount > 0;
    },

    async findWithValues(product_id) {
        const options = await this.findByProduct(product_id);
        for (const opt of options) {
            const { rows: values } = await pool.query(
                `SELECT * FROM configuration_values WHERE option_id = $1 ORDER BY created_at ASC`,
                [opt.id]
            );
            opt.values = values;
        }
        return options;
    },
};

module.exports = ConfigurationOption;
