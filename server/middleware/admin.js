const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Access denied. Not authenticated.' });
    }
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = admin;
