import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Customer, CustomerStats, CustomerDetail, CustomerStatus } from '@/types/api';

export const customersApi = {
  /**
   * Get all customers (Admin only)
   */
  getAll: async (params?: {
    search?: string;
    status?: CustomerStatus | 'all';
  }): Promise<Customer[]> => {
    try {
      const response = await apiClient.get('/customers', { params });
      const result = handleApiResponse<{ customers: Customer[] }>(response).data!;
      return result.customers || [];
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
