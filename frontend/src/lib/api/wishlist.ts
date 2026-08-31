import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { WishlistItem } from '@/types/api';

export const wishlistApi = {
  /**
   * Get user's wishlist
   */
  getAll: async (): Promise<WishlistItem[]> => {
    try {
      const response = await apiClient.get('/wishlist');
      return handleApiResponse<WishlistItem[]>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get wishlist count
   */
  getCount: async (): Promise<number> => {
    try {
      const response = await apiClient.get('/wishlist/count');
      return handleApiResponse<{ count: number }>(response).data!.count;
    } catch (error) {
      return 0;
    }
  },

  /**
   * Check if product is in wishlist
   */
  checkProduct: async (productId: string): Promise<boolean> => {
    try {
      const response = await apiClient.get(`/wishlist/check/${productId}`);
      return handleApiResponse<{ inWishlist: boolean }>(response).data!.inWishlist;
    } catch (error) {
      return false;
    }
  },

  /**
   * Add product to wishlist
   */
  add: async (productId: string): Promise<WishlistItem> => {
    try {
      const response = await apiClient.post('/wishlist', { productId });
      return handleApiResponse<WishlistItem>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Remove item from wishlist by item ID
   */
  remove: async (itemId: string): Promise<void> => {
    try {
      await apiClient.delete(`/wishlist/${itemId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Remove item from wishlist by product ID
   */
  removeByProductId: async (productId: string): Promise<void> => {
    try {
      await apiClient.delete(`/wishlist/product/${productId}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Move all wishlist items to cart
   */
  moveToCart: async (): Promise<{ addedCount: number; failedCount: number }> => {
    try {
      const response = await apiClient.post('/wishlist/move-to-cart');
      return handleApiResponse<{ addedCount: number; failedCount: number }>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Clear entire wishlist
   */
  clear: async (): Promise<void> => {
    try {
      await apiClient.delete('/wishlist');
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
