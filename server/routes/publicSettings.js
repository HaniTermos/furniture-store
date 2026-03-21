const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');

/**
 * GET /api/settings/public
 * Expose non-sensitive store settings
 */
router.get('/public', async (req, res, next) => {
    try {
        const settings = await Setting.getAll();
        // Only expose specific keys
        const publicKeys = ['store_info', 'shipping', 'tax_rate'];
        const publicSettings = {};
        
        publicKeys.forEach(key => {
            if (settings[key] !== undefined) {
                publicSettings[key] = settings[key];
            }
        });
        
        res.json(publicSettings);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
