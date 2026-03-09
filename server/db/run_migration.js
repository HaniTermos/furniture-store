// server/db/run_migration.js
const pool = require('./pool');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'migrations', 'add_product_fields.sql'), 'utf8');
        await pool.query(sql);
        console.log('✅ Migration successful');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

run();
