const SavedDesign = require('../models/SavedDesign');
const pool = require('../config/database');

const designController = {
    /**
     * GET /api/designs
     */
    async getUserDesigns(req, res, next) {
        try {
            const designs = await SavedDesign.findByUser(req.user.id);
            res.json({ designs });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/designs/:id
     */
    async getDesign(req, res, next) {
        try {
            const design = await SavedDesign.findById(req.params.id);
            if (!design) {
                return res.status(404).json({ error: 'Design not found.' });
            }

            // Check ownership unless public
            if (design.user_id !== req.user.id && !design.is_public) {
                return res.status(403).json({ error: 'Access denied.' });
            }

            const selections = await SavedDesign.getSelections(design.id);
            res.json({ design: { ...design, selections } });
        } catch (error) {
            next(error);
        }
    },

    /**
     * GET /api/designs/shared/:token
     */
    async getSharedDesign(req, res, next) {
        try {
            const design = await SavedDesign.findByShareToken(req.params.token);
            if (!design) {
                return res.status(404).json({ error: 'Design not found or not shared.' });
            }
            const selections = await SavedDesign.getSelections(design.id);
            res.json({ design: { ...design, selections } });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/designs
     */
    async saveDesign(req, res, next) {
        const client = await pool.connect();
        try {
            const { product_id, name, configuration, preview_image_url, is_public, value_ids } = req.body;

            await client.query('BEGIN'); // Start transaction

            const design = await SavedDesign.create({
                user_id: req.user.id,
                product_id,
                name,
                configuration,
                preview_image_url,
                is_public,
            }, client); // Pass client for transaction

            // Save individual selections
            if (value_ids && value_ids.length > 0) {
                await SavedDesign.addSelections(design.id, value_ids, client); // Pass client for transaction
            }

            await client.query('COMMIT'); // Commit transaction

            res.status(201).json({ message: 'Design saved.', design });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    /**
     * PUT /api/designs/:id
     */
    async updateDesign(req, res, next) {
        try {
            const { name, configuration, is_public, preview_image_url } = req.body;
            const fields = {};
            if (name !== undefined) fields.name = name;
            if (configuration !== undefined) fields.configuration = configuration;
            if (is_public !== undefined) fields.is_public = is_public;
            if (preview_image_url !== undefined) fields.preview_image_url = preview_image_url;

            const design = await SavedDesign.update(req.params.id, req.user.id, fields);
            if (!design) {
                return res.status(404).json({ error: 'Design not found.' });
            }
            res.json({ message: 'Design updated.', design });
        } catch (error) {
            next(error);
        }
    },

    /**
     * DELETE /api/designs/:id
     */
    async deleteDesign(req, res, next) {
        try {
            const deleted = await SavedDesign.delete(req.params.id, req.user.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Design not found.' });
            }
            res.json({ message: 'Design deleted.' });
        } catch (error) {
            next(error);
        }
    },
};

module.exports = designController;
