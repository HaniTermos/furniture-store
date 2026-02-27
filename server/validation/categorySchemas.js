const Joi = require('joi');

const categorySchema = Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().allow('', null).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    parent_id: Joi.string().uuid().allow(null).optional(),
    sort_order: Joi.number().integer().default(0),
    is_active: Joi.boolean().default(true),
});

const categoryUpdateSchema = Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().allow('', null).optional(),
    image_url: Joi.string().uri().allow('', null).optional(),
    parent_id: Joi.string().uuid().allow(null).optional(),
    sort_order: Joi.number().integer().optional(),
    is_active: Joi.boolean().optional(),
});

module.exports = {
    categorySchema,
    categoryUpdateSchema,
};
