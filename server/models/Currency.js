const pool = require('../db/pool');

const Currency = {
    async findAll() {
        const { rows } = await pool.query('SELECT * FROM currencies ORDER BY is_base DESC, code ASC');
        return rows;
    },

    async findActive() {
        const { rows } = await pool.query('SELECT * FROM currencies WHERE is_active = true ORDER BY is_base DESC, code ASC');
        return rows;
    },

    async create({ code, name, symbol, exchange_rate, is_base = false, is_active = true, decimal_places = 2, symbol_position = 'before' }) {
        if (is_base) {
            await pool.query('UPDATE currencies SET is_base = false');
            exchange_rate = 1.0;
        }

        const { rows } = await pool.query(
            `INSERT INTO currencies (code, name, symbol, exchange_rate, is_base, is_active, decimal_places, symbol_position)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [code.toUpperCase(), name, symbol, exchange_rate, is_base, is_active, decimal_places, symbol_position]
        );
        return rows[0];
    },

    async update(id, fields) {
        if (fields.is_base) {
            await pool.query('UPDATE currencies SET is_base = false WHERE id != $1', [id]);
            fields.exchange_rate = 1.0;
        }

        const ALLOWED_FIELDS = ['name', 'symbol', 'exchange_rate', 'is_base', 'is_active', 'decimal_places', 'symbol_position'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map(k => fields[k]);

        const { rows } = await pool.query(
            `UPDATE currencies SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0];
    },

    async delete(id) {
        const { rows } = await pool.query('SELECT is_base FROM currencies WHERE id = $1', [id]);
        if (rows[0] && rows[0].is_base) {
            throw new Error('Cannot delete base currency');
        }

        const { rowCount } = await pool.query('DELETE FROM currencies WHERE id = $1', [id]);
        return rowCount > 0;
    }
};

module.exports = Currency;
