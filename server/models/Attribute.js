const pool = require('../db/pool');

const Attribute = {
    // ─── ATTRIBUTES ──────────────────────────────────────────────
    async createAttribute({ name, slug, type, is_visible_on_product, is_used_for_variations, is_filterable, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO attributes 
             (name, slug, type, is_visible_on_product, is_used_for_variations, is_filterable, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, slug, type, is_visible_on_product !== false, is_used_for_variations || false, is_filterable !== false, sort_order]
        );
        return rows[0];
    },

    async findAllAttributes() {
        // Get all attributes with their values nested
        const { rows: attributes } = await pool.query(`SELECT * FROM attributes ORDER BY sort_order ASC, name ASC`);
        const { rows: values } = await pool.query(`SELECT * FROM attribute_values ORDER BY sort_order ASC, value ASC`);

        // Group values by attribute_id
        const attributesWithValues = attributes.map(attr => ({
            ...attr,
            values: values.filter(v => v.attribute_id === attr.id)
        }));

        return attributesWithValues;
    },

    async findAttributeById(id) {
        const { rows: attributes } = await pool.query(`SELECT * FROM attributes WHERE id = $1`, [id]);
        if (attributes.length === 0) return null;

        const { rows: values } = await pool.query(`SELECT * FROM attribute_values WHERE attribute_id = $1 ORDER BY sort_order ASC, value ASC`, [id]);
        return { ...attributes[0], values };
    },

    async updateAttribute(id, fields) {
        const ALLOWED_FIELDS = ['name', 'slug', 'type', 'is_visible_on_product', 'is_used_for_variations', 'is_filterable', 'sort_order'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map(k => fields[k]);

        const { rows } = await pool.query(
            `UPDATE attributes SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async deleteAttribute(id) {
        const { rowCount } = await pool.query(`DELETE FROM attributes WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    // ─── ATTRIBUTE VALUES ────────────────────────────────────────
    async createValue({ attribute_id, value, color_hex, image_url, slug, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO attribute_values 
             (attribute_id, value, color_hex, image_url, slug, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [attribute_id, value, color_hex, image_url, slug, sort_order]
        );
        return rows[0];
    },

    async updateValue(id, fields) {
        const ALLOWED_FIELDS = ['value', 'color_hex', 'image_url', 'slug', 'sort_order'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map(k => fields[k]);

        const { rows } = await pool.query(
            `UPDATE attribute_values SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async deleteValue(id) {
        const { rowCount } = await pool.query(`DELETE FROM attribute_values WHERE id = $1`, [id]);
        return rowCount > 0;
    }
};

module.exports = Attribute;
