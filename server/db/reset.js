// db/reset.js
const pool = require('./pool');

async function reset() {
    try {
        console.log('⚠️  WARNING: This will delete all data!');
        console.log('Dropping all tables...');

        await pool.query(`
            DROP TABLE IF EXISTS reviews CASCADE;
            DROP TABLE IF EXISTS order_items CASCADE;
            DROP TABLE IF EXISTS orders CASCADE;
            DROP TABLE IF EXISTS saved_design_selections CASCADE;
            DROP TABLE IF EXISTS saved_designs CASCADE;
            DROP TABLE IF EXISTS cart_items CASCADE;
            DROP TABLE IF EXISTS configuration_values CASCADE;
            DROP TABLE IF EXISTS configuration_options CASCADE;
            DROP TABLE IF EXISTS product_images CASCADE;
            DROP TABLE IF EXISTS products CASCADE;
            DROP TABLE IF EXISTS categories CASCADE;
            DROP TABLE IF EXISTS users CASCADE;
        `);

        console.log('✅ All tables dropped');
        console.log('Run "npm run migrate" to recreate tables');
        process.exit(0);
    } catch (error) {
        console.error('❌ Reset failed:', error.message);
        process.exit(1);
    }
}

reset();