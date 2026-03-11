const Joi = require('joi');

const productSchema = Joi.object({
    name: Joi.string().min(2).max(200).required().messages({
        'string.min': 'Product name must be at least 2 characters',
        'string.max': 'Product name must be 200 characters or less',
        'any.required': 'Product name is required',
    }),
    sku: Joi.string().min(1).max(100).required().messages({
        'any.required': 'SKU is required',
    }),
    description: Joi.string().min(10).allow('', null).optional().messages({
        'string.min': 'Description must be at least 10 characters',
    }),
    short_description: Joi.string().max(500).allow('', null).optional(),
    base_price: Joi.number().precision(2).min(0.01).required().messages({
        'number.min': 'Price must be greater than 0',
        'any.required': 'Price is required',
    }),
    category_id: Joi.string().uuid().required().messages({
        'any.required': 'Category is required',
        'string.guid': 'Please select a valid category',
    }),
    is_active: Joi.boolean().default(true),
    is_configurable: Joi.boolean().default(false),
    is_featured: Joi.boolean().default(false),
    is_new: Joi.boolean().default(false),
    weight_kg: Joi.number().precision(2).min(0).allow(null).optional(),
    dimensions_cm: Joi.object().allow(null).optional(),
    meta_title: Joi.string().max(255).allow('', null).optional(),
    meta_description: Joi.string().allow('', null).optional(),
    size_guide_id: Joi.string().uuid().allow(null, '').optional(),
    // Relations — passed through, not validated here
    tags: Joi.array().items(Joi.string().uuid()).optional(),
    attributes: Joi.array().items(Joi.object()).optional(),
    configurations: Joi.array().items(Joi.object()).optional(),
    images: Joi.array().items(Joi.object()).optional(),
    slug: Joi.string().max(255).allow('', null).optional(),
});

const productUpdateSchema = Joi.object({
    name: Joi.string().min(2).max(200).optional().messages({
        'string.min': 'Product name must be at least 2 characters',
    }),
    sku: Joi.string().min(1).max(100).optional(),
    description: Joi.string().min(10).allow('', null).optional().messages({
        'string.min': 'Description must be at least 10 characters',
    }),
    short_description: Joi.string().max(500).allow('', null).optional(),
    base_price: Joi.number().precision(2).min(0.01).optional().messages({
        'number.min': 'Price must be greater than 0',
    }),
    category_id: Joi.string().uuid().optional(),
    is_active: Joi.boolean().optional(),
    is_configurable: Joi.boolean().optional(),
    is_featured: Joi.boolean().optional(),
    is_new: Joi.boolean().optional(),
    weight_kg: Joi.number().precision(2).min(0).allow(null).optional(),
    dimensions_cm: Joi.object().allow(null).optional(),
    meta_title: Joi.string().max(255).allow('', null).optional(),
    meta_description: Joi.string().allow('', null).optional(),
    size_guide_id: Joi.string().uuid().allow(null, '').optional(),
    // Relations
    tags: Joi.array().items(Joi.string().uuid()).optional(),
    attributes: Joi.array().items(Joi.object()).optional(),
    configurations: Joi.array().items(Joi.object()).optional(),
    images: Joi.array().items(Joi.object()).optional(),
    slug: Joi.string().max(255).allow('', null).optional(),
});

module.exports = {
    productSchema,
    productUpdateSchema,
};
