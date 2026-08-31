import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { User } from '@/types/api';

export const usersApi = {
  /**
   * Get user profile
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/users/profile');
      return handleApiResponse<User>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User> => {
    try {
      const response = await apiClient.put('/users/profile', data);
      return handleApiResponse<User>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Change password
   */
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    try {
      await apiClient.put('/users/change-password', data);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get user statistics
   */
  getStats: async (): Promise<{
    orders: { total: number; pending: number; completed: number };
    totalSpent: number;
    reviewCount: number;
    wishlistCount: number;
    addressCount: number;
  }> => {
    try {
      const response = await apiClient.get('/users/stats');
      return handleApiResponse<{
        orders: { total: number; pending: number; completed: number };
        totalSpent: number;
        reviewCount: number;
        wishlistCount: number;
        addressCount: number;
      }>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
