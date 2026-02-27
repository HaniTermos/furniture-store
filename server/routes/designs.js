const express = require('express');
const router = express.Router();
const designController = require('../controllers/desginController');
const { auth } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { designSchema, designUpdateSchema } = require('../validation/designSchemas');

// Public route for shared designs
router.get('/shared/:token', designController.getSharedDesign);

// Protected routes
router.get('/', auth, designController.getUserDesigns);
router.get('/:id', auth, designController.getDesign);
router.post('/', auth, validate(designSchema), designController.saveDesign);
router.put('/:id', auth, validate(designUpdateSchema), designController.updateDesign);
router.delete('/:id', auth, designController.deleteDesign);

module.exports = router;
