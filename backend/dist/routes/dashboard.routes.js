"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All dashboard routes require admin access
// Get overall statistics
router.get('/stats', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getOverallStats);
// Get sales analytics
router.get('/sales', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getSalesAnalytics);
// Get top selling products
router.get('/top-products', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getTopProducts);
// Get recent orders
router.get('/recent-orders', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getRecentOrders);
// Get revenue by category
router.get('/revenue-by-category', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getRevenueByCategory);
// Get low stock alert
router.get('/low-stock', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getLowStockAlert);
// Get customer insights
router.get('/customers', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, dashboard_controller_1.DashboardController.getCustomerInsights);
exports.default = router;
