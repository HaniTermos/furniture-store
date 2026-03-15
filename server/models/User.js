const pool = require('../db/pool');
const bcrypt = require('bcryptjs');

const User = {
    async create({ email, password, name, phone, role = 'user' }) {
        const passwordHash = await bcrypt.hash(password, 12);
        const { rows } = await pool.query(
            `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, phone, role, avatar_url, is_active, email_verified, created_at`,
            [email, passwordHash, name, phone, role]
        );
        return rows[0];
    },

    async createFromGoogle({ email, name, google_id, avatar_url }) {
        const { rows } = await pool.query(
            `INSERT INTO users (email, name, google_id, avatar_url, email_verified, password_hash)
       VALUES ($1, $2, $3, $4, true, '')
       RETURNING id, email, name, role, avatar_url, is_active, email_verified, created_at`,
            [email, name, google_id, avatar_url]
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
            `SELECT id, email, name, phone, role, avatar_url, is_active, email_verified,
              google_id, failed_login_attempts, locked_until, two_factor_enabled,
<<<<<<< HEAD
              preferences, created_at, updated_at
=======
              preferences, password_changed_at, created_at, updated_at
>>>>>>> d1d77d0 (dashboard and variants edits)
       FROM users WHERE id = $1`,
            [id]
        );
        return rows[0] || null;
    },

    async findByGoogleId(googleId) {
        const { rows } = await pool.query(
            `SELECT id, email, name, phone, role, avatar_url, is_active, email_verified,
              google_id, created_at, updated_at
       FROM users WHERE google_id = $1`,
            [googleId]
        );
        return rows[0] || null;
    },

    async findByVerificationToken(token) {
        const { rows } = await pool.query(
            `SELECT id, email, name, role FROM users WHERE email_verification_token = $1`,
            [token]
        );
        return rows[0] || null;
    },

    async findByResetToken(token) {
        const { rows } = await pool.query(
            `SELECT id, email, name, role, password_reset_expires
       FROM users
       WHERE password_reset_token = $1 AND password_reset_expires > CURRENT_TIMESTAMP`,
            [token]
        );
        return rows[0] || null;
    },

    async update(id, fields) {
        const ALLOWED_FIELDS = [
            'email', 'name', 'phone', 'role', 'avatar_url', 'is_active',
            'google_id', 'email_verified', 'email_verification_token',
            'password_reset_token', 'password_reset_expires',
            'last_login_ip', 'failed_login_attempts', 'locked_until',
            'two_factor_secret', 'two_factor_enabled', 'preferences',
<<<<<<< HEAD
=======
            'password_changed_at',
>>>>>>> d1d77d0 (dashboard and variants edits)
        ];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = keys.map((k) => fields[k]);
        const { rows } = await pool.query(
            `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, email, name, phone, role, avatar_url, is_active, email_verified, updated_at`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async updatePassword(id, newPassword) {
        const passwordHash = await bcrypt.hash(newPassword, 12);
        await pool.query(
            `UPDATE users SET password_hash = $2, password_reset_token = NULL,
       password_reset_expires = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, passwordHash]
        );
    },

    async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    },

    // ─── Login Security Methods ─────────────────────────────
    async incrementFailedLogin(id) {
        await pool.query(
            `UPDATE users SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1 WHERE id = $1`,
            [id]
        );
    },

    async resetFailedLogin(id) {
        await pool.query(
            `UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = $1`,
            [id]
        );
    },

    async lockAccount(id, minutes) {
        await pool.query(
<<<<<<< HEAD
            `UPDATE users SET locked_until = CURRENT_TIMESTAMP + INTERVAL '${minutes} minutes' WHERE id = $1`,
            [id]
=======
            `UPDATE users SET locked_until = CURRENT_TIMESTAMP + ($2 || ' minutes')::INTERVAL WHERE id = $1`,
            [id, String(parseInt(minutes, 10))]
>>>>>>> d1d77d0 (dashboard and variants edits)
        );
    },

    async setEmailVerified(id) {
        const { rows } = await pool.query(
            `UPDATE users SET email_verified = true, email_verification_token = NULL,
       email_verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING id, email, name, role, email_verified`,
            [id]
        );
        return rows[0] || null;
    },

    async setVerificationToken(id, token) {
        await pool.query(
            `UPDATE users SET email_verification_token = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, token]
        );
    },

    async setResetToken(id, token, expiresMinutes = 60) {
        await pool.query(
            `UPDATE users SET password_reset_token = $2,
<<<<<<< HEAD
       password_reset_expires = CURRENT_TIMESTAMP + INTERVAL '${expiresMinutes} minutes',
       updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, token]
=======
       password_reset_expires = CURRENT_TIMESTAMP + ($3 || ' minutes')::INTERVAL,
       updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, token, String(parseInt(expiresMinutes, 10))]
>>>>>>> d1d77d0 (dashboard and variants edits)
        );
    },

    async updateLastLogin(id, ip) {
        await pool.query(
            `UPDATE users SET last_login_ip = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [id, ip]
        );
    },

    // ─── List / Admin Methods ───────────────────────────────
    async findAll({ page = 1, limit = 20, role, search } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT id, email, name, phone, role, avatar_url, is_active, email_verified, last_login_ip, created_at FROM users`;
        const conditions = [];
        const params = [];

        if (role) {
            params.push(role);
            conditions.push(`role = $${params.length}`);
        }
        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(name ILIKE $${params.length} OR email ILIKE $${params.length})`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);

        // Count
        let countQuery = `SELECT COUNT(*) FROM users`;
        const countParams = [];
        const countConditions = [];
        if (role) {
            countParams.push(role);
            countConditions.push(`role = $${countParams.length}`);
        }
        if (search) {
            countParams.push(`%${search}%`);
            countConditions.push(`(name ILIKE $${countParams.length} OR email ILIKE $${countParams.length})`);
        }
        if (countConditions.length > 0) {
            countQuery += ` WHERE ${countConditions.join(' AND ')}`;
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
