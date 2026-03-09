const pool = require('./db/pool');
async function check() {
    try {
        const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 5');
        console.log(JSON.stringify(rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();
