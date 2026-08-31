import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Address } from '@/types/api';

export const addressesApi = {
  /**
   * Get all user addresses
   */
  getAll: async (): Promise<Address[]> => {
    try {
      const response = await apiClient.get('/addresses');
      return handleApiResponse<Address[]>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single address by ID
   */
  getById: async (id: string): Promise<Address> => {
    try {
      const response = await apiClient.get(`/addresses/${id}`);
      return handleApiResponse<Address>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get default address
   */
  getDefault: async (): Promise<Address | null> => {
    try {
      const response = await apiClient.get('/addresses/default');
      return handleApiResponse<Address>(response).data!;
    } catch (error) {
      return null;
    }
  },

  /**
   * Create new address
   */
  create: async (
    data: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Address> => {
    try {
      const response = await apiClient.post('/addresses', data);
      return handleApiResponse<Address>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update address
   */
  update: async (
    id: string,
    data: Partial<Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Address> => {
    try {
      const response = await apiClient.put(`/addresses/${id}`, data);
      return handleApiResponse<Address>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Set address as default
   */
  setDefault: async (id: string): Promise<Address> => {
    try {
      const response = await apiClient.patch(`/addresses/${id}/default`);
      return handleApiResponse<Address>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete address
   */
  delete: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/addresses/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
