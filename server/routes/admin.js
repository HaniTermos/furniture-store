// ═══════════════════════════════════════════════════════════════
//  routes/admin.js — Admin API Routes
//  All routes require auth + admin/manager role
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, hasRole } = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validate } = require('../middleware/validator');
const attributeController = require('../controllers/attributeController'); // Added this line
const sizeGuideController = require('../controllers/sizeGuideController');
const { categorySchema, categoryUpdateSchema } = require('../validation/categorySchemas');
const { orderStatusSchema } = require('../validation/orderSchemas');
const { productSchema, productUpdateSchema } = require('../validation/productSchemas');
const upload = require('../middleware/upload');

const { adminLimiter } = require('../middleware/rateLimiter');

// All admin routes require auth + admin/manager role
router.use(auth, admin, adminLimiter);

// ─── Dashboard & Analytics ──────────────────────────────────
router.get('/dashboard', adminController.getDashboard);
router.get('/analytics/sales', adminController.getSalesAnalytics);

// ─── Products ───────────────────────────────────────────────
router.get('/products', adminController.getProducts);
router.post('/products', validate(productSchema), adminController.createProduct);
router.get('/products/:id', adminController.getProductDetail);
router.put('/products/:id', validate(productUpdateSchema), adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);
router.post('/products/:id/duplicate', adminController.duplicateProduct);
router.post('/products/bulk-delete', adminController.bulkDeleteProducts);
router.post('/products/bulk-update-status', adminController.bulkUpdateProductStatus);

// ─── Orders ─────────────────────────────────────────────────
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetail);
router.put('/orders/:id/status', validate(orderStatusSchema), adminController.updateOrderStatus);
router.post('/orders/bulk-update-status', adminController.bulkUpdateOrderStatus);

// ─── Customers ──────────────────────────────────────────────
router.get('/customers', adminController.getCustomers);
router.get('/customers/:id', adminController.getCustomerDetail);
router.put('/customers/:id', adminController.updateCustomer);

// ─── Reviews ────────────────────────────────────────────────
router.get('/reviews', adminController.getReviews);
router.put('/reviews/:id/approve', adminController.approveReview);
router.put('/reviews/:id/reply', adminController.replyToReview);
router.put('/reviews/:id/featured', adminController.toggleReviewFeatured);
router.delete('/reviews/:id', adminController.deleteReview);

// ─── Categories ─────────────────────────────────────────────
router.get('/categories', adminController.getCategoriesTree);
router.post('/categories', validate(categorySchema), adminController.createCategory);
router.get('/categories/:id', adminController.getCategoryDetail);
router.put('/categories/:id', validate(categoryUpdateSchema), adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);
router.post('/categories/reorder', adminController.reorderCategories);

// ─── Tags ───────────────────────────────────────────────────
router.get('/tags', adminController.getTags);
router.post('/tags', adminController.createTag);
router.put('/tags/:id', adminController.updateTag);
router.delete('/tags/:id', adminController.deleteTag);
router.post('/tags/bulk', adminController.bulkCreateTags);

// ─── Attributes & Values ────────────────────────────────────
router.get('/attributes', attributeController.getAttributes);
router.post('/attributes', attributeController.createAttribute);
router.get('/attributes/:id', attributeController.getAttributeDetail);
router.put('/attributes/:id', attributeController.updateAttribute);
router.delete('/attributes/:id', attributeController.deleteAttribute);

router.post('/attributes/:attributeId/values', attributeController.createValue);
router.put('/attributes/:attributeId/values/:valueId', attributeController.updateValue);
router.delete('/attributes/:attributeId/values/:valueId', attributeController.deleteValue);

// ─── Size Guides ────────────────────────────────────────────
router.get('/size-guides', sizeGuideController.getSizeGuides);
router.post('/size-guides', sizeGuideController.createSizeGuide);
router.get('/size-guides/:id', sizeGuideController.getSizeGuideDetail);
router.put('/size-guides/:id', sizeGuideController.updateSizeGuide);
router.delete('/size-guides/:id', sizeGuideController.deleteSizeGuide);

// ─── Contact Messages ───────────────────────────────────────
router.get('/messages', adminController.getContactMessages);
router.get('/messages/:id', adminController.getContactMessageDetail);
router.put('/messages/:id/reply', adminController.replyToContactMessage);
router.delete('/messages/:id', adminController.deleteContactMessage);

// ─── Notifications ──────────────────────────────────────────
router.get('/notifications', adminController.getNotifications);
router.put('/notifications/:id/read', adminController.markNotificationRead);
router.put('/notifications/clear', adminController.clearAllNotifications);

// ─── Configuration ──────────────────────────────────────────
router.post('/config-options', adminController.createConfigurationOption);
router.post('/config-values', adminController.createConfigurationValue);

// ─── Inventory ──────────────────────────────────────────────
router.get('/inventory/low-stock', adminController.getLowStock);
router.post('/inventory/adjust', adminController.adjustStock);
router.get('/inventory/movements', adminController.getStockMovements);

// ─── Coupons ────────────────────────────────────────────────
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// ─── Staff Management (super_admin only for logic enforcement) ──
router.get('/users', adminController.getStaff);
router.post('/users', adminController.createStaff);
router.put('/users/:id/role', adminController.updateStaffRole);
router.put('/users/:id/status', adminController.toggleStaffStatus);
router.delete('/users/:id', adminController.deleteStaff);

// ─── Activity Logs ──────────────────────────────────────────
router.get('/activity-logs', adminController.getActivityLogs);

// ─── Image Upload ───────────────────────────────────────────
router.post('/upload/image', upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No image file provided.' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({
        message: 'Image uploaded.',
        url: `${baseUrl}/uploads/${req.file.filename}`,
        filename: req.file.filename,
    });
});

router.post('/upload/images', upload.array('images', 10), async (req, res) => {
    if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No image files provided.' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = req.files.map(f => ({
        url: `${baseUrl}/uploads/${f.filename}`,
        filename: f.filename,
    }));
    res.json({ message: `${urls.length} images uploaded.`, files: urls });
});

// ─── Site Settings ──────────────────────────────────────────
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// ─── Data Export ────────────────────────────────────────────
router.get('/export/:type', adminController.exportData);

// ─── Currency Management ────────────────────────────────────
router.get('/currencies', adminController.getCurrencies);
router.post('/currencies', adminController.createCurrency);
router.put('/currencies/:id', adminController.updateCurrency);
router.delete('/currencies/:id', adminController.deleteCurrency);

module.exports = router;
