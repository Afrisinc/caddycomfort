import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  role?: string;
  isVerified?: boolean;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const response = await authApi.login({ email, password });
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          // Set user data
          set({ 
            user: response.user, 
            isAuthenticated: true 
          });
        } catch (error: any) {
          // Clear any existing auth data on failed login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          const response = await authApi.register(userData);
          
          // Store tokens in localStorage
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);

          // Set user data
          set({ 
            user: response.user, 
            isAuthenticated: true 
          });
        } catch (error: any) {
          // Clear any existing auth data on failed registration
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call logout API to invalidate tokens on backend
          await authApi.logout();
        } catch (error: any) {
          // Silently handle logout API errors - local cleanup is more important
          // Only log if it's not a network/auth error
          if (error?.response?.status && error.response.status !== 401 && error.response.status !== 403) {
            console.warn('Logout API warning:', error.message);
          }
        } finally {
          // Always clear local storage and state
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      updateProfile: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      verifyEmail: async (email, code) => {
        const user = await authApi.verifyEmail(email, code);
        set((state) => ({
          user: state.user ? { ...state.user, isVerified: user.isVerified } : null,
        }));
      },

      resendVerification: async (email) => {
        await authApi.resendVerification(email);
      },

      forgotPassword: async (email) => {
        await authApi.forgotPassword(email);
      },

      resetPassword: async (token, newPassword) => {
        await authApi.resetPassword(token, newPassword);
      },

      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const isValid = await authApi.verifyAuth();
          if (!isValid) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false });
            return false;
          }
          return true;
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
