import { Request, Response } from 'express';
import { CouponService } from '../services/coupon.service';

/**
 * Create a new coupon
 */
export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await CouponService.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create coupon',
    });
  }
};

/**
 * Get all coupons
 */
export const getAllCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isActive, discountType, isExpired } = req.query;

    const filters = {
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      discountType: discountType as any,
      isExpired: isExpired === 'true' ? true : isExpired === 'false' ? false : undefined,
    };

    const coupons = await CouponService.getAll(filters);

    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coupons',
    });
  }
};

/**
 * Get coupon by ID
 */
export const getCouponById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await CouponService.getById(id);

    res.json({
      success: true,
      data: { coupon },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Coupon not found',
    });
  }
};

/**
 * Get coupon by code
 */
export const getCouponByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const coupon = await CouponService.getByCode(code);

    res.json({
      success: true,
      data: { coupon },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message || 'Coupon not found',
    });
  }
};

/**
 * Update coupon
 */
export const updateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await CouponService.update(id, req.body);

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update coupon',
    });
  }
};

/**
 * Delete coupon
 */
export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await CouponService.delete(id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to delete coupon',
    });
  }
};

/**
 * Validate coupon
 */
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
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

    const result = await CouponService.validate(code, req.user.userId, orderTotal);

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
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to validate coupon',
    });
  }
};

/**
 * Apply coupon (record usage)
 */
export const applyCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    await CouponService.apply(id, req.user.userId);

    res.json({
      success: true,
      message: 'Coupon applied successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to apply coupon',
    });
  }
};

/**
 * Get user's coupon usage history
 */
export const getUserCouponUsage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const usage = await CouponService.getUserUsage(req.user.userId);

    res.json({
      success: true,
      data: { usage },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch coupon usage',
    });
  }
};

/**
 * Get available coupons
 */
export const getAvailableCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const coupons = await CouponService.getAvailableCoupons(userId);

    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch available coupons',
    });
  }
};

/**
 * Get coupon statistics
 */
export const getCouponStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await CouponService.getStats();

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch statistics',
    });
  }
};

/**
 * Deactivate expired coupons
 */
export const deactivateExpiredCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await CouponService.deactivateExpired();

    res.json({
      success: true,
      message: `${count} expired coupons deactivated`,
      data: { count },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to deactivate expired coupons',
    });
  }
};

/**
 * Get top performing coupons
 */
export const getTopPerformingCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit } = req.query;
    const coupons = await CouponService.getTopPerforming(limit ? parseInt(limit as string) : 10);

    res.json({
      success: true,
      data: { coupons },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch top performing coupons',
    });
  }
};
