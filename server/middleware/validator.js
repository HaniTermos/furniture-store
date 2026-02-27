const Joi = require('joi');

/**
 * Middleware factory: validates req.body against a Joi schema.
 * Usage: router.post('/endpoint', validate(mySchema), controller)
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message.replace(/"/g, ''),
            }));
            return res.status(400).json({
                error: 'Validation failed.',
                details,
            });
        }

        req.body = value; // Use sanitized value
        next();
    };
};

/**
 * Validate query parameters
 */
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map((d) => ({
                field: d.path.join('.'),
                message: d.message.replace(/"/g, ''),
            }));
            return res.status(400).json({
                error: 'Invalid query parameters.',
                details,
            });
        }

        req.query = value;
        next();
    };
};

module.exports = { validate, validateQuery };
