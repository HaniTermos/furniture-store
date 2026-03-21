const Attribute = require('../models/Attribute');
const pool = require('../db/pool');

const attributeController = {
    // ─── ATTRIBUTES ──────────────────────────────────────────────
    async getAttributes(req, res, next) {
        try {
            const attributes = await Attribute.findAllAttributes({ includeOptions: true });
            res.json({ success: true, data: attributes });
        } catch (error) {
            next(error);
        }
    },

    async getAttributeDetail(req, res, next) {
        try {
            const attribute = await Attribute.findAttributeById(req.params.id);
            if (!attribute) return res.status(404).json({ success: false, error: 'Attribute not found.' });
            res.json({ success: true, data: attribute });
        } catch (error) {
            next(error);
        }
    },

    async createAttribute(req, res, next) {
        try {
            const { generateSlug } = require('../utils/generateSlug');
            const data = req.body;
            if (!data.slug && data.name) data.slug = generateSlug(data.name);

            // Start transaction
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // 1. Create Attribute
                const { rows: attrRows } = await client.query(
                    `INSERT INTO attributes (name, slug, type, is_visible_on_product, is_used_for_variations, is_filterable, sort_order)
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [data.name, data.slug, data.type, data.is_visible_on_product !== false, data.is_used_for_variations || false, data.is_filterable !== false, data.sort_order || 0]
                );
                const newAttr = attrRows[0];

                // 2. Create Values if provided
                const values = [];
                if (data.values && Array.isArray(data.values)) {
                    for (const v of data.values) {
                        const vSlug = v.slug || generateSlug(v.value);
                        const { rows: valRows } = await client.query(
                            `INSERT INTO attribute_values (attribute_id, value, color_hex, image_url, slug, sort_order)
                             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                            [newAttr.id, v.value, v.color_hex || null, v.image_url || null, vSlug, v.sort_order || 0]
                        );
                        values.push(valRows[0]);
                    }
                }

                await client.query('COMMIT');
                res.status(201).json({ success: true, data: { ...newAttr, values } });
            } catch (e) {
                await client.query('ROLLBACK');
                throw e;
            } finally {
                client.release();
            }
        } catch (error) {
            next(error);
        }
    },

    async updateAttribute(req, res, next) {
        try {
            const { generateSlug } = require('../utils/generateSlug');
            const fields = req.body;
            if (fields.name && !fields.slug) fields.slug = generateSlug(fields.name);

            const attribute = await Attribute.updateAttribute(req.params.id, fields);
            if (!attribute) return res.status(404).json({ success: false, error: 'Attribute not found.' });
            res.json({ success: true, message: 'Attribute updated.', data: attribute });
        } catch (error) {
            next(error);
        }
    },

    async deleteAttribute(req, res, next) {
        try {
            const deleted = await Attribute.deleteAttribute(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, error: 'Attribute not found.' });
            res.json({ success: true, message: 'Attribute deleted.' });
        } catch (error) {
            next(error);
        }
    },

    // ─── ATTRIBUTE VALUES ────────────────────────────────────────
    async createValue(req, res, next) {
        try {
            const { generateSlug } = require('../utils/generateSlug');
            const data = req.body;
            if (!data.slug && data.value) data.slug = generateSlug(data.value);

            const value = await Attribute.createOption({
                attribute_id: req.params.attributeId,
                ...data
            });
            res.status(201).json({ success: true, message: 'Value created.', data: value });
        } catch (error) {
            next(error);
        }
    },

    async updateValue(req, res, next) {
        try {
            const fields = req.body;
            const value = await Attribute.updateOption(req.params.valueId, fields);
            if (!value) return res.status(404).json({ success: false, error: 'Value not found.' });
            res.json({ success: true, message: 'Value updated.', data: value });
        } catch (error) {
            next(error);
        }
    },

    async deleteValue(req, res, next) {
        try {
            await Attribute.deleteOption(req.params.valueId);
            res.json({ success: true, message: 'Value deleted.' });
        } catch (error) {
            if (error.message.includes('in use')) {
                return res.status(409).json({ success: false, error: error.message });
            }
            next(error);
        }
    },

    // ─── PRODUCT ATTRIBUTE ASSIGNMENT ───────────────────────────
    async getProductAttributes(req, res, next) {
        try {
            const attributes = await Attribute.getProductAttributes(req.params.id);
            res.json({ success: true, data: attributes });
        } catch (error) {
            next(error);
        }
    },

    async assignToProduct(req, res, next) {
        try {
            const { attribute_id, is_required, sort_order } = req.body;
            const assignment = await Attribute.assignToProduct(req.params.id, attribute_id, {
                is_required,
                sort_order
            });
            res.status(201).json({ success: true, message: 'Attribute assigned to product.', data: assignment });
        } catch (error) {
            next(error);
        }
    },

    async removeFromProduct(req, res, next) {
        try {
            await Attribute.removeFromProduct(req.params.id, req.params.attributeId);
            res.json({ success: true, message: 'Attribute removed from product.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = attributeController;
