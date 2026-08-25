"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', category_controller_1.getAllCategories);
router.get('/tree', category_controller_1.getCategoryTree);
router.get('/slug/:slug', category_controller_1.getCategoryBySlug);
router.get('/:id', category_controller_1.getCategoryById);
// Admin routes
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, category_controller_1.createCategory);
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, category_controller_1.updateCategory);
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, category_controller_1.deleteCategory);
router.get('/admin/stats', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, category_controller_1.getCategoryStats);
exports.default = router;
