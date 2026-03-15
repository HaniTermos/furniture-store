require('dotenv').config();
const pool = require('./pool');

async function seedVariantProduct() {
    try {
        // 1. Create a Category if not exists
        const catRes = await pool.query(`INSERT INTO categories (name, slug) VALUES ('Test Chairs', 'test-chairs') ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`);
        const catId = catRes.rows[0].id;

        // 2. Create Product
        const prodRes = await pool.query(
            `INSERT INTO products (name, slug, sku, description, short_description, base_price, category_id, has_variants, is_active)
             VALUES ('Variant Test Chair', 'variant-test-chair', 'VTC-001', 'A test chair for variants', 'Test chair', 100.00, $1, true, true)
             ON CONFLICT (slug) DO UPDATE SET has_variants = true RETURNING id`, [catId]
        );
        const prodId = prodRes.rows[0].id;

        // 3. Create Attributes (Color, Size)
        const attrResColor = await pool.query(`INSERT INTO attributes (name, slug, type) VALUES ('Color', 'color', 'color') ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`);
        const colorAttrId = attrResColor.rows[0].id;
        
        const attrResSize = await pool.query(`INSERT INTO attributes (name, slug, type) VALUES ('Size', 'size', 'select') ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id`);
        const sizeAttrId = attrResSize.rows[0].id;

        // 4. Create Attribute Options
        const optRed = await pool.query(`INSERT INTO attribute_options (attribute_id, value, slug, color_hex) VALUES ($1, 'Red', 'red', '#ff0000') ON CONFLICT (attribute_id, slug) DO UPDATE SET value = EXCLUDED.value RETURNING id`, [colorAttrId]);
        const optBlue = await pool.query(`INSERT INTO attribute_options (attribute_id, value, slug, color_hex) VALUES ($1, 'Blue', 'blue', '#0000ff') ON CONFLICT (attribute_id, slug) DO UPDATE SET value = EXCLUDED.value RETURNING id`, [colorAttrId]);
        
        const optSmall = await pool.query(`INSERT INTO attribute_options (attribute_id, value, slug) VALUES ($1, 'Small', 'small') ON CONFLICT (attribute_id, slug) DO UPDATE SET value = EXCLUDED.value RETURNING id`, [sizeAttrId]);
        const optLarge = await pool.query(`INSERT INTO attribute_options (attribute_id, value, slug) VALUES ($1, 'Large', 'large') ON CONFLICT (attribute_id, slug) DO UPDATE SET value = EXCLUDED.value RETURNING id`, [sizeAttrId]);

        // 5. Link attributes to product
        await pool.query(`INSERT INTO product_attributes (product_id, attribute_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [prodId, colorAttrId]);
        await pool.query(`INSERT INTO product_attributes (product_id, attribute_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [prodId, sizeAttrId]);

        // 6. Create Variants
        const var1 = await pool.query(
            `INSERT INTO product_variants (product_id, sku, price, stock_quantity, is_active) VALUES ($1, 'VTC-RED-SM', 100.00, 10, true) RETURNING id`, [prodId]
        );
        const var2 = await pool.query(
            `INSERT INTO product_variants (product_id, sku, price, stock_quantity, is_active) VALUES ($1, 'VTC-BLUE-LG', 150.00, 5, true) RETURNING id`, [prodId]
        );

        // 7. Link variant attributes
        // var1 = Red + Small
        await pool.query(`INSERT INTO variant_attributes (variant_id, attribute_id, option_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [var1.rows[0].id, colorAttrId, optRed.rows[0].id]);
        await pool.query(`INSERT INTO variant_attributes (variant_id, attribute_id, option_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [var1.rows[0].id, sizeAttrId, optSmall.rows[0].id]);
        
        // var2 = Blue + Large
        await pool.query(`INSERT INTO variant_attributes (variant_id, attribute_id, option_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [var2.rows[0].id, colorAttrId, optBlue.rows[0].id]);
        await pool.query(`INSERT INTO variant_attributes (variant_id, attribute_id, option_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`, [var2.rows[0].id, sizeAttrId, optLarge.rows[0].id]);

        console.log('Successfully seeded variant product.');
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

seedVariantProduct();
