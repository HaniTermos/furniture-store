const pool = require('../db/pool');

const OrderItem = {
    async createMany(order_id, items, client) {
        const db = client || pool;
        const results = [];
        for (const item of items) {
            const { rows } = await db.query(
                `INSERT INTO order_items
<<<<<<< HEAD
    (order_id, product_id, quantity, unit_price, total_price,
        configuration, product_name, product_sku)
VALUES($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING * `,
                [order_id, item.product_id,
=======
    (order_id, product_id, variant_id, quantity, unit_price, total_price,
        configuration, product_name, product_sku)
VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING * `,
                [order_id, item.product_id, item.variant_id || null,
>>>>>>> d1d77d0 (dashboard and variants edits)
                    item.quantity, item.unit_price, item.quantity * item.unit_price,
                    item.configuration ? JSON.stringify(item.configuration) : null,
                    item.product_name, item.product_sku]
            );
            results.push(rows[0]);
        }
        return results;
    },

    async findByOrder(order_id) {
        const { rows } = await pool.query(
            `SELECT oi.*,
    (SELECT url FROM product_images WHERE product_id = oi.product_id AND is_primary = true LIMIT 1) AS product_image
       FROM order_items oi
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
            [order_id]
        );
        return rows;
    },
};

module.exports = OrderItem;
