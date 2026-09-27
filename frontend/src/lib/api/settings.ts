import apiClient, { handleApiError, handleApiResponse } from '@/lib/api-client';
import type { StoreSettings } from '@/lib/storeSettings';

export const settingsApi = {
  get: async (): Promise<StoreSettings> => {
    try {
      return handleApiResponse<StoreSettings>(await apiClient.get('/settings')).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  update: async (data: Partial<StoreSettings>): Promise<StoreSettings> => {
    try {
      return handleApiResponse<StoreSettings>(await apiClient.patch('/settings', data)).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
