const pool = require('../db/pool');

const Attribute = {
    // Attribute Types (Color, Size, Material)
    async createAttribute({ name, slug, type = 'select', is_visible_on_product = true, is_used_for_variations = false, is_filterable = true, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO attributes 
             (name, slug, type, is_visible_on_product, is_used_for_variations, is_filterable, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, slug, type, is_visible_on_product, is_used_for_variations, is_filterable, sort_order]
        );
        return rows[0];
    },

    async findAllAttributes({ includeOptions = true } = {}) {
        const { rows: attributes } = await pool.query(`SELECT * FROM attributes ORDER BY sort_order ASC, name ASC`);
        
        if (includeOptions) {
            const { rows: options } = await pool.query(`SELECT * FROM attribute_options ORDER BY sort_order ASC, value ASC`);
            return attributes.map(attr => ({
                ...attr,
                options: options.filter(o => o.attribute_id === attr.id)
            }));
        }
        return attributes;
    },

    async findAttributeById(id) {
        const { rows: attributes } = await pool.query(`SELECT * FROM attributes WHERE id = $1`, [id]);
        if (attributes.length === 0) return null;

        const { rows: options } = await pool.query(`SELECT * FROM attribute_options WHERE attribute_id = $1 ORDER BY sort_order ASC, value ASC`, [id]);
        return { ...attributes[0], options };
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

    // Options (Red, Blue, 100cm, etc.)
    async createOption({ attribute_id, value, slug, color_hex, image_url, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO attribute_options 
             (attribute_id, value, slug, color_hex, image_url, sort_order)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [attribute_id, value, slug, color_hex, image_url, sort_order]
        );
        return rows[0];
    },

    async updateOption(id, fields) {
        const allowed = ['value', 'slug', 'color_hex', 'image_url', 'sort_order'];
        const keys = Object.keys(fields).filter(k => allowed.includes(k));
        if (!keys.length) return null;
        
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const { rows } = await pool.query(
            `UPDATE attribute_options SET ${setClause} WHERE id = $1 RETURNING *`,
            [id, ...keys.map(k => fields[k])]
        );
        return rows[0];
    },

    async deleteOption(id) {
        // Check usage
        const { rows } = await pool.query(
            `SELECT COUNT(*) FROM variant_attributes WHERE option_id = $1`,
            [id]
        );
        if (parseInt(rows[0].count) > 0) {
            throw new Error('Option in use by variants');
        }
        await pool.query(`DELETE FROM attribute_options WHERE id = $1`, [id]);
        return true;
    },

    // Product-Attribute Assignment
    async assignToProduct(product_id, attribute_id, { is_required = true, sort_order = 0 }) {
        const { rows } = await pool.query(
            `INSERT INTO product_attributes (product_id, attribute_id, is_required, sort_order)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (product_id, attribute_id) 
             DO UPDATE SET is_required = $3, sort_order = $4
             RETURNING *`,
            [product_id, attribute_id, is_required, sort_order]
        );
        return rows[0];
    },

    async removeFromProduct(product_id, attribute_id) {
        await pool.query(
            `DELETE FROM product_attributes WHERE product_id = $1 AND attribute_id = $2`,
            [product_id, attribute_id]
        );
        return true;
    },

    async getProductAttributes(product_id) {
        const { rows } = await pool.query(
            `SELECT a.*, pa.is_required, pa.sort_order as product_sort
             FROM attributes a
             JOIN product_attributes pa ON pa.attribute_id = a.id
             WHERE pa.product_id = $1
             ORDER BY pa.sort_order`,
            [product_id]
        );
        
        for (const attr of rows) {
            const { rows: options } = await pool.query(
                `SELECT DISTINCT ao.* FROM attribute_options ao
                 JOIN variant_attributes va ON va.option_id = ao.id
                 JOIN product_variants pv ON pv.id = va.variant_id
                 WHERE ao.attribute_id = $1 AND pv.product_id = $2 AND pv.is_active = true
                 ORDER BY ao.sort_order`,
                [attr.id, product_id]
            );
            
            // If no active variant options found, fetch all assigned for this attribute as fallback
            // This is useful for admin views or before variants are created.
            if (options.length === 0) {
                const { rows: allOptions } = await pool.query(
                    `SELECT * FROM attribute_options 
                     WHERE attribute_id = $1 
                     ORDER BY sort_order`,
                    [attr.id]
                );
                attr.options = allOptions;
            } else {
                attr.options = options;
            }
        }
        return rows;
    },

    async findWithValuesByProductIds(productIds) {
        if (!productIds || productIds.length === 0) return {};

        const { rows: assignments } = await pool.query(
            `SELECT pa.product_id, a.*, pa.is_required, pa.sort_order as product_sort
             FROM attributes a
             JOIN product_attributes pa ON pa.attribute_id = a.id
             WHERE pa.product_id = ANY($1::uuid[])
             ORDER BY pa.sort_order`,
            [productIds]
        );

        if (assignments.length === 0) return {};

        // Fetch options used in ACTIVE variants for these products
        const { rows: activeOptions } = await pool.query(
            `SELECT DISTINCT ao.*, pv.product_id as opt_product_id
             FROM attribute_options ao
             JOIN variant_attributes va ON va.option_id = ao.id
             JOIN product_variants pv ON pv.id = va.variant_id
             WHERE pv.product_id = ANY($1::uuid[]) 
             AND pv.is_active = true
             ORDER BY ao.sort_order`,
            [productIds]
        );

        // Fetch ALL options for the assigned attributes (as fallback)
        const attributeIds = [...new Set(assignments.map(a => a.id))];
        const { rows: allOptions } = await pool.query(
            `SELECT * FROM attribute_options WHERE attribute_id = ANY($1::uuid[]) ORDER BY sort_order`,
            [attributeIds]
        );

        const productMap = {};
        for (const assignment of assignments) {
            const attr = { ...assignment };
            
            // Filter options that lead to an active variant
            let options = activeOptions.filter(o => 
                o.attribute_id === attr.id && o.opt_product_id === attr.product_id
            );
            
            if (options.length === 0) {
                // FALLBACK: If no active variants, show all options for this attribute
                // (Matches getProductAttributes behavior for consistency)
                options = allOptions.filter(o => o.attribute_id === attr.id);
            }
            
            attr.options = options;
            
            if (!productMap[attr.product_id]) productMap[attr.product_id] = [];
            productMap[attr.product_id].push(attr);
        }
        return productMap;
    }
};

module.exports = Attribute;
