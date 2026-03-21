const Joi = require('joi');

const orderSchema = Joi.object({
    shipping_address: Joi.object().required(),
    billing_address: Joi.object().optional(),
    payment_method: Joi.string().max(50).required(),
    coupon_code: Joi.string().allow('', null).optional(),
    notes: Joi.string().allow('', null).optional(),
});

const orderStatusSchema = Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded').required(),
});

module.exports = {
    orderSchema,
    orderStatusSchema,
};
