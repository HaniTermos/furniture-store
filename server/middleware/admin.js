const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Access denied. Not authenticated.' });
    }
    const allowedRoles = ['super_admin', 'admin', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = admin;
