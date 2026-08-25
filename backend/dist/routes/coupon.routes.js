"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (with optional auth)
router.get('/available', auth_middleware_1.optionalAuth, coupon_controller_1.getAvailableCoupons);
// User routes (requires authentication)
router.post('/validate/:code', auth_middleware_1.authenticateToken, coupon_controller_1.validateCoupon);
router.post('/apply/:id', auth_middleware_1.authenticateToken, coupon_controller_1.applyCoupon);
router.get('/my-usage', auth_middleware_1.authenticateToken, coupon_controller_1.getUserCouponUsage);
// Admin routes
router.get('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.getAllCoupons);
router.get('/stats', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.getCouponStats);
router.get('/top-performing', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.getTopPerformingCoupons);
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.createCoupon);
router.get('/code/:code', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.getCouponByCode);
router.get('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.getCouponById);
router.put('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.updateCoupon);
router.delete('/:id', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.deleteCoupon);
router.post('/deactivate-expired', auth_middleware_1.authenticateToken, auth_middleware_1.requireAdmin, coupon_controller_1.deactivateExpiredCoupons);
exports.default = router;
