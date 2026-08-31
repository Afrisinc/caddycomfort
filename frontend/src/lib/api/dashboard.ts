import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import {
  DashboardStats,
  SalesAnalytics,
  DashboardRecentOrder,
  DashboardLowStockProduct,
  RevenueByCategory,
  TopProduct,
  CustomerInsights,
} from '@/types/api';

export const dashboardApi = {
  /**
   * Get overall store statistics (Admin only)
   */
  getStats: async (): Promise<DashboardStats> => {
    try {
      const response = await apiClient.get('/dashboard/stats');
      return handleApiResponse<DashboardStats>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get sales analytics over a period (Admin only)
   */
  getSalesAnalytics: async (
    period: 'week' | 'month' | 'year' = 'month',
  ): Promise<SalesAnalytics> => {
    try {
      const response = await apiClient.get('/dashboard/sales', { params: { period } });
      return handleApiResponse<SalesAnalytics>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get the most recent orders store-wide (Admin only)
   */
  getRecentOrders: async (limit = 10): Promise<DashboardRecentOrder[]> => {
    try {
      const response = await apiClient.get('/dashboard/recent-orders', { params: { limit } });
      const result = handleApiResponse<{ orders: DashboardRecentOrder[] }>(response).data!;
      return result.orders;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get products running low on stock (Admin only)
   */
  getLowStockAlert: async (threshold = 10): Promise<DashboardLowStockProduct[]> => {
    try {
      const response = await apiClient.get('/dashboard/low-stock', { params: { threshold } });
      const result = handleApiResponse<{ products: DashboardLowStockProduct[] }>(response).data!;
      return result.products;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get revenue broken down by category (Admin only)
   */
  getRevenueByCategory: async (): Promise<RevenueByCategory[]> => {
    try {
      const response = await apiClient.get('/dashboard/revenue-by-category');
      const result = handleApiResponse<{ revenue: RevenueByCategory[] }>(response).data!;
      return result.revenue;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get top selling products (Admin only)
   */
  getTopProducts: async (limit = 10): Promise<TopProduct[]> => {
    try {
      const response = await apiClient.get('/dashboard/top-products', { params: { limit } });
      const result = handleApiResponse<{ products: TopProduct[] }>(response).data!;
      return result.products;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get customer insights: total, new this month, top spenders (Admin only)
   */
  getCustomerInsights: async (): Promise<CustomerInsights> => {
    try {
      const response = await apiClient.get('/dashboard/customers');
      return handleApiResponse<CustomerInsights>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
