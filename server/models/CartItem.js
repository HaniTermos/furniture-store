const pool = require('../config/database'); // Note typo correction to config/database

const CartItem = {
    async add({ user_id, session_id, product_id, quantity, configuration, unit_price }, dbClient = pool) {
        // Check if same product + config already in cart
        const existingQuery = user_id
            ? `SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2 AND configuration = $3`
            : `SELECT * FROM cart_items WHERE session_id = $1 AND product_id = $2 AND configuration = $3`;
        const identifier = user_id || session_id;
        const configJson = configuration ? JSON.stringify(configuration) : null;

        const { rows: existing } = await dbClient.query(existingQuery, [identifier, product_id, configJson]);

        if (existing.length > 0) {
            // Update quantity
            const { rows } = await dbClient.query(
                `UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
                [quantity, existing[0].id]
            );
            return rows[0];
        }

        const { rows } = await dbClient.query(
            `INSERT INTO cart_items (user_id, session_id, product_id, quantity, configuration, unit_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id || null, session_id || null, product_id, quantity, configJson, unit_price]
        );
        return rows[0];
    },

    async findByUser(user_id) {
        const { rows } = await pool.query(
            `SELECT ci.*, p.name AS product_name, p.slug AS product_slug, p.base_price,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS product_image
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`,
            [user_id]
        );
        return rows;
    },

    async findBySession(session_id) {
        const { rows } = await pool.query(
            `SELECT ci.*, p.name AS product_name, p.slug AS product_slug, p.base_price,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS product_image
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.session_id = $1
       ORDER BY ci.created_at DESC`,
            [session_id]
        );
        return rows;
    },

    async updateQuantity(id, quantity, user_id) {
        const { rows } = await pool.query(
            `UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 RETURNING *`,
            [quantity, id, user_id]
        );
        return rows[0] || null;
    },

    async remove(id, user_id) {
        const { rowCount } = await pool.query(
            `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
            [id, user_id]
        );
        return rowCount > 0;
    },

    async clearCart(user_id) {
        await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [user_id]);
    },

    async transferGuestCart(session_id, user_id) {
        // Merge guest cart into user's cart
        await pool.query(
            `UPDATE cart_items SET user_id = $1, session_id = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE session_id = $2`,
            [user_id, session_id]
        );
    },

    async getCartTotal(user_id) {
        const { rows } = await pool.query(
            `SELECT COALESCE(SUM(unit_price * quantity), 0) AS total,
              COALESCE(SUM(quantity), 0) AS item_count
       FROM cart_items WHERE user_id = $1`,
            [user_id]
        );
        return rows[0];
    },
};

module.exports = CartItem;
