const Attribute = require('../models/Attribute');
const pool = require('../db/pool');

const attributeController = {
    // ─── ATTRIBUTES ──────────────────────────────────────────────
    async getAttributes(req, res, next) {
        try {
<<<<<<< HEAD
            const attributes = await Attribute.findAllAttributes();
            res.json(attributes);
=======
            const attributes = await Attribute.findAll({ includeOptions: true });
            res.json({ success: true, data: attributes });
>>>>>>> d1d77d0 (dashboard and variants edits)
        } catch (error) {
            next(error);
        }
    },

    async getAttributeDetail(req, res, next) {
        try {
<<<<<<< HEAD
            const attribute = await Attribute.findAttributeById(req.params.id);
            if (!attribute) return res.status(404).json({ error: 'Attribute not found.' });
            res.json(attribute);
=======
            const attribute = await Attribute.findById(req.params.id);
            if (!attribute) return res.status(404).json({ success: false, error: 'Attribute not found.' });
            res.json({ success: true, data: attribute });
>>>>>>> d1d77d0 (dashboard and variants edits)
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
<<<<<<< HEAD
                res.status(201).json({ ...newAttr, values });
=======
                res.status(201).json({ success: true, data: { ...newAttr, values } });
>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
            const attribute = await Attribute.updateAttribute(req.params.id, fields);
            if (!attribute) return res.status(404).json({ error: 'Attribute not found.' });
            res.json({ message: 'Attribute updated.', attribute });
=======
            const attribute = await Attribute.update(req.params.id, fields);
            if (!attribute) return res.status(404).json({ success: false, error: 'Attribute not found.' });
            res.json({ success: true, message: 'Attribute updated.', data: attribute });
>>>>>>> d1d77d0 (dashboard and variants edits)
        } catch (error) {
            next(error);
        }
    },

    async deleteAttribute(req, res, next) {
        try {
<<<<<<< HEAD
            // Check if it's used by products
            const { rows } = await pool.query(`SELECT COUNT(*) FROM product_attributes WHERE attribute_id = $1`, [req.params.id]);
            if (parseInt(rows[0].count) > 0) {
                return res.status(400).json({ error: `Cannot delete attribute: actively used by ${rows[0].count} product variations.` });
            }

            const deleted = await Attribute.deleteAttribute(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Attribute not found.' });
            res.json({ message: 'Attribute deleted.' });
=======
            const deleted = await Attribute.delete(req.params.id);
            if (!deleted) return res.status(404).json({ success: false, error: 'Attribute not found.' });
            res.json({ success: true, message: 'Attribute deleted.' });
>>>>>>> d1d77d0 (dashboard and variants edits)
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

<<<<<<< HEAD
            const value = await Attribute.createValue({
                attribute_id: req.params.attributeId,
                ...data
            });
            res.status(201).json({ message: 'Value created.', value });
=======
            const value = await Attribute.createOption({
                attribute_id: req.params.attributeId,
                ...data
            });
            res.status(201).json({ success: true, message: 'Value created.', data: value });
>>>>>>> d1d77d0 (dashboard and variants edits)
        } catch (error) {
            next(error);
        }
    },

    async updateValue(req, res, next) {
        try {
<<<<<<< HEAD
            const { generateSlug } = require('../utils/generateSlug');
            const fields = req.body;
            if (fields.value && !fields.slug) fields.slug = generateSlug(fields.value);

            const value = await Attribute.updateValue(req.params.valueId, fields);
            if (!value) return res.status(404).json({ error: 'Value not found.' });
            res.json({ message: 'Value updated.', value });
=======
            const fields = req.body;
            const value = await Attribute.updateOption(req.params.valueId, fields);
            if (!value) return res.status(404).json({ success: false, error: 'Value not found.' });
            res.json({ success: true, message: 'Value updated.', data: value });
>>>>>>> d1d77d0 (dashboard and variants edits)
        } catch (error) {
            next(error);
        }
    },

    async deleteValue(req, res, next) {
        try {
<<<<<<< HEAD
            // Check if value is used
            const { rows } = await pool.query(`SELECT COUNT(*) FROM product_attributes WHERE value_id = $1`, [req.params.valueId]);
            if (parseInt(rows[0].count) > 0) {
                return res.status(400).json({ error: 'Cannot delete value: actively used by products.' });
            }

            const deleted = await Attribute.deleteValue(req.params.valueId);
            if (!deleted) return res.status(404).json({ error: 'Value not found.' });
            res.json({ message: 'Value deleted.' });
=======
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
>>>>>>> d1d77d0 (dashboard and variants edits)
        } catch (error) {
            next(error);
        }
    }
};

module.exports = attributeController;
