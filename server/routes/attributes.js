const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Attribute = require('../models/Attribute');

// GET /api/attributes - List all attributes with options (public)
router.get('/', async (req, res, next) => {
    try {
        const attrs = await Attribute.findAllAttributes({ includeOptions: true });
        res.json({ success: true, data: attrs });
    } catch (err) {
        next(err);
    }
});

// GET /api/attributes/:id - Get single attribute (public)
router.get('/:id', async (req, res, next) => {
    try {
        const attr = await Attribute.findAttributeById(req.params.id);
        if (!attr) {
            return res.status(404).json({ success: false, message: 'Attribute not found' });
        }
        res.json({ success: true, data: attr });
    } catch (err) {
        next(err);
    }
});

// POST /api/attributes - Create new attribute (admin only)
router.post('/', auth, adminOnly, async (req, res, next) => {
    try {
        const { name, slug, type, sort_order } = req.body;
        
        if (!name || !slug) {
            return res.status(400).json({ success: false, message: 'Name and slug are required' });
        }
        
        const attr = await Attribute.createAttribute({ name, slug, type, sort_order });
        res.status(201).json({ success: true, data: attr });
    } catch (err) {
        if (err.message.includes('unique constraint')) {
            return res.status(409).json({ success: false, message: 'Attribute slug already exists' });
        }
        next(err);
    }
});

// PUT /api/attributes/:id - Update attribute (admin only)
router.put('/:id', auth, adminOnly, async (req, res, next) => {
    try {
        const attr = await Attribute.updateAttribute(req.params.id, req.body);
        if (!attr) {
            return res.status(404).json({ success: false, message: 'Attribute not found' });
        }
        res.json({ success: true, data: attr });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/attributes/:id - Delete attribute (admin only)
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
    try {
        const deleted = await Attribute.deleteAttribute(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Attribute not found' });
        }
        res.json({ success: true, message: 'Attribute deleted' });
    } catch (err) {
        next(err);
    }
});

// POST /api/attributes/:id/options - Create option for attribute (admin only)
router.post('/:id/options', auth, adminOnly, async (req, res, next) => {
    try {
        const { value, slug, color_hex, image_url, sort_order } = req.body;
        
        if (!value || !slug) {
            return res.status(400).json({ success: false, message: 'Value and slug are required' });
        }
        
        const option = await Attribute.createOption({
            attribute_id: req.params.id,
            value,
            slug,
            color_hex,
            image_url,
            sort_order
        });
        res.status(201).json({ success: true, data: option });
    } catch (err) {
        if (err.message.includes('unique constraint')) {
            return res.status(409).json({ success: false, message: 'Option slug already exists for this attribute' });
        }
        next(err);
    }
});

// PUT /api/attributes/options/:id - Update option (admin only)
router.put('/options/:id', auth, adminOnly, async (req, res, next) => {
    try {
        const option = await Attribute.updateOption(req.params.id, req.body);
        if (!option) {
            return res.status(404).json({ success: false, message: 'Option not found' });
        }
        res.json({ success: true, data: option });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/attributes/options/:id - Delete option (admin only)
router.delete('/options/:id', auth, adminOnly, async (req, res, next) => {
    try {
        await Attribute.deleteOption(req.params.id);
        res.json({ success: true, message: 'Option deleted' });
    } catch (err) {
        if (err.message.includes('in use')) {
            return res.status(409).json({ success: false, message: err.message });
        }
        next(err);
    }
});

module.exports = router;

