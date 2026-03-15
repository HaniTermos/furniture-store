const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Access denied. Not authenticated.' });
    }
<<<<<<< HEAD
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
=======
    const allowedRoles = ['super_admin', 'admin', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
>>>>>>> d1d77d0 (dashboard and variants edits)
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
    next();
};

module.exports = admin;
