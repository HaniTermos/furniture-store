const SizeGuide = require('../models/SizeGuide');
const pool = require('../db/pool');

const sizeGuideController = {
    async getSizeGuides(req, res, next) {
        try {
            const guides = await SizeGuide.findAll();
            res.json(guides);
        } catch (error) {
            next(error);
        }
    },

    async getSizeGuideDetail(req, res, next) {
        try {
            const guide = await SizeGuide.findById(req.params.id);
            if (!guide) return res.status(404).json({ error: 'Size guide not found.' });
            res.json(guide);
        } catch (error) {
            next(error);
        }
    },

    async createSizeGuide(req, res, next) {
        try {
            const { name, description, content_html, content_json } = req.body;
            if (!name) return res.status(400).json({ error: 'Name is required' });

            const guide = await SizeGuide.create({ name, description, content_html, content_json });
            res.status(201).json({ message: 'Size guide created.', guide });
        } catch (error) {
            next(error);
        }
    },

    async updateSizeGuide(req, res, next) {
        try {
            const guide = await SizeGuide.update(req.params.id, req.body);
            if (!guide) return res.status(404).json({ error: 'Size guide not found.' });
            res.json({ message: 'Size guide updated.', guide });
        } catch (error) {
            next(error);
        }
    },

    async deleteSizeGuide(req, res, next) {
        try {
            // Check if it's used by any products
            const { rows } = await pool.query(`SELECT COUNT(*) FROM products WHERE size_guide_id = $1`, [req.params.id]);
            if (parseInt(rows[0].count) > 0) {
                return res.status(400).json({ error: `Cannot delete size guide: attached to ${rows[0].count} product(s).` });
            }

            const deleted = await SizeGuide.delete(req.params.id);
            if (!deleted) return res.status(404).json({ error: 'Size guide not found.' });
            res.json({ message: 'Size guide deleted.' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = sizeGuideController;
