const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const Joi = require('joi');

const reviewSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    order_id: Joi.string().uuid().allow(null),
    rating: Joi.number().integer().min(1).max(5).required(),
    title: Joi.string().max(255).allow('', null),
    comment: Joi.string().max(2000).allow('', null),
});

// GET /api/reviews/:productId — Get reviews for a product
router.get('/:productId', async (req, res, next) => {
    try {
        const { page, limit } = req.query;
        const result = await Review.findByProduct(req.params.productId, {
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
        });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/reviews — Create a review (authenticated)
router.post('/', auth, validate(reviewSchema), async (req, res, next) => {
    try {
        const review = await Review.create({
            user_id: req.user.id,
            ...req.body,
        });
        res.status(201).json({ message: 'Review submitted for approval.', review });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/reviews/:id — Delete own review
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found.' });
        }
        if (review.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied.' });
        }
        await Review.delete(req.params.id);
        res.json({ message: 'Review deleted.' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
