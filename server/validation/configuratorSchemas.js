const Joi = require('joi');

const optionSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    name: Joi.string().max(255).required(),
    type: Joi.string().valid('color', 'material', 'size', 'design', 'accessory').required(),
    is_required: Joi.boolean().default(true),
    sort_order: Joi.number().integer().default(0),
});

const optionUpdateSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    type: Joi.string().valid('color', 'material', 'size', 'design', 'accessory').optional(),
    is_required: Joi.boolean().optional(),
    sort_order: Joi.number().integer().optional(),
});

const valueSchema = Joi.object({
    option_id: Joi.string().uuid().required(),
    value: Joi.string().max(255).required(),
    price_adjustment: Joi.number().precision(2).default(0.00),
    image_url: Joi.string().uri().allow('', null).optional(),
    thumbnail_url: Joi.string().uri().allow('', null).optional(),
    stock_status: Joi.string().valid('in_stock', 'out_of_stock', 'low_stock').default('in_stock'),
    stock_quantity: Joi.number().integer().min(0).default(0),
});

const valueUpdateSchema = Joi.object({
    value: Joi.string().max(255).optional(),
    price_adjustment: Joi.number().precision(2).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    thumbnail_url: Joi.string().uri().allow('', null).optional(),
    stock_status: Joi.string().valid('in_stock', 'out_of_stock', 'low_stock').optional(),
    stock_quantity: Joi.number().integer().min(0).optional(),
});

module.exports = {
    optionSchema,
    optionUpdateSchema,
    valueSchema,
    valueUpdateSchema,
};
