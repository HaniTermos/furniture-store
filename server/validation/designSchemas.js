const Joi = require('joi');

const designSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    name: Joi.string().max(255).allow('', null).optional(),
    configuration: Joi.object().required(),
    preview_image_url: Joi.string().uri().allow('', null).optional(),
    is_public: Joi.boolean().default(false),
    value_ids: Joi.array().items(Joi.string().uuid()).optional(),
});

const designUpdateSchema = Joi.object({
    name: Joi.string().max(255).allow('', null).optional(),
    configuration: Joi.object().optional(),
    preview_image_url: Joi.string().uri().allow('', null).optional(),
    is_public: Joi.boolean().optional(),
});

module.exports = {
    designSchema,
    designUpdateSchema,
};
