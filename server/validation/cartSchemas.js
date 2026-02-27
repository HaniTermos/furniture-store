const Joi = require('joi');

const cartItemSchema = Joi.object({
    product_id: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).max(100).default(1),
    configuration: Joi.object().optional(),
});

const cartUpdateSchema = Joi.object({
    quantity: Joi.number().integer().min(1).max(100).required(),
});

module.exports = {
    cartItemSchema,
    cartUpdateSchema,
};
