const pool = require('../db/pool');

const SizeGuide = {
    async create({ name, description, content_html, content_json }) {
        const { rows } = await pool.query(
            `INSERT INTO size_guides (name, description, content_html, content_json)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, description, content_html || null, content_json || null]
        );
        return rows[0];
    },

    async findAll() {
        const { rows } = await pool.query(`SELECT * FROM size_guides ORDER BY created_at DESC`);
        return rows;
    },

    async findById(id) {
        const { rows } = await pool.query(`SELECT * FROM size_guides WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async update(id, fields) {
        const ALLOWED_FIELDS = ['name', 'description', 'content_html', 'content_json'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);

        const { rows } = await pool.query(
            `UPDATE size_guides SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM size_guides WHERE id = $1`, [id]);
        return rowCount > 0;
    }
};

module.exports = SizeGuide;
