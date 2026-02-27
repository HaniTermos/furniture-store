const User = require('../models/User');

const userController = {
    /**
     * GET /api/users/:id (Admin)
     */
    async getUser(req, res, next) {
        try {
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.json({ user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/users (Admin)
     */
    async getAllUsers(req, res, next) {
        try {
            const { page, limit, role } = req.query;
            const result = await User.findAll({
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 20,
                role,
            });
            res.json(result);
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/users/:id/status (Admin)
     */
    async toggleStatus(req, res, next) {
        try {
            const { is_active } = req.body;
            const user = await User.setActive(req.params.id, is_active);
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.json({ message: `User ${is_active ? 'activated' : 'deactivated'}.`, user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * PUT /api/users/:id/role (Admin)
     */
    async updateRole(req, res, next) {
        try {
            const { role } = req.body;
            if (!['customer', 'admin', 'manager'].includes(role)) {
                return res.status(400).json({ error: 'Invalid role.' });
            }
            const user = await User.update(req.params.id, { role });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.json({ message: 'Role updated.', user });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/users/:id (Admin)
     */
    async deleteUser(req, res, next) {
        try {
            const deleted = await User.delete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'User not found.' });
            }
            res.json({ message: 'User deleted.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = userController;
