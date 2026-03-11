// ═══════════════════════════════════════════════════════════════
//  models/Coupon.js — Coupon / Promo Code Model
// ═══════════════════════════════════════════════════════════════

const pool = require('../db/pool');

const Coupon = {
    async create(data) {
        const { rows } = await pool.query(
            `INSERT INTO coupons (code, type, value, min_purchase, usage_limit, per_customer_limit,
       starts_at, expires_at, applicable_products, applicable_categories, exclude_sale_items, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
            [
                data.code.toUpperCase(),
                data.type,
                data.value,
                data.min_purchase || 0,
                data.usage_limit || null,
                data.per_customer_limit || 1,
                data.starts_at || null,
                data.expires_at || null,
                data.applicable_products ? JSON.stringify(data.applicable_products) : null,
                data.applicable_categories ? JSON.stringify(data.applicable_categories) : null,
                data.exclude_sale_items || false,
                data.created_by,
            ]
        );
        return rows[0];
    },

    async findById(id) {
        const { rows } = await pool.query(`SELECT * FROM coupons WHERE id = $1`, [id]);
        return rows[0] || null;
    },

    async findByCode(code) {
        const { rows } = await pool.query(
            `SELECT * FROM coupons WHERE code = $1 AND is_active = true`,
            [code.toUpperCase()]
        );
        return rows[0] || null;
    },

    async findAll({ page = 1, limit = 20, search, isActive } = {}) {
        const offset = (page - 1) * limit;
        let query = `SELECT * FROM coupons`;
        const conditions = [];
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`code ILIKE $${params.length}`);
        }
        if (isActive !== undefined) {
            params.push(isActive);
            conditions.push(`is_active = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }
        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const { rows } = await pool.query(query, params);

        // Count
        let countQuery = `SELECT COUNT(*) FROM coupons`;
        const countParams = [];
        const countConditions = [];
        if (search) { countParams.push(`%${search}%`); countConditions.push(`code ILIKE $${countParams.length}`); }
        if (isActive !== undefined) { countParams.push(isActive); countConditions.push(`is_active = $${countParams.length}`); }
        if (countConditions.length > 0) countQuery += ` WHERE ${countConditions.join(' AND ')}`;
        const { rows: countRows } = await pool.query(countQuery, countParams);

        return { coupons: rows, total: parseInt(countRows[0].count) };
    },

    async update(id, fields) {
        const ALLOWED_FIELDS = [
            'code', 'type', 'value', 'min_purchase', 'usage_limit', 'per_customer_limit',
            'starts_at', 'expires_at', 'applicable_products', 'applicable_categories',
            'exclude_sale_items', 'is_active',
        ];
        const keys = Object.keys(fields).filter(k => ALLOWED_FIELDS.includes(k));
        if (keys.length === 0) return null;

        const setClause = keys.map((k, i) => {
            if (k === 'applicable_products' || k === 'applicable_categories') {
                return `${k} = $${i + 2}::jsonb`;
            }
            return `${k} = $${i + 2}`;
        }).join(', ');
        const values = keys.map((k) => {
            if ((k === 'applicable_products' || k === 'applicable_categories') && fields[k]) {
                return JSON.stringify(fields[k]);
            }
            if (k === 'code') return fields[k].toUpperCase();
            return fields[k];
        });

        const { rows } = await pool.query(
            `UPDATE coupons SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return rows[0] || null;
    },

    async delete(id) {
        const { rowCount } = await pool.query(`DELETE FROM coupons WHERE id = $1`, [id]);
        return rowCount > 0;
    },

    async incrementUsage(id) {
        await pool.query(`UPDATE coupons SET usage_count = usage_count + 1 WHERE id = $1`, [id]);
    },

    async recordUsage(couponId, userId, orderId) {
        await pool.query(
            `INSERT INTO coupon_usages (coupon_id, user_id, order_id) VALUES ($1, $2, $3)`,
            [couponId, userId, orderId]
        );
    },

    async getUserUsageCount(couponId, userId) {
        const { rows } = await pool.query(
            `SELECT COUNT(*) FROM coupon_usages WHERE coupon_id = $1 AND user_id = $2`,
            [couponId, userId]
        );
        return parseInt(rows[0].count);
    },

    /**
     * Validate coupon eligibility
     */
    async validate(code, userId, cartTotal) {
        const coupon = await this.findByCode(code);
        if (!coupon) return { valid: false, error: 'Invalid coupon code.' };

        // Check active
        if (!coupon.is_active) return { valid: false, error: 'This coupon is no longer active.' };

        // Check dates
        const now = new Date();
        if (coupon.starts_at && new Date(coupon.starts_at) > now) {
            return { valid: false, error: 'This coupon is not yet active.' };
        }
        if (coupon.expires_at && new Date(coupon.expires_at) < now) {
            return { valid: false, error: 'This coupon has expired.' };
        }

        // Check global usage limit
        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
            return { valid: false, error: 'This coupon has reached its usage limit.' };
        }

        // Check per-customer usage
        if (userId && coupon.per_customer_limit) {
            const userUsage = await this.getUserUsageCount(coupon.id, userId);
            if (userUsage >= coupon.per_customer_limit) {
                return { valid: false, error: 'You have already used this coupon.' };
            }
        }

        // Check minimum purchase
        if (cartTotal < parseFloat(coupon.min_purchase)) {
            return { valid: false, error: `Minimum purchase of $${coupon.min_purchase} required.` };
        }

        // Calculate discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (cartTotal * parseFloat(coupon.value)) / 100;
        } else if (coupon.type === 'fixed') {
            discount = parseFloat(coupon.value);
        } else if (coupon.type === 'shipping') {
            discount = 0; // Shipping discount handled separately
        }

        return { valid: true, coupon, discount: Math.min(discount, cartTotal) };
    },
};

module.exports = Coupon;
