const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth } = require('../middleware/auth');
const admin = require('../middleware/admin');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validator');
const { productSchema, productUpdateSchema } = require('../validation/productSchemas');

// Public routes
router.get('/', productController.getAll);
router.get('/featured', productController.getFeatured);
router.get('/filters', productController.getFilters);

router.get('/:idOrSlug', productController.getOne);

// Admin routes
router.post('/', auth, admin, validate(productSchema), productController.create);
router.put('/:id', auth, admin, validate(productUpdateSchema), productController.update);
router.delete('/:id', auth, admin, productController.delete);

// Product images
router.post('/:id/images', auth, admin, upload.single('image'), productController.uploadImage);
router.delete('/:id/images/:imageId', auth, admin, productController.deleteImage);

module.exports = router;
