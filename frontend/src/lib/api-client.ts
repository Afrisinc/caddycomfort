import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiError, ApiResponse } from '@/types/api';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MAX_MESSAGE_LENGTH = 500;

const stripHtml = (html: string) =>
  html
    .replace(/<(head|script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const messageFromItem = (item: unknown): string | undefined => {
  if (typeof item === 'string') return item;
  if (item && typeof item === 'object') {
    const { message, msg } = item as { message?: unknown; msg?: unknown };
    if (typeof message === 'string') return message;
    if (typeof msg === 'string') return msg;
  }
  return undefined;
};

export const extractResponseMessage = (data: unknown): string | undefined => {
  if (typeof data === 'string') {
    const text = stripHtml(data);
    return text ? text.slice(0, MAX_MESSAGE_LENGTH) : undefined;
  }
  if (!data || typeof data !== 'object') return undefined;

  const { message, error, errors } = data as {
    message?: unknown;
    error?: unknown;
    errors?: unknown;
  };
  const details = Array.isArray(errors)
    ? errors.map(messageFromItem).filter((item): item is string => Boolean(item))
    : [];
  const primary = messageFromItem(message) ?? messageFromItem(error);

  if (primary && details.length > 0 && !details.includes(primary)) {
    return `${primary}: ${details.join('; ')}`;
  }
  return primary ?? (details.length > 0 ? details.join('; ') : undefined);
};

export const extractResponseCode = (data: unknown): string | undefined => {
  const code = (data as { error?: unknown } | null | undefined)?.error;
  return typeof code === 'string' ? code : undefined;
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const UPLOAD_REQUEST_CONFIG = { timeout: 0 } as const;

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError<unknown>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: extractResponseMessage(error.response?.data) || error.message || 'An error occurred',
      error: extractResponseCode(error.response?.data),
      statusCode: error.response?.status,
    };

    return Promise.reject(apiError);
  },
);

// Helper function to handle API responses
export const handleApiResponse = <T>(response: any): ApiResponse<T> => {
  return response.data;
};

// Helper function to handle API errors
export const handleApiError = (error: any): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: extractResponseMessage(error.response?.data) || error.message || 'Network error',
      error: extractResponseCode(error.response?.data),
      statusCode: error.response?.status,
    };
  }
  return {
    message: error.message || 'An unexpected error occurred',
  };
};

export default apiClient;
