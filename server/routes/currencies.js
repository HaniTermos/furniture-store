const express = require('express');
const router = express.Router();
const Currency = require('../models/Currency');

/**
 * GET /api/currencies/active
 * Public endpoint to get active currencies for the storefront
 */
router.get('/active', async (req, res, next) => {
    try {
        const currencies = await Currency.findActive();
        res.json(currencies);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
