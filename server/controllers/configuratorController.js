const ConfigurationOption = require('../models/ConfigurationOption');
const ConfigurationValue = require('../models/ConfigurationValue');
const priceService = require('../services/priceService');
const Product = require('../models/Product');

const configuratorController = {
    /**
     * GET /api/configurator/:productId/options
     */
    async getOptions(req, res, next) {
        try {
            const options = await ConfigurationOption.findWithValues(req.params.productId);
            res.json({ options });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/configurator/calculate-price
     */
    async calculatePrice(req, res, next) {
        try {
            const { product_id, configuration } = req.body;
            if (!product_id) {
                return res.status(400).json({ error: 'product_id is required.' });
            }
            const product = await Product.findById(product_id);
            if (!product) {
                return res.status(404).json({ error: 'Product not found.' });
            }
            const result = await priceService.calculatePrice(product.base_price, configuration);
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/configurator/options (Admin)
     */
    async createOption(req, res, next) {
        try {
            const option = await ConfigurationOption.create(req.body);
            res.status(201).json({ message: 'Option created.', option });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/configurator/options/:id (Admin)
     */
    async updateOption(req, res, next) {
        try {
            const option = await ConfigurationOption.update(req.params.id, req.body);
            if (!option) {
                return res.status(404).json({ error: 'Option not found.' });
            }
            res.json({ message: 'Option updated.', option });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/configurator/options/:id (Admin)
     */
    async deleteOption(req, res, next) {
        try {
            const deleted = await ConfigurationOption.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Option not found.' });
            }
            res.json({ message: 'Option deleted.' });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/configurator/values (Admin)
     */
    async createValue(req, res, next) {
        try {
            const value = await ConfigurationValue.create(req.body);
            res.status(201).json({ message: 'Value created.', value });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/configurator/values/:id (Admin)
     */
    async updateValue(req, res, next) {
        try {
            const value = await ConfigurationValue.update(req.params.id, req.body);
            if (!value) {
                return res.status(404).json({ error: 'Value not found.' });
            }
            res.json({ message: 'Value updated.', value });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/configurator/values/:id (Admin)
     */
    async deleteValue(req, res, next) {
        try {
            const deleted = await ConfigurationValue.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Value not found.' });
            }
            res.json({ message: 'Value deleted.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = configuratorController;
