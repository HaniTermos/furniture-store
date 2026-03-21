const pool = require('./server/db/pool');
const ProductVariant = require('./server/models/ProductVariant');

async function testVariant() {
    try {
        console.log("Testing variant creation with attributes...");
        
        // Let's use the most recent product
        const { rows: products } = await pool.query(`
            SELECT id, name FROM products ORDER BY created_at DESC LIMIT 1
        `);
        if (products.length === 0) return console.log("No products found to test with.");
        const product = products[0];

        // Pick distinct attributes
        const { rows: attributes } = await pool.query(`
            SELECT DISTINCT ON (a.id) a.id as attribute_id, ao.id as option_id, a.name, ao.value 
            FROM attributes a 
            JOIN attribute_options ao ON ao.attribute_id = a.id 
            LIMIT 2
        `);

        if (attributes.length === 0) return console.log("No attributes found.");

        const testSku = `TEST-VAR-${Date.now()}`;
        console.log(`Creating variant ${testSku} for product ${product.name}`);
        
        // 1. Create the variant
        const variant = await ProductVariant.create({
            product_id: product.id,
            sku: testSku,
            price: 199.99,
            stock_quantity: 10,
            attributes: attributes
        });
        
        console.log("\nVariant created successfully:", variant.id);

        // 2. Verify product_attributes were created
        const { rows: assigned } = await pool.query(`
            SELECT a.name 
            FROM product_attributes pa
            JOIN attributes a ON a.id = pa.attribute_id
            WHERE pa.product_id = $1
        `, [product.id]);

        console.log("\nAssigned attributes for product:");
        console.table(assigned);

        // 3. Cleanup
        await ProductVariant.delete(variant.id);
        console.log("\nTest variant deleted.");

    } catch (err) {
        console.error("Error during test:", err);
    } finally {
        pool.end();
    }
}

testVariant();
