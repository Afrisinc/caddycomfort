import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { ContactResult } from '@/types/api';

export interface SubmitContactFormData {
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  subject: string;
  message: string;
}

export const contactApi = {
  submit: async (data: SubmitContactFormData): Promise<ContactResult> => {
    try {
      const response = await apiClient.post('/contact', data);
      return handleApiResponse<ContactResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

export const newsletterApi = {
  subscribe: async (email: string): Promise<ContactResult> => {
    try {
      const response = await apiClient.post('/contact/newsletter/subscribe', { email });
      return handleApiResponse<ContactResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  unsubscribe: async (email: string): Promise<ContactResult> => {
    try {
      const response = await apiClient.post('/contact/newsletter/unsubscribe', { email });
      return handleApiResponse<ContactResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
