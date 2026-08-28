import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import { Category } from '@/types/api';

export const categoriesApi = {
  /**
   * Get all categories
   */
  getAll: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/categories');
      const result = handleApiResponse<{ categories: Category[] }>(response).data!;
      return result.categories || [];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single category by ID
   */
  getById: async (id: string): Promise<Category> => {
    try {
      const response = await apiClient.get(`/categories/${id}`);
      const result = handleApiResponse<{ category: Category }>(response).data!;
      return result.category;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get category by slug
   */
  getBySlug: async (slug: string): Promise<Category> => {
    try {
      const response = await apiClient.get(`/categories/slug/${slug}`);
      const result = handleApiResponse<{ category: Category }>(response).data!;
      return result.category;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get category tree (hierarchical)
   */
  getTree: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/categories/tree');
      return handleApiResponse<Category[]>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create new category (Admin only)
   */
  create: async (data: {
    name: string;
    slug?: string;
    description?: string;
    parentId?: string;
    image?: string;
  }): Promise<Category> => {
    try {
      const response = await apiClient.post('/categories', data);
      return handleApiResponse<Category>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update category (Admin only)
   */
  update: async (id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    parentId?: string;
    image?: string;
  }): Promise<Category> => {
    try {
      const response = await apiClient.put(`/categories/${id}`, data);
      return handleApiResponse<Category>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete category (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`/categories/${id}`);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get category stats (Admin only)
   */
  getStats: async (): Promise<{
    totalCategories: number;
    categoriesWithProducts: number;
    topCategories: Array<{ category: string; productCount: number }>;
  }> => {
    try {
      const response = await apiClient.get('/categories/admin/stats');
      return handleApiResponse(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
