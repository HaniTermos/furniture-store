const pool = require('../config/database'); // Note typo correction to config/database

const CartItem = {
<<<<<<< HEAD
    async add({ user_id, session_id, product_id, quantity, configuration, unit_price }, dbClient = pool) {
        // Check if same product + config already in cart
        const existingQuery = user_id
            ? `SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2 AND configuration = $3`
            : `SELECT * FROM cart_items WHERE session_id = $1 AND product_id = $2 AND configuration = $3`;
        const identifier = user_id || session_id;
        const configJson = configuration ? JSON.stringify(configuration) : null;

        const { rows: existing } = await dbClient.query(existingQuery, [identifier, product_id, configJson]);

        if (existing.length > 0) {
=======
    async add({ user_id, session_id, product_id, variant_id, quantity, configuration, unit_price }, dbClient = pool) {
        const identifier = user_id || session_id;
        const configJson = configuration ? JSON.stringify(configuration) : null;
        
        // Handle variant specific logic
        if (variant_id) {
            const ProductVariant = require('./ProductVariant');
            const variant = await ProductVariant.findById(variant_id);
            if (!variant) throw new Error('Variant not found');
            if (variant.stock_quantity < quantity) throw new Error('Insufficient variant stock');
            unit_price = variant.price; // Use variant exact price
        }

        // Construct query dynamically because variant_id could be null
        const variantCondition = variant_id ? `AND variant_id = $4` : `AND variant_id IS NULL`;
        const params = [identifier, product_id, configJson];
        if (variant_id) params.push(variant_id);
        
        const existingQuery = user_id
            ? `SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2 AND configuration = $3 ${variantCondition}`
            : `SELECT * FROM cart_items WHERE session_id = $1 AND product_id = $2 AND configuration = $3 ${variantCondition}`;

        const { rows: existing } = await dbClient.query(existingQuery, params);

        if (existing.length > 0) {
            // Check stock again for total quantity if variant
            if (variant_id) {
                const ProductVariant = require('./ProductVariant');
                const variant = await ProductVariant.findById(variant_id);
                if (variant.stock_quantity < (existing[0].quantity + quantity)) {
                    throw new Error('Insufficient variant stock for total quantity in cart');
                }
            }
            
>>>>>>> d1d77d0 (dashboard and variants edits)
            // Update quantity
            const { rows } = await dbClient.query(
                `UPDATE cart_items SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
                [quantity, existing[0].id]
            );
            return rows[0];
        }

<<<<<<< HEAD
        const { rows } = await dbClient.query(
            `INSERT INTO cart_items (user_id, session_id, product_id, quantity, configuration, unit_price)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user_id || null, session_id || null, product_id, quantity, configJson, unit_price]
        );
=======
        const insertQuery = `INSERT INTO cart_items (user_id, session_id, product_id, variant_id, quantity, configuration, unit_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;
        const insertParams = [user_id || null, session_id || null, product_id, variant_id || null, quantity, configJson, unit_price];
        const { rows } = await dbClient.query(insertQuery, insertParams);
>>>>>>> d1d77d0 (dashboard and variants edits)
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
