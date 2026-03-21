/**
 * Middleware to validate UUID format for specific parameters or body fields.
 * Intercepts common "undefined" or "null" string leaks from frontend.
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateId = (paramNames = ['id']) => {
    return (req, res, next) => {
        for (const name of paramNames) {
            const id = req.params[name] || req.body[name];
            if (id) {
                if (typeof id === 'string' && (id === 'undefined' || id === 'null')) {
                    return res.status(400).json({ error: `Invalid ID format for ${name}: literal string "${id}" detected.` });
                }
                if (!UUID_RE.test(id)) {
                    return res.status(400).json({ error: `Invalid ID format for ${name}.` });
                }
            }
        }
        next();
    };
};

module.exports = { validateId, UUID_RE };
