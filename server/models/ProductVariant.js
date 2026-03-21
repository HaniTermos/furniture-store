const pool = require('../db/pool');

const ProductVariant = {
    async create({ product_id, sku, price, stock_quantity = 0, image_url, image_alt, is_default = false, is_active = true, position = 0, attributes = [] }) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Create variant
            const { rows: [variant] } = await client.query(
                `INSERT INTO product_variants 
                 (product_id, sku, price, stock_quantity, image_url, image_alt, is_default, is_active, position)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [product_id, sku, price, stock_quantity, image_url, image_alt, is_default, is_active, position]
            );
            
            // Link attributes
            for (const { attribute_id, option_id } of attributes) {
                // Link option to variant
                await client.query(
                    `INSERT INTO variant_attributes (variant_id, attribute_id, option_id)
                     VALUES ($1, $2, $3)`,
                    [variant.id, attribute_id, option_id]
                );
                
                // Ensure attribute is linked to the product itself
                await client.query(
                    `INSERT INTO product_attributes (product_id, attribute_id, is_required)
                     VALUES ($1, $2, true)
                     ON CONFLICT (product_id, attribute_id) DO NOTHING`,
                    [product_id, attribute_id]
                );
            }

            // Sync has_variants flag on product
            await client.query(
                `UPDATE products SET has_variants = true WHERE id = $1`,
                [product_id]
            );
            
            await client.query('COMMIT');
            return this.findById(variant.id);
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    async createMatrix(product_id, matrixRows) {
        const results = [];
        for (const row of matrixRows) {
            results.push(await this.create({
                product_id,
                sku: row.sku,
                price: row.price,
                stock_quantity: row.stock,
                image_url: row.image_url,
                image_alt: row.image_alt,
                is_default: row.is_default || false,
                is_active: row.is_active !== false,
                position: row.position || 0,
                attributes: row.attributes
            }));
        }
        return results;
    },

    async findById(id) {
        const { rows: [variant] } = await pool.query(
            `SELECT pv.*,
                    json_agg(
                        json_build_object(
                            'attribute_id', va.attribute_id,
                            'attribute_name', a.name,
                            'attribute_slug', a.slug,
                            'option_id', va.option_id,
                            'option_value', ao.value,
                            'option_color', ao.color_hex,
                            'option_image', ao.image_url
                        ) ORDER BY a.sort_order
                    ) FILTER (WHERE va.id IS NOT NULL) as attributes
             FROM product_variants pv
             LEFT JOIN variant_attributes va ON va.variant_id = pv.id
             LEFT JOIN attributes a ON a.id = va.attribute_id
             LEFT JOIN attribute_options ao ON ao.id = va.option_id
             WHERE pv.id = $1
             GROUP BY pv.id`,
            [id]
        );
        return variant || null;
    },

    async findByProduct(product_id, { activeOnly = true } = {}) {
        let query = `
            SELECT pv.*,
                   json_agg(
                       json_build_object(
                           'attribute_id', va.attribute_id,
                           'attribute_name', a.name,
                           'attribute_slug', a.slug,
                           'option_id', va.option_id,
                           'option_value', ao.value,
                           'option_color', ao.color_hex,
                           'option_image', ao.image_url
                       ) ORDER BY a.sort_order
                   ) FILTER (WHERE va.id IS NOT NULL) as attributes
             FROM product_variants pv
             LEFT JOIN variant_attributes va ON va.variant_id = pv.id
             LEFT JOIN attributes a ON a.id = va.attribute_id
             LEFT JOIN attribute_options ao ON ao.id = va.option_id
             WHERE pv.product_id = $1
        `;
        if (activeOnly) query += ` AND pv.is_active = true`;
        query += ` GROUP BY pv.id ORDER BY pv.position, pv.sku`;
        
        const { rows } = await pool.query(query, [product_id]);
        return rows;
    },

    // Find variant by exact attribute combination
    async findBySelection(product_id, selections) {
        // selections = { attribute_id: option_id, ... }
        const attrIds = Object.keys(selections);
        const optIds = Object.values(selections);
        
        if (attrIds.length === 0) return null;
        
        const { rows } = await pool.query(
            `SELECT pv.* FROM product_variants pv
             WHERE pv.product_id = $1 AND pv.is_active = true
               AND EXISTS (
                   SELECT 1 FROM variant_attributes va
                   WHERE va.variant_id = pv.id
                     AND va.attribute_id = ANY($2)
                     AND va.option_id = ANY($3)
                   GROUP BY va.variant_id
                   HAVING COUNT(DISTINCT va.attribute_id) = $4
               )`,
            [product_id, attrIds, optIds, attrIds.length]
        );
        return rows[0] || null;
    },

    async update(id, fields) {
        const allowed = ['sku', 'price', 'stock_quantity', 'image_url', 'image_alt', 'is_active', 'is_default', 'position', 'low_stock_threshold'];
        const keys = Object.keys(fields).filter(k => allowed.includes(k));
        if (!keys.length) return null;
        
        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const { rows } = await pool.query(
            `UPDATE product_variants SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
            [id, ...keys.map(k => fields[k])]
        );
        return rows[0];
    },

    // Atomic stock operations
    async decrementStock(id, quantity, client = pool) {
        const { rows } = await client.query(
            `UPDATE product_variants 
             SET stock_quantity = stock_quantity - $1
             WHERE id = $2 AND stock_quantity >= $1
             RETURNING id, sku, stock_quantity`,
            [quantity, id]
        );
        if (!rows.length) throw new Error(`Insufficient stock for variant ${id}`);
        return rows[0];
    },

    async incrementStock(id, quantity) {
        const { rows } = await pool.query(
            `UPDATE product_variants 
             SET stock_quantity = stock_quantity + $1
             WHERE id = $2 RETURNING *`,
            [quantity, id]
        );
        return rows[0];
    },

    async delete(id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            // Get product_id before deletion
            const { rows: [variant] } = await client.query(
                `SELECT product_id FROM product_variants WHERE id = $1`,
                [id]
            );

            if (!variant) {
                await client.query('ROLLBACK');
                return false;
            }

            const { rowCount } = await client.query(
                `DELETE FROM product_variants WHERE id = $1`,
                [id]
            );

            // Check if any variants remain
            const { rows: [remaining] } = await client.query(
                `SELECT COUNT(*) FROM product_variants WHERE product_id = $1`,
                [variant.product_id]
            );

            if (parseInt(remaining.count) === 0) {
                await client.query(
                    `UPDATE products SET has_variants = false WHERE id = $1`,
                    [variant.product_id]
                );
            }

            await client.query('COMMIT');
            return rowCount > 0;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // Bulk operations
    async deleteByProduct(product_id) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            
            const { rowCount } = await client.query(
                `DELETE FROM product_variants WHERE product_id = $1`,
                [product_id]
            );

            await client.query(
                `UPDATE products SET has_variants = false WHERE id = $1`,
                [product_id]
            );

            await client.query('COMMIT');
            return rowCount;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    // SKU Generator helper
    generateSKU(productName, combination, index) {
        const prefix = productName.replace(/[^A-Z]/gi, '').substring(0, 3).toUpperCase();
        const parts = combination.map(c => 
            (c.option_value || c.value || '').replace(/[^A-Z0-9]/gi, '').substring(0, 3).toUpperCase()
        );
        return `${prefix}-${parts.join('-')}-${String(index + 1).padStart(3, '0')}`;
    },

    // Get price range for product
    async getPriceRange(product_id) {
        const { rows } = await pool.query(
            `SELECT MIN(price) as min_price, MAX(price) as max_price
             FROM product_variants
             WHERE product_id = $1 AND is_active = true`,
            [product_id]
        );
        return rows[0] || { min_price: null, max_price: null };
    }
};

module.exports = ProductVariant;

