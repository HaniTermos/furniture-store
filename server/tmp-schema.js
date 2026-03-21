require('dotenv').config();
const pool = require('./db/pool');

async function checkProducts() {
    try {
        const res = await pool.query('SELECT id, name, slug FROM products ORDER BY created_at DESC LIMIT 20');
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkProducts();
