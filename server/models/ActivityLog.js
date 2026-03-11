// ═══════════════════════════════════════════════════════════════
//  models/ActivityLog.js — Audit Trail Model
// ═══════════════════════════════════════════════════════════════

const pool = require('../db/pool');

const ActivityLog = {
    /**
     * Log an activity
     */
    async create({ userId, action, entityType, entityId, oldValues, newValues, ipAddress, userAgent }) {
        const { rows } = await pool.query(
            `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
            [userId, action, entityType, entityId,
                oldValues ? JSON.stringify(oldValues) : null,
                newValues ? JSON.stringify(newValues) : null,
                ipAddress, userAgent]
        );
        return rows[0];
    },

    /**
     * List activity logs with filters
     */
    async findAll({ page = 1, limit = 50, userId, entityType, action } = {}) {
        const offset = (page - 1) * limit;
        let query = `
      SELECT al.*, u.name as user_name, u.email as user_email
      FROM activity_logs al
      LEFT JOIN users u ON al.user_id = u.id
    `;
        const conditions = [];
        const params = [];

        if (userId) {
            params.push(userId);
            conditions.push(`al.user_id = $${params.length}`);
        }
        if (entityType) {
            params.push(entityType);
            conditions.push(`al.entity_type = $${params.length}`);
        }
        if (action) {
            params.push(action);
            conditions.push(`al.action = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);

        // Count
        let countQuery = `SELECT COUNT(*) FROM activity_logs al`;
        if (conditions.length > 0) {
            const countParams = [];
            const countConditions = [];
            if (userId) { countParams.push(userId); countConditions.push(`al.user_id = $${countParams.length}`); }
            if (entityType) { countParams.push(entityType); countConditions.push(`al.entity_type = $${countParams.length}`); }
            if (action) { countParams.push(action); countConditions.push(`al.action = $${countParams.length}`); }
            countQuery += ` WHERE ${countConditions.join(' AND ')}`;
            const { rows: countRows } = await pool.query(countQuery, countParams);
            return { logs: rows, total: parseInt(countRows[0].count) };
        }

        const { rows: countRows } = await pool.query(countQuery);
        return { logs: rows, total: parseInt(countRows[0].count) };
    },

    /**
     * Get recent activity for dashboard
     */
    async getRecent(limit = 10) {
        const { rows } = await pool.query(
            `SELECT al.*, u.name as user_name, u.email as user_email
       FROM activity_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ORDER BY al.created_at DESC
       LIMIT $1`,
            [limit]
        );
        return rows;
    },
};

module.exports = ActivityLog;
