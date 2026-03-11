const Joi = require('joi');

/**
 * Middleware factory: validates req.body against a Joi schema.
 * Returns { success: false, errors: { fieldName: "Human-readable message" } }
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            // Build field-keyed error object for frontend inline display
            const errors = {};
            error.details.forEach((d) => {
                const field = d.path.join('.');
                // Only keep first error per field
                if (!errors[field]) {
                    errors[field] = d.message.replace(/"/g, '');
                }
            });
            return res.status(400).json({
                success: false,
                error: 'Validation failed.',
                errors,
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
            const errors = {};
            error.details.forEach((d) => {
                const field = d.path.join('.');
                if (!errors[field]) {
                    errors[field] = d.message.replace(/"/g, '');
                }
            });
            return res.status(400).json({
                success: false,
                error: 'Invalid query parameters.',
                errors,
            });
        }

        req.query = value;
        next();
    };
};

module.exports = { validate, validateQuery };
