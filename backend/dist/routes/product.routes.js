"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("../controllers/product.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', product_controller_1.getAllProducts);
router.get('/featured', product_controller_1.getFeaturedProducts);
router.get('/search', product_controller_1.searchProducts);
router.get('/slug/:slug', product_controller_1.getProductBySlug);
router.get('/:id', product_controller_1.getProductById);
// Admin routes
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.createProduct);
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.updateProduct);
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.deleteProduct);
router.patch('/:id/stock', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.updateProductStock);
router.get('/:id/inventory-logs', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.getProductInventoryLogs);
router.get('/admin/low-stock', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.getLowStockProducts);
router.get('/admin/out-of-stock', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.getOutOfStockProducts);
router.get('/admin/stats', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.getProductStats);
router.post('/admin/bulk-update', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, product_controller_1.bulkUpdateProducts);
exports.default = router;
