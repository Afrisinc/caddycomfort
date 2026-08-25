import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from '@/types/api';

export const authApi = {
  /**
   * Login user
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const data = handleApiResponse<AuthResponse>(response);
      return data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Register new user
   */
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const data = handleApiResponse<AuthResponse>(response);
      return data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      const data = handleApiResponse<{ accessToken: string }>(response);
      return data.data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get('/users/profile');
      const data = handleApiResponse<User>(response);
      return data.data || data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Verify if user is authenticated
   */
  verifyAuth: async (): Promise<boolean> => {
    try {
      await apiClient.get('/users/profile');
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Verify email with the code sent at registration
   */
  verifyEmail: async (email: string, code: string): Promise<User> => {
    try {
      const response = await apiClient.post('/auth/verify-email', { email, code });
      const data = handleApiResponse<{ user: User }>(response);
      return data.data!.user;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Resend the account verification code
   */
  resendVerification: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/resend-verification', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Request a password reset email
   */
  forgotPassword: async (email: string): Promise<void> => {
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Reset password using the token sent by email
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
