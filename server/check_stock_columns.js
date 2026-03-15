require('dotenv').config();
const pool = require('./db/pool');

(async () => {
    try {
        const r = await pool.query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='products' AND column_name IN ('stock_quantity','stock_status','low_stock_threshold') ORDER BY column_name"
        );
        console.log('Columns found:', r.rows.length);
        r.rows.forEach(row => console.log('  -', row.column_name, ':', row.data_type));

        const p = await pool.query(
            "SELECT name, is_configurable, stock_quantity, stock_status, low_stock_threshold FROM products LIMIT 5"
        );
        console.log('\nSample products:');
        p.rows.forEach(row => console.log(
            ' ', row.name,
            '| configurable:', row.is_configurable,
            '| stock:', row.stock_quantity,
            '| status:', row.stock_status,
            '| threshold:', row.low_stock_threshold
        ));

        await pool.end();
    } catch (e) {
        console.error('ERROR:', e.message);
        await pool.end();
    }
})();
