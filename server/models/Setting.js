const pool = require('../db/pool');

const Setting = {
    async getAll() {
        const { rows } = await pool.query('SELECT key, value, description FROM site_settings');
        return rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
    },

    async getByKey(key) {
        const { rows } = await pool.query('SELECT value FROM site_settings WHERE key = $1', [key]);
        return rows[0] ? rows[0].value : null;
    },

    async update(key, value) {
        const { rows } = await pool.query(
            `INSERT INTO site_settings (key, value, updated_at)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
             RETURNING key, value`,
            [key, value]
        );
        return rows[0];
    },

    async bulkUpdate(settingsMap) {
        const results = [];
        for (const [key, value] of Object.entries(settingsMap)) {
            const result = await this.update(key, value);
            results.push(result);
        }
        return results;
    }
};

module.exports = Setting;
