import { fetchApi } from '@/lib/server-data';
import { Category, Product, ProductReviewStats } from '@/types/api';

export interface ShopFilters {
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ShopProductsResult {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  category?: Category | null;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await fetchApi<Category>(`/categories/slug/${slug}`);
  } catch {
    return null;
  }
}

// Accepts categorySlug directly so the backend can resolve slug -> id and
// return the matching category alongside the products in a single request,
// instead of the caller needing to resolve it first in a separate round trip.
export async function getShopProducts(filters: ShopFilters): Promise<ShopProductsResult> {
  const params = new URLSearchParams();

  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (!filters.categoryId && filters.categorySlug)
    params.append('categorySlug', filters.categorySlug);
  if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  filters.sizes?.forEach((s) => params.append('sizes', s));
  filters.colors?.forEach((c) => params.append('colors', c));
  params.append('isActive', 'true');
  params.append('page', (filters.page ?? 1).toString());
  params.append('limit', (filters.limit ?? 12).toString());
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  return fetchApi<ShopProductsResult>(`/products?${params.toString()}`);
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const data = await fetchApi<any>(`/products/${id}`);
    return (data?.product || data) as Product;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  categoryId: string | undefined,
  excludeId: string,
): Promise<Product[]> {
  if (!categoryId) return [];
  const { products } = await fetchApi<{ products: Product[] }>(
    `/products?categoryId=${categoryId}&isActive=true&limit=5`,
  );
  return products.filter((p) => p.id !== excludeId).slice(0, 4);
}

export async function getProductReviews(productId: string): Promise<ProductReviewStats | null> {
  try {
    return await fetchApi<ProductReviewStats>(`/reviews/products/${productId}`);
  } catch {
    return null;
  }
}
