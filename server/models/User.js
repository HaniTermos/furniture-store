const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

const User = {
    async create({ email, password, name, phone, role = 'customer' }) {
        const passwordHash = await bcrypt.hash(password, 12);
        const { rows } = await pool.query(
            `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, phone, role, avatar_url, is_active, created_at`,
            [email, passwordHash, name, phone, role]
        );
        return rows[0];
    },

    async findByEmail(email) {
        const { rows } = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );
        return rows[0] || null;
    },

    async findById(id) {
        const { rows } = await pool.query(
            `SELECT id, email, name, phone, role, avatar_url, is_active, created_at, updated_at
       FROM users WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async update(id, fields) {
        const ALLOWED_FIELDS = ['email', 'name', 'phone', 'role', 'avatar_url', 'is_active'];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);
        const { rows } = await pool.query(
            `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, phone, role, avatar_url, is_active, updated_at`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async updatePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await pool.query(
            `UPDATE users SET password_hash = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, passwordHash]
        );
    },

    async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    },

    async findAll({ page = 1, limit = 20, role } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT id, email, name, phone, role, is_active, created_at FROM users`;
        const params = [];
        if (role) {
            query += ` WHERE role = $1`;
            params.push(role);
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);

        // Count
        let countQuery = `SELECT COUNT(*) FROM users`;
        const countParams = [];
        if (role) {
            countQuery += ` WHERE role = $1`;
            countParams.push(role);
        }
        const { rows: countRows } = await pool.query(countQuery, countParams);

        return { users: rows, total: parseInt(countRows[0].count) };
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    async setActive(id, isActive) {
        const { rows } = await pool.query(
            `UPDATE users SET is_active = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1
       RETURNING id, email, name, role, is_active`,
            [id, isActive]
        );
        return rows[0] || null;
    },
};

module.exports = User;
