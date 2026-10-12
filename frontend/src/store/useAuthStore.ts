import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, usersApi } from '@/lib/api';
import { onSessionExpired, tokenStorage } from '@/lib/auth-session';

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  avatar?: string | null;
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
  updateProfile: (userData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string | null;
  }) => Promise<void>;
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

          tokenStorage.setTokens(response);

          // Set user data
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          // Clear any existing auth data on failed login
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      register: async (userData) => {
        try {
          const response = await authApi.register(userData);

          tokenStorage.setTokens(response);

          // Set user data
          set({
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error: any) {
          // Clear any existing auth data on failed registration
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        const refreshToken = tokenStorage.getRefreshToken();

        // Sign out locally first so the UI never waits on the network.
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false });

        if (!refreshToken) return;

        try {
          await authApi.logout(refreshToken);
        } catch (error) {
          // The token expires on its own; a failed revoke must not block sign-out.
          console.warn('Failed to revoke refresh token on logout:', error);
        }
      },

      updateProfile: async (userData) => {
        const updated = await usersApi.updateProfile(userData);
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                firstName: updated.firstName,
                lastName: updated.lastName,
                phone: updated.phone,
                avatar: updated.avatar,
              }
            : null,
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
        if (!tokenStorage.getAccessToken()) {
          set({ user: null, isAuthenticated: false });
          return false;
        }

        try {
          const isValid = await authApi.verifyAuth();
          if (!isValid) {
            tokenStorage.clear();
            set({ user: null, isAuthenticated: false });
            return false;
          }
          return true;
        } catch {
          tokenStorage.clear();
          set({ user: null, isAuthenticated: false });
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    },
  ),
);

// A persisted user without tokens (e.g. signed out in another tab) is stale.
if (useAuthStore.getState().isAuthenticated && !tokenStorage.getAccessToken()) {
  useAuthStore.setState({ user: null, isAuthenticated: false });
}

// The API client ends the session when a token refresh is rejected.
onSessionExpired(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
