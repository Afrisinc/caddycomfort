import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import {
  Customer,
  CustomerStats,
  CustomerDetail,
  CustomerStatus,
  PageMeta,
  PaginationParams,
} from '@/types/api';

export interface CustomersResult {
  customers: Customer[];
  pagination: PageMeta;
}

export const customersApi = {
  /**
   * Get all customers (Admin only)
   */
  getAll: async (
    params?: PaginationParams & { search?: string; status?: CustomerStatus | 'all' },
  ): Promise<CustomersResult> => {
    try {
      const response = await apiClient.get('/customers', { params });
      return handleApiResponse<CustomersResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get customer statistics (Admin only)
   */
  getStats: async (): Promise<CustomerStats> => {
    try {
      const response = await apiClient.get('/customers/stats');
      const result = handleApiResponse<{ stats: CustomerStats }>(response).data!;
      return result.stats;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single customer by ID (Admin only)
   */
  getById: async (id: string): Promise<CustomerDetail> => {
    try {
      const response = await apiClient.get(`/customers/${id}`);
      const result = handleApiResponse<{ customer: CustomerDetail }>(response).data!;
      return result.customer;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Suspend or reactivate a customer account (Admin only)
   */
  updateStatus: async (id: string, isActive: boolean): Promise<void> => {
    try {
      const response = await apiClient.patch(`/customers/${id}/status`, { isActive });
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
