const pool = require('../db/pool');

const Category = {
    async create({ name, slug, description, image_url, parent_id, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO categories (name, slug, description, image_url, parent_id, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [name, slug, description, image_url, parent_id, sort_order]
        );
        return rows[0];
    },

    async findAll({ activeOnly = false } = {}) {
        let query = `SELECT * FROM categories`;
        if (activeOnly) query += ` WHERE is_active = true`;
        query += ` ORDER BY sort_order ASC, name ASC`;
        const { rows } = await pool.query(query);
        return rows;
    },

    async findById(id) {
        const { rows } = await pool.query(`SELECT * FROM categories WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async findBySlug(slug) {
        const { rows } = await pool.query(`SELECT * FROM categories WHERE slug = $1`, [slug]);
        return rows[0] || null;
    },

    async update(id, fields) {
        // Whitelist allowed fields
        const ALLOWED_FIELDS = ['name', 'slug', 'description', 'image_url', 'parent_id', 'sort_order', 'is_active'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);
        const { rows } = await pool.query(
            `UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM categories WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    async getTree() {
        const { rows } = await pool.query(
            `SELECT * FROM categories WHERE is_active = true ORDER BY sort_order ASC, name ASC`
        );
        // Build tree structure
        const map = {};
        const tree = [];
        rows.forEach((cat) => {
            map[cat.id] = { ...cat, children: [] };
        });
        rows.forEach((cat) => {
            if (cat.parent_id && map[cat.parent_id]) {
                map[cat.parent_id].children.push(map[cat.id]);
            } else {
                tree.push(map[cat.id]);
            }
        });
        return tree;
    },
};

module.exports = Category;
