const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Public route: Get all categories (tree structure)
router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// Public route: Get single category by slug or id
router.get('/:idOrSlug', async (req, res, next) => {
    try {
        let category;
        const { idOrSlug } = req.params;

        // Fast check for UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(idOrSlug)) {
            category = await Category.findById(idOrSlug);
        } else {
            category = await Category.findBySlug(idOrSlug);
        }

        if (!category) {
            return res.status(404).json({ error: 'Category not found.' });
        }
        res.json(category);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
