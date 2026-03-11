const pool = require('../db/pool');

const Tag = {
    async create({ name, slug, description }) {
        const { rows } = await pool.query(
            `INSERT INTO tags (name, slug, description)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [name, slug, description]
        );
        return rows[0];
    },

    async findAll() {
        const { rows } = await pool.query(`
            SELECT t.*, COUNT(pt.product_id) as product_count
            FROM tags t
            LEFT JOIN product_tags pt ON t.id = pt.tag_id
            GROUP BY t.id
            ORDER BY t.name ASC
        `);
        return rows;
    },

    async findById(id) {
        const { rows } = await pool.query(`
            SELECT t.*, COUNT(pt.product_id) as product_count
            FROM tags t
            LEFT JOIN product_tags pt ON t.id = pt.tag_id
            WHERE t.id = $1
            GROUP BY t.id
        `, [id]);
        return rows[0] || null;
    },

    async update(id, fields) {
        const ALLOWED_FIELDS = ['name', 'slug', 'description'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);
        const { rows } = await pool.query(
            `UPDATE tags SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM tags WHERE id = $1`, [id]);
        return rowCount > 0;
    },
};

module.exports = Tag;
