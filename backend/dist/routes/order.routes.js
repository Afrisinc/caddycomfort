"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_middleware_1.authenticateToken);
// User routes
router.post('/', order_controller_1.OrderController.createOrder);
router.get('/my-orders', order_controller_1.OrderController.getUserOrders);
router.get('/:orderId', order_controller_1.OrderController.getOrderById);
router.get('/number/:orderNumber', order_controller_1.OrderController.getOrderByNumber);
router.post('/:orderId/cancel', order_controller_1.OrderController.cancelOrder);
// Admin routes
router.get('/admin/all', auth_middleware_1.requireAdmin, order_controller_1.OrderController.getAllOrders);
router.get('/admin/stats', auth_middleware_1.requireAdmin, order_controller_1.OrderController.getOrderStats);
router.get('/admin/recent', auth_middleware_1.requireAdmin, order_controller_1.OrderController.getRecentOrders);
router.patch('/admin/:orderId/status', auth_middleware_1.requireAdmin, order_controller_1.OrderController.updateOrderStatus);
router.patch('/admin/:orderId/payment-status', auth_middleware_1.requireAdmin, order_controller_1.OrderController.updatePaymentStatus);
exports.default = router;
