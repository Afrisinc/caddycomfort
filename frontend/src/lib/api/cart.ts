import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Cart } from '@/types/api';

export interface CartItemData {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export const cartApi = {
  get: async (): Promise<Cart> => {
    try {
      const response = await apiClient.get('/cart');
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  addItem: async (data: CartItemData): Promise<Cart> => {
    try {
      const response = await apiClient.post('/cart/items', data);
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    try {
      const response = await apiClient.patch(`/cart/items/${itemId}`, { quantity });
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  removeItem: async (itemId: string): Promise<Cart> => {
    try {
      const response = await apiClient.delete(`/cart/items/${itemId}`);
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  clear: async (): Promise<void> => {
    try {
      const response = await apiClient.delete('/cart/clear');
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  applyCoupon: async (couponCode: string): Promise<Cart> => {
    try {
      const response = await apiClient.post('/cart/coupon', { couponCode });
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  removeCoupon: async (): Promise<Cart> => {
    try {
      const response = await apiClient.delete('/cart/coupon');
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  mergeGuestCart: async (items: CartItemData[]): Promise<Cart> => {
    try {
      const response = await apiClient.post('/cart/merge', { items });
      const result = handleApiResponse<{ cart: Cart }>(response).data!;
      return result.cart;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
