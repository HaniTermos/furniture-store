const express = require('express');
const router = express.Router({ mergeParams: true });
const { auth, adminOnly } = require('../middleware/auth');
const ProductVariant = require('../models/ProductVariant');

// GET /api/products/:productId/variants - List variants for a product
router.get('/', async (req, res, next) => {
    try {
        const { active } = req.query;
        const variants = await ProductVariant.findByProduct(
            req.params.productId, 
            { activeOnly: active !== 'false' }
        );
        res.json({ success: true, data: variants });
    } catch (err) {
        next(err);
    }
});

// GET /api/products/:productId/variants/:id - Get single variant
router.get('/:id', async (req, res, next) => {
    try {
        const variant = await ProductVariant.findById(req.params.id);
        if (!variant || variant.product_id !== req.params.productId) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        res.json({ success: true, data: variant });
    } catch (err) {
        next(err);
    }
});

// POST /api/products/:productId/variants - Create single variant (admin only)
router.post('/', auth, adminOnly, async (req, res, next) => {
    try {
        const { sku, price, stock_quantity, image_url, is_default, is_active, position, attributes } = req.body;
        
        if (!sku || price === undefined) {
            return res.status(400).json({ success: false, message: 'SKU and price are required' });
        }
        
        const variant = await ProductVariant.create({
            product_id: req.params.productId,
            sku,
            price,
            stock_quantity,
            image_url,
            is_default,
            is_active,
            position,
            attributes
        });
        res.status(201).json({ success: true, data: variant });
    } catch (err) {
        if (err.message.includes('unique constraint')) {
            return res.status(409).json({ success: false, message: 'SKU already exists' });
        }
        next(err);
    }
});

// POST /api/products/:productId/variants/matrix - Create variant matrix (admin only)
router.post('/matrix', auth, adminOnly, async (req, res, next) => {
    try {
        const { matrix } = req.body;
        
        if (!Array.isArray(matrix) || matrix.length === 0) {
            return res.status(400).json({ success: false, message: 'Matrix array is required' });
        }
        
        // Validate matrix rows
        for (const row of matrix) {
            if (!row.sku || row.price === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Each matrix row must have sku and price' 
                });
            }
        }
        
        const variants = await ProductVariant.createMatrix(req.params.productId, matrix);
        res.status(201).json({ success: true, data: variants });
    } catch (err) {
        if (err.message.includes('unique constraint')) {
            return res.status(409).json({ success: false, message: 'One or more SKUs already exist' });
        }
        next(err);
    }
});

// PUT /api/products/:productId/variants/:id - Update variant (admin only)
router.put('/:id', auth, adminOnly, async (req, res, next) => {
    try {
        const variant = await ProductVariant.update(req.params.id, req.body);
        if (!variant) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        res.json({ success: true, data: variant });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/products/:productId/variants/:id - Delete variant (admin only)
router.delete('/:id', auth, adminOnly, async (req, res, next) => {
    try {
        const deleted = await ProductVariant.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Variant not found' });
        }
        res.json({ success: true, message: 'Variant deleted' });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/products/:productId/variants - Delete all variants for product (admin only)
router.delete('/', auth, adminOnly, async (req, res, next) => {
    try {
        const count = await ProductVariant.deleteByProduct(req.params.productId);
        res.json({ success: true, message: `${count} variants deleted` });
    } catch (err) {
        next(err);
    }
});

module.exports = router;

