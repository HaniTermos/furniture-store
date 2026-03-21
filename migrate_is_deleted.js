const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });
const pool = require('./server/db/pool');

async function migrate() {
    try {
        console.log('Adding is_deleted column to products table...');
        await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false');
        console.log('Migration successful.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
