import apiClient, { handleApiResponse, handleApiError } from '@/lib/api-client';
import {
  Product,
  ProductFilters,
  PaginationParams,
  SortParams,
} from '@/types/api';

export interface ProductListResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const productsApi = {
  /**
   * Get all products with filters and pagination
   */
  getAll: async (
    filters?: ProductFilters,
    pagination?: PaginationParams,
    sort?: SortParams
  ): Promise<ProductListResult> => {
    try {
      const params = new URLSearchParams();

      if (filters) {
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
        if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
        if (filters.sizes?.length) filters.sizes.forEach(s => params.append('sizes', s));
        if (filters.colors?.length) filters.colors.forEach(c => params.append('colors', c));
        if (filters.tags?.length) filters.tags.forEach(t => params.append('tags', t));
      }

      if (pagination) {
        if (pagination.page) params.append('page', pagination.page.toString());
        if (pagination.limit) params.append('limit', pagination.limit.toString());
      }

      if (sort) {
        if (sort.sortBy) params.append('sortBy', sort.sortBy);
        if (sort.sortOrder) params.append('sortOrder', sort.sortOrder);
      }

      const response = await apiClient.get(`/products?${params.toString()}`);
      return handleApiResponse<ProductListResult>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single product by ID
   */
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.product || resData) as Product;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get single product by slug
   */
  getBySlug: async (slug: string): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/slug/${slug}`);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.product || resData) as Product;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get featured products
   */
  getFeatured: async (limit = 8): Promise<Product[]> => {
    try {
      const response = await apiClient.get(`/products/featured?limit=${limit}`);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.products || resData) as Product[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get related products
   */
  getRelated: async (productId: string, limit = 4): Promise<Product[]> => {
    try {
      const response = await apiClient.get(`/products/${productId}/related?limit=${limit}`);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.products || resData) as Product[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Search products
   */
  search: async (query: string, limit = 10): Promise<Product[]> => {
    try {
      const response = await apiClient.get(`/products/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.products || resData) as Product[];
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Create new product (Admin only)
   */
  create: async (data: {
    name: string;
    slug?: string;
    description: string;
    price: number;
    salePrice?: number;
    comparePrice?: number;
    compareAtPrice?: number;
    sku: string;
    categoryId: string;
    images?: string[];
    sizes?: string[];
    colors?: string[];
    tags?: string[];
    isFeatured?: boolean;
    stockQuantity?: number;
  }): Promise<Product> => {
    try {
      const payload = {
        ...data,
        comparePrice: data.comparePrice !== undefined ? data.comparePrice : data.compareAtPrice,
      };
      const response = await apiClient.post('/products', payload);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.product || resData) as Product;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update product (Admin only)
   */
  update: async (id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    price?: number;
    salePrice?: number;
    comparePrice?: number;
    compareAtPrice?: number;
    sku?: string;
    categoryId?: string;
    images?: string[];
    sizes?: string[];
    colors?: string[];
    tags?: string[];
    isFeatured?: boolean;
    isActive?: boolean;
  }): Promise<Product> => {
    try {
      const payload = {
        ...data,
        comparePrice: data.comparePrice !== undefined ? data.comparePrice : data.compareAtPrice,
      };
      const response = await apiClient.put(`/products/${id}`, payload);
      const resData = handleApiResponse<any>(response).data;
      return (resData?.product || resData) as Product;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Delete product (Admin only)
   */
  delete: async (id: string): Promise<void> => {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      handleApiResponse(response);
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Update product stock (Admin only)
   */
  updateStock: async (id: string, data: {
    quantity: number;
    operation?: 'add' | 'subtract' | 'set';
    type?: 'ADD' | 'SUBTRACT' | 'SET';
    reason?: string;
  }): Promise<Product> => {
    try {
      const payloadType = data.type || (data.operation ? (data.operation.toUpperCase() as 'ADD' | 'SUBTRACT' | 'SET') : 'SET');
      const response = await apiClient.patch(`/products/${id}/stock`, {
        quantity: data.quantity,
        type: payloadType,
        reason: data.reason,
      });
      const resData = handleApiResponse<any>(response).data;
      return (resData?.product || resData) as Product;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get low stock products (Admin only)
   */
  getLowStock: async (threshold = 10): Promise<Product[]> => {
    try {
      const response = await apiClient.get(`/products/admin/low-stock?threshold=${threshold}`);
      return handleApiResponse<Product[]>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get out of stock products (Admin only)
   */
  getOutOfStock: async (): Promise<Product[]> => {
    try {
      const response = await apiClient.get('/products/admin/out-of-stock');
      return handleApiResponse<Product[]>(response).data!;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  /**
   * Get product stats (Admin only)
   */
  getStats: async (): Promise<{
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalValue: number;
  }> => {
    try {
      const response = await apiClient.get('/products/admin/stats');
      const resData = handleApiResponse<any>(response).data;
      return (resData?.stats || resData) as {
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        outOfStockProducts: number;
        totalValue: number;
      };
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
