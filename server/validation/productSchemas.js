const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().max(255).required(),
    sku: Joi.string().max(100).required(),
    description: Joi.string().allow('', null).optional(),
    short_description: Joi.string().max(500).allow('', null).optional(),
    base_price: Joi.number().precision(2).min(0).required(),
    category_id: Joi.string().uuid().required(),
    is_active: Joi.boolean().default(true),
    is_configurable: Joi.boolean().default(false),
    is_featured: Joi.boolean().default(false),
    is_new: Joi.boolean().default(false),
    weight_kg: Joi.number().precision(2).min(0).allow(null).optional(),
    dimensions_cm: Joi.object().allow(null).optional(),
    meta_title: Joi.string().max(255).allow('', null).optional(),
    meta_description: Joi.string().allow('', null).optional(),
});

const productUpdateSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    sku: Joi.string().max(100).optional(),
    description: Joi.string().allow('', null).optional(),
    short_description: Joi.string().max(500).allow('', null).optional(),
    base_price: Joi.number().precision(2).min(0).optional(),
    category_id: Joi.string().uuid().optional(),
    is_active: Joi.boolean().optional(),
    is_configurable: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional(),
    is_new: Joi.boolean().optional(),
    weight_kg: Joi.number().precision(2).min(0).allow(null).optional(),
    dimensions_cm: Joi.object().allow(null).optional(),
    meta_title: Joi.string().max(255).allow('', null).optional(),
    meta_description: Joi.string().allow('', null).optional(),
});

module.exports = {
    productSchema,
    productUpdateSchema,
};
