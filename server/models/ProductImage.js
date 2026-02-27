const pool = require('../db/pool');

const ProductImage = {
    async create({ product_id, url, alt_text, is_primary = false, sort_order = 0 }) {
        // If this is primary, unset other primaries first
        if (is_primary) {
            await pool.query(
                `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
                [product_id]
            );
        }
        const { rows } = await pool.query(
            `INSERT INTO product_images (product_id, url, alt_text, is_primary, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [product_id, url, alt_text, is_primary, sort_order]
        );
        return rows[0];
    },

    async findByProduct(product_id) {
        const { rows } = await pool.query(
            `SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC`,
            [product_id]
        );
        return rows;
    },

    async delete(id) {
        const { rows } = await pool.query(
            `DELETE FROM product_images WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0] || null;
    },

    async setPrimary(id, product_id) {
        await pool.query(
            `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
            [product_id]
        );
        const { rows } = await pool.query(
            `UPDATE product_images SET is_primary = true WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0] || null;
    },
};

module.exports = ProductImage;
