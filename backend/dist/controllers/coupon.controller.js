"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopPerformingCoupons = exports.deactivateExpiredCoupons = exports.getCouponStats = exports.getAvailableCoupons = exports.getUserCouponUsage = exports.applyCoupon = exports.validateCoupon = exports.deleteCoupon = exports.updateCoupon = exports.getCouponByCode = exports.getCouponById = exports.getAllCoupons = exports.createCoupon = void 0;
const coupon_service_1 = require("../services/coupon.service");
/**
 * Create a new coupon
 */
const createCoupon = async (req, res) => {
    try {
        const coupon = await coupon_service_1.CouponService.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: { coupon },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create coupon',
        });
    }
};
exports.createCoupon = createCoupon;
/**
 * Get all coupons
 */
const getAllCoupons = async (req, res) => {
    try {
        const { isActive, discountType, isExpired } = req.query;
        const filters = {
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            discountType: discountType,
            isExpired: isExpired === 'true' ? true : isExpired === 'false' ? false : undefined,
        };
        const coupons = await coupon_service_1.CouponService.getAll(filters);
        res.json({
            success: true,
            data: { coupons },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch coupons',
        });
    }
};
exports.getAllCoupons = getAllCoupons;
/**
 * Get coupon by ID
 */
const getCouponById = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await coupon_service_1.CouponService.getById(id);
        res.json({
            success: true,
            data: { coupon },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Coupon not found',
        });
    }
};
exports.getCouponById = getCouponById;
/**
 * Get coupon by code
 */
const getCouponByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const coupon = await coupon_service_1.CouponService.getByCode(code);
        res.json({
            success: true,
            data: { coupon },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Coupon not found',
        });
    }
};
exports.getCouponByCode = getCouponByCode;
/**
 * Update coupon
 */
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await coupon_service_1.CouponService.update(id, req.body);
        res.json({
            success: true,
            message: 'Coupon updated successfully',
            data: { coupon },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update coupon',
        });
    }
};
exports.updateCoupon = updateCoupon;
/**
 * Delete coupon
 */
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await coupon_service_1.CouponService.delete(id);
        res.json({
            success: true,
            message: 'Coupon deleted successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete coupon',
        });
    }
};
exports.deleteCoupon = deleteCoupon;
/**
 * Validate coupon
 */
const validateCoupon = async (req, res) => {
    try {
        const { code } = req.params;
        const { orderTotal } = req.body;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (!orderTotal || orderTotal <= 0) {
            res.status(400).json({
                success: false,
                message: 'Valid order total is required',
            });
            return;
        }
        const result = await coupon_service_1.CouponService.validate(code, req.user.userId, orderTotal);
        if (!result.valid) {
            res.status(400).json({
                success: false,
                message: result.message,
            });
            return;
        }
        res.json({
            success: true,
            message: 'Coupon is valid',
            data: {
                discount: result.discount,
                coupon: result.coupon,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to validate coupon',
        });
    }
};
exports.validateCoupon = validateCoupon;
/**
 * Apply coupon (record usage)
 */
const applyCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        await coupon_service_1.CouponService.apply(id, req.user.userId);
        res.json({
            success: true,
            message: 'Coupon applied successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to apply coupon',
        });
    }
};
exports.applyCoupon = applyCoupon;
/**
 * Get user's coupon usage history
 */
const getUserCouponUsage = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        const usage = await coupon_service_1.CouponService.getUserUsage(req.user.userId);
        res.json({
            success: true,
            data: { usage },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch coupon usage',
        });
    }
};
exports.getUserCouponUsage = getUserCouponUsage;
/**
 * Get available coupons
 */
const getAvailableCoupons = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const coupons = await coupon_service_1.CouponService.getAvailableCoupons(userId);
        res.json({
            success: true,
            data: { coupons },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch available coupons',
        });
    }
};
exports.getAvailableCoupons = getAvailableCoupons;
/**
 * Get coupon statistics
 */
const getCouponStats = async (req, res) => {
    try {
        const stats = await coupon_service_1.CouponService.getStats();
        res.json({
            success: true,
            data: { stats },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch statistics',
        });
    }
};
exports.getCouponStats = getCouponStats;
/**
 * Deactivate expired coupons
 */
const deactivateExpiredCoupons = async (req, res) => {
    try {
        const count = await coupon_service_1.CouponService.deactivateExpired();
        res.json({
            success: true,
            message: `${count} expired coupons deactivated`,
            data: { count },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to deactivate expired coupons',
        });
    }
};
exports.deactivateExpiredCoupons = deactivateExpiredCoupons;
/**
 * Get top performing coupons
 */
const getTopPerformingCoupons = async (req, res) => {
    try {
        const { limit } = req.query;
        const coupons = await coupon_service_1.CouponService.getTopPerforming(limit ? parseInt(limit) : 10);
        res.json({
            success: true,
            data: { coupons },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch top performing coupons',
        });
    }
};
exports.getTopPerformingCoupons = getTopPerformingCoupons;
