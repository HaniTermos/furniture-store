const pool = require('../config/database');

const SavedDesign = {
    async create({ user_id, product_id, name, configuration, preview_image_url, is_public = false }, dbClient = pool) {
        const shareToken = require('crypto').randomBytes(16).toString('hex');
        const { rows } = await dbClient.query(
            `INSERT INTO saved_designs (user_id, product_id, name, configuration, preview_image_url, is_public, share_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [user_id, product_id, name, JSON.stringify(configuration), preview_image_url, is_public, shareToken]
        );
        return rows[0];
    },

    async findByUser(user_id) {
        const { rows } = await pool.query(
            `SELECT sd.*, p.name AS product_name, p.slug AS product_slug,
        (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) AS product_image
       FROM saved_designs sd
       JOIN products p ON p.id = sd.product_id
       WHERE sd.user_id = $1
       ORDER BY sd.created_at DESC`,
            [user_id]
        );
        return rows;
    },

    async findById(id) {
        const { rows } = await pool.query(
            `SELECT sd.*, p.name AS product_name, p.slug AS product_slug
       FROM saved_designs sd
       JOIN products p ON p.id = sd.product_id
       WHERE sd.id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async findByShareToken(token) {
        const { rows } = await pool.query(
            `SELECT sd.*, p.name AS product_name, p.slug AS product_slug
       FROM saved_designs sd
       JOIN products p ON p.id = sd.product_id
        WHERE sd.share_token = $1 AND sd.is_public = true AND p.is_deleted = false`,
            [token]
        );
        return rows[0] || null;
    },

    async update(id, user_id, fields) {
        const keys = Object.keys(fields);
        if (keys.length === 0) return null;
        const setClause = keys.map((k, i) => `${k} = $${i + 3}`).join(', ');
        const values = keys.map((k) => {
            if (k === 'configuration' && typeof fields[k] === 'object') return JSON.stringify(fields[k]);
            return fields[k];
        });
        const { rows } = await pool.query(
            `UPDATE saved_designs SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, user_id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id, user_id) {
        const { rowCount } = await pool.query(
            `DELETE FROM saved_designs WHERE id = $1 AND user_id = $2`,
            [id, user_id]
        );
        return rowCount > 0;
    },

    // Selections
    async addSelections(design_id, valueIds, dbClient = pool) {
        if (!valueIds || valueIds.length === 0) return;
        const values = valueIds.map((vid, i) => `($1, $${i + 2})`).join(', ');
        await dbClient.query(
            `INSERT INTO saved_design_selections (design_id, value_id) VALUES ${values}`,
            [design_id, ...valueIds]
        );
    },

    async getSelections(design_id) {
        const { rows } = await pool.query(
            `SELECT sds.*, cv.value, cv.price_adjustment, cv.image_url,
              co.name AS option_name, co.type AS option_type
       FROM saved_design_selections sds
       JOIN configuration_values cv ON cv.id = sds.value_id
       JOIN configuration_options co ON co.id = cv.option_id
       WHERE sds.design_id = $1`,
            [design_id]
        );
        return rows;
    },
};

module.exports = SavedDesign;
