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

    async findWithValuesByProductIds(productIds) {
        if (!productIds || productIds.length === 0) return {};

        const { rows: options } = await pool.query(
            `SELECT * FROM configuration_options WHERE product_id = ANY($1::uuid[]) ORDER BY sort_order ASC`,
            [productIds]
        );

        if (options.length === 0) return {};

        const optionIds = options.map(o => o.id);
        const { rows: values } = await pool.query(
            `SELECT * FROM configuration_values WHERE option_id = ANY($1::uuid[]) ORDER BY created_at ASC`,
            [optionIds]
        );

        const optionsMap = {};
        for (const opt of options) {
            opt.values = values.filter(v => v.option_id === opt.id);
            if (!optionsMap[opt.product_id]) optionsMap[opt.product_id] = [];
            optionsMap[opt.product_id].push(opt);
        }
        return optionsMap;
    }
};

module.exports = ConfigurationOption;
