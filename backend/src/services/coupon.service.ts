import { Coupon, DiscountType } from '@prisma/client';
import prisma from '../config/database';

interface CreateCouponData {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  isActive?: boolean;
}

interface UpdateCouponData {
  code?: string;
  description?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive?: boolean;
}

interface ValidateCouponResult {
  valid: boolean;
  message?: string;
  discount?: number;
  coupon?: Coupon;
}

export class CouponService {
  /**
   * Create a new coupon
   */
  static async create(data: CreateCouponData): Promise<Coupon> {
    // Check if coupon code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new Error('Coupon code already exists');
    }

    // Validate discount value
    if (data.discountType === 'PERCENTAGE' && data.discountValue > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    if (data.discountValue <= 0) {
      throw new Error('Discount value must be greater than 0');
    }

    // Validate dates
    if (new Date(data.validFrom) >= new Date(data.validUntil)) {
      throw new Error('Start date must be before end date');
    }

    return prisma.coupon.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
      },
    });
  }

  /**
   * Get all coupons with filters
   */
  static async getAll(filters?: {
    isActive?: boolean;
    discountType?: DiscountType;
    isExpired?: boolean;
  }) {
    const { isActive, discountType, isExpired } = filters || {};

    const where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (discountType) {
      where.discountType = discountType;
    }

    if (isExpired === true) {
      where.validUntil = { lt: new Date() };
    } else if (isExpired === false) {
      where.validUntil = { gte: new Date() };
    }

    const coupons = await prisma.coupon.findMany({
      where,
      include: {
        _count: {
          select: { usages: true, orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return coupons;
  }

  /**
   * Get coupon by ID
   */
  static async getById(id: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { usedAt: 'desc' },
          take: 50,
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            discount: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: { usages: true, orders: true },
        },
      },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    return coupon;
  }

  /**
   * Get coupon by code
   */
  static async getByCode(code: string) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    return coupon;
  }

  /**
   * Update coupon
   */
  static async update(id: string, data: UpdateCouponData): Promise<Coupon> {
    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Check if new code is unique (if provided)
    if (data.code && data.code !== coupon.code) {
      const existing = await prisma.coupon.findUnique({
        where: { code: data.code.toUpperCase() },
      });

      if (existing) {
        throw new Error('Coupon code already exists');
      }
    }

    // Validate discount value (if provided)
    if (data.discountValue !== undefined) {
      const discountType = data.discountType || coupon.discountType;
      if (discountType === 'PERCENTAGE' && data.discountValue > 100) {
        throw new Error('Percentage discount cannot exceed 100%');
      }
      if (data.discountValue <= 0) {
        throw new Error('Discount value must be greater than 0');
      }
    }

    // Validate dates (if provided)
    if (data.validFrom && data.validUntil) {
      if (new Date(data.validFrom) >= new Date(data.validUntil)) {
        throw new Error('Start date must be before end date');
      }
    }

    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        code: data.code?.toUpperCase(),
      },
    });
  }

  /**
   * Delete coupon
   */
  static async delete(id: string): Promise<void> {
    // Check if coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Check if coupon has been used in orders
    if (coupon.orders.length > 0) {
      throw new Error('Cannot delete coupon that has been used in orders. Consider deactivating instead.');
    }

    await prisma.coupon.delete({
      where: { id },
    });
  }

  /**
   * Validate coupon for a user and order
   */
  static async validate(
    code: string,
    userId: string,
    orderTotal: number
  ): Promise<ValidateCouponResult> {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        usages: {
          where: { userId },
        },
      },
    });

    // Check if coupon exists
    if (!coupon) {
      return { valid: false, message: 'Invalid coupon code' };
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return { valid: false, message: 'Coupon is not active' };
    }

    // Check if coupon has started
    const now = new Date();
    if (coupon.validFrom && now < coupon.validFrom) {
      return { valid: false, message: 'Coupon is not yet valid' };
    }

    // Check if coupon has expired
    if (coupon.validUntil && now > coupon.validUntil) {
      return { valid: false, message: 'Coupon has expired' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Coupon usage limit reached' };
    }

    // Check minimum purchase requirement
    if (coupon.minPurchaseAmount && orderTotal < coupon.minPurchaseAmount) {
      return {
        valid: false,
        message: `Minimum purchase of ${coupon.minPurchaseAmount} required`,
      };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (orderTotal * coupon.discountValue) / 100;
      // Apply max discount cap if set
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discount = coupon.discountValue;
      // Discount cannot exceed order total
      if (discount > orderTotal) {
        discount = orderTotal;
      }
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discount = 0; // Shipping discount handled separately
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      coupon,
    };
  }

  /**
   * Apply coupon (record usage)
   */
  static async apply(couponId: string, userId: string): Promise<void> {
    // Validate that coupon exists
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new Error('Coupon not found');
    }

    // Record usage
    await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId,
          userId,
        },
      }),
      prisma.coupon.update({
        where: { id: couponId },
        data: {
          usedCount: { increment: 1 },
        },
      }),
    ]);
  }

  /**
   * Get user's coupon usage history
   */
  static async getUserUsage(userId: string) {
    return prisma.couponUsage.findMany({
      where: { userId },
      include: {
        coupon: true,
      },
      orderBy: { usedAt: 'desc' },
    });
  }

  /**
   * Get active coupons available for user
   */
  static async getAvailableCoupons(userId?: string) {
    const now = new Date();
    
    const coupons = await prisma.coupon.findMany({
      where: {
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
        OR: [
          { usageLimit: null },
          { usedCount: { lt: prisma.coupon.fields.usageLimit } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    return coupons;
  }

  /**
   * Get coupon statistics
   */
  static async getStats() {
    const now = new Date();

    const [total, active, expired, used, unused] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.count({
        where: {
          isActive: true,
          validFrom: { lte: now },
          validUntil: { gte: now },
        },
      }),
      prisma.coupon.count({
        where: {
          validUntil: { lt: now },
        },
      }),
      prisma.coupon.count({
        where: {
          usedCount: { gt: 0 },
        },
      }),
      prisma.coupon.count({
        where: {
          usedCount: 0,
        },
      }),
    ]);

    // Get total discount given
    const discountStats = await prisma.order.aggregate({
      _sum: { discount: true },
      where: {
        couponId: { not: null },
      },
    });

    return {
      total,
      active,
      expired,
      used,
      unused,
      totalDiscountGiven: discountStats._sum.discount || 0,
    };
  }

  /**
   * Deactivate expired coupons (can be run as cron job)
   */
  static async deactivateExpired(): Promise<number> {
    const result = await prisma.coupon.updateMany({
      where: {
        validUntil: { lt: new Date() },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    return result.count;
  }

  /**
   * Get top performing coupons
   */
  static async getTopPerforming(limit = 10) {
    return prisma.coupon.findMany({
      where: {
        usedCount: { gt: 0 },
      },
      include: {
        _count: {
          select: { usages: true, orders: true },
        },
      },
      orderBy: {
        usedCount: 'desc',
      },
      take: limit,
    });
  }
}
