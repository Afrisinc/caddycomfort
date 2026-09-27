import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Order, CreateOrderData, OrderStatus, PaginationParams, PaymentStatus } from '@/types/api';

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
  getAll: async (
    pagination?: PaginationParams & { status?: OrderStatus },
  ): Promise<UserOrdersResult> => {
    try {
      const params = new URLSearchParams();
      if (pagination?.page) params.append('page', pagination.page.toString());
      if (pagination?.limit) params.append('limit', pagination.limit.toString());
      if (pagination?.status) params.append('status', pagination.status);

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

export interface AdminOrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
}

export interface AdminOrderStats {
  totalOrders: number;
  byStatus: Partial<Record<OrderStatus, number>>;
  byPaymentStatus: Partial<Record<PaymentStatus, number>>;
  totalRevenue: number;
  averageOrderValue: number;
}

async function request<T>(call: () => Promise<unknown>): Promise<T> {
  try {
    const response = await call();
    return handleApiResponse<T>(response).data!;
  } catch (error) {
    throw handleApiError(error);
  }
}

export const adminOrdersApi = {
  getAll: (filters: AdminOrderFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') params.append(key, String(value));
    });
    return request<UserOrdersResult>(() => apiClient.get(`/orders/admin/all?${params.toString()}`));
  },

  getStats: () => request<AdminOrderStats>(() => apiClient.get('/orders/admin/stats')),

  updateStatus: (orderId: string, status: OrderStatus) =>
    request<Order>(() => apiClient.patch(`/orders/admin/${orderId}/status`, { status })),

  updatePaymentStatus: (orderId: string, paymentStatus: PaymentStatus) =>
    request<Order>(() =>
      apiClient.patch(`/orders/admin/${orderId}/payment-status`, { paymentStatus }),
    ),
};
