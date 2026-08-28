import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Order, CreateOrderData, PaginationParams } from '@/types/api';

export interface UserOrdersResult {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersApi = {
  /**
   * Get the logged-in user's orders
   */
  getAll: async (pagination?: PaginationParams): Promise<UserOrdersResult> => {
    try {
      const params = new URLSearchParams();
      if (pagination?.page) params.append('page', pagination.page.toString());
      if (pagination?.limit) params.append('limit', pagination.limit.toString());

      const response = await apiClient.get(`/orders/my-orders?${params.toString()}`);
      return handleApiResponse<UserOrdersResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single order by ID
   */
  getById: async (id: string): Promise<Order> => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return handleApiResponse<Order>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get order by order number
   */
  getByNumber: async (orderNumber: string): Promise<Order> => {
    try {
      const response = await apiClient.get(`/orders/number/${orderNumber}`);
      return handleApiResponse<Order>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create new order
   */
  create: async (orderData: CreateOrderData): Promise<Order> => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return handleApiResponse<Order>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Cancel order
   */
  cancel: async (id: string): Promise<Order> => {
    try {
      const response = await apiClient.post(`/orders/${id}/cancel`);
      return handleApiResponse<Order>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
