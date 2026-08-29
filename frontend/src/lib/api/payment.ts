import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';

export interface InitiatePaymentData {
  email?: string;
  phoneNumber?: string;
  customerName?: string;
}

export interface InitiatePaymentResult {
  method: 'CARD' | 'MOBILE_MONEY' | 'NONE';
  checkoutUrl?: string;
  paymentRef?: string;
  message: string;
}

export interface PaymentStatusResult {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED';
  paymentStatus: string;
  orderStatus: string;
}

export const paymentApi = {
  initiate: async (orderId: string, data: InitiatePaymentData): Promise<InitiatePaymentResult> => {
    try {
      const response = await apiClient.post(`/payments/${orderId}/initiate`, data);
      return handleApiResponse<InitiatePaymentResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getStatus: async (orderId: string): Promise<PaymentStatusResult> => {
    try {
      const response = await apiClient.get(`/payments/${orderId}/status`);
      return handleApiResponse<PaymentStatusResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
