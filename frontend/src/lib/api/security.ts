import apiClient, { handleApiError, handleApiResponse } from '@/lib/api-client';
import type {
  LoginAttempt,
  LoginAttemptStats,
  LoginRange,
  PageMeta,
  PaginationParams,
} from '@/types/api';

export interface LoginAttemptsResult {
  attempts: LoginAttempt[];
  pagination: PageMeta;
}

export const securityApi = {
  getLoginAttempts: async (
    params: PaginationParams & {
      range: LoginRange;
      status?: 'success' | 'failed';
      search?: string;
    },
  ): Promise<LoginAttemptsResult> => {
    try {
      const response = await apiClient.get('/security/login-attempts', { params });
      return handleApiResponse<LoginAttemptsResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getLoginStats: async (range: LoginRange): Promise<LoginAttemptStats> => {
    try {
      const response = await apiClient.get('/security/login-attempts/stats', { params: { range } });
      return handleApiResponse<{ stats: LoginAttemptStats }>(response).data!.stats;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
