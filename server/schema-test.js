require('dotenv').config();
const pool = require('./db/pool');

async function run() {
    try {
        const { rows } = await pool.query('SELECT column_name, is_nullable, column_default FROM information_schema.columns WHERE table_name = $1', ['product_attributes']);
        console.table(rows);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
run();
