import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Coupon, CouponValidation, CouponStats } from '@/types/api';

export interface CreateCouponData {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}

export type UpdateCouponData = Partial<CreateCouponData>;

export const couponsApi = {
  /**
   * Get available coupons (public/customer-facing)
   */
  getAvailable: async (): Promise<Coupon[]> => {
    try {
      const response = await apiClient.get('/coupons/available');
      const result = handleApiResponse<{ coupons: Coupon[] }>(response).data!;
      return result.coupons;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get coupon by code (admin only)
   */
  getByCode: async (code: string): Promise<Coupon> => {
    try {
      const response = await apiClient.get(`/coupons/code/${code}`);
      const result = handleApiResponse<{ coupon: Coupon }>(response).data!;
      return result.coupon;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Validate a coupon code against an order total
   */
  validate: async (code: string, orderTotal: number): Promise<CouponValidation> => {
    try {
      const response = await apiClient.post(`/coupons/validate/${code}`, { orderTotal });
      const result = handleApiResponse<{ discount: number; coupon: Coupon }>(response).data!;
      return { valid: true, discount: result.discount, coupon: result.coupon };
    } catch (error) {
      const apiError = handleApiError(error);
      return { valid: false, message: apiError.message };
    }
  },

  /**
   * Get the logged-in user's coupon usage history
   */
  getUserUsage: async (): Promise<any[]> => {
    try {
      const response = await apiClient.get('/coupons/my-usage');
      const result = handleApiResponse<{ usage: any[] }>(response).data!;
      return result.usage;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get all coupons (Admin only)
   */
  getAll: async (filters?: { isActive?: boolean; discountType?: string; isExpired?: boolean }): Promise<Coupon[]> => {
    try {
      const response = await apiClient.get('/coupons', { params: filters });
      const result = handleApiResponse<{ coupons: Coupon[] }>(response).data!;
      return result.coupons;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single coupon by ID (Admin only)
   */
  getById: async (id: string): Promise<Coupon> => {
    try {
      const response = await apiClient.get(`/coupons/${id}`);
      const result = handleApiResponse<{ coupon: Coupon }>(response).data!;
      return result.coupon;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create a new coupon (Admin only)
   */
  create: async (data: CreateCouponData): Promise<Coupon> => {
    try {
      const response = await apiClient.post('/coupons', data);
      const result = handleApiResponse<{ coupon: Coupon }>(response).data!;
      return result.coupon;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update a coupon (Admin only)
   */
  update: async (id: string, data: UpdateCouponData): Promise<Coupon> => {
    try {
      const response = await apiClient.put(`/coupons/${id}`, data);
      const result = handleApiResponse<{ coupon: Coupon }>(response).data!;
      return result.coupon;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete a coupon (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`/coupons/${id}`);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get coupon statistics (Admin only)
   */
  getStats: async (): Promise<CouponStats> => {
    try {
      const response = await apiClient.get('/coupons/stats');
      const result = handleApiResponse<{ stats: CouponStats }>(response).data!;
      return result.stats;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get top performing coupons by usage (Admin only)
   */
  getTopPerforming: async (limit = 5): Promise<Coupon[]> => {
    try {
      const response = await apiClient.get('/coupons/top-performing', { params: { limit } });
      const result = handleApiResponse<{ coupons: Coupon[] }>(response).data!;
      return result.coupons;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Bulk-deactivate all expired coupons (Admin only)
   */
  deactivateExpired: async (): Promise<number> => {
    try {
      const response = await apiClient.post('/coupons/deactivate-expired');
      const result = handleApiResponse<{ count: number }>(response).data!;
      return result.count;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
