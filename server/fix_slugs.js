require('dotenv').config();
const pool = require('./db/pool');
const { generateSlug } = require('./utils/generateSlug');

async function fixSlugs() {
    try {
        console.log('🔍 Fetching all products...');
        const { rows: products } = await pool.query('SELECT id, name, slug FROM products');
        
        console.log(`📦 Found ${products.length} products to check.`);
        let fixCount = 0;

        for (const product of products) {
            const expectedSlug = generateSlug(product.name);
            if (product.slug !== expectedSlug) {
                console.log(`🛠  Fixing mismatch: "${product.name}"`);
                console.log(`   Current: ${product.slug}`);
                console.log(`   New:     ${expectedSlug}`);
                
                await pool.query('UPDATE products SET slug = $1 WHERE id = $2', [expectedSlug, product.id]);
                fixCount++;
            }
        }

        console.log(`✅ Finished! Fixed ${fixCount} products.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error fixing slugs:', err);
        process.exit(1);
    }
}

fixSlugs();
