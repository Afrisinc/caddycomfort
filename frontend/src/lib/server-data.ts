import apiClient from '@/lib/api-client';
import { Category, Product } from '@/types/api';

export async function fetchApi<T>(path: string): Promise<T> {
  const response = await apiClient.get(path);
  return response.data.data;
}

function discountPercent(product: Product): number {
  if (!product.comparePrice || product.comparePrice <= product.price) return 0;
  return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
}

export async function getHomeCategories(): Promise<Category[]> {
  const { categories } = await fetchApi<{ categories: Category[] }>('/categories');
  return categories
    .filter((c) => (c._count?.products ?? 0) > 0)
    .sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0))
    .slice(0, 8);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await fetchApi<{ products: Product[] }>(
    '/products?isFeatured=true&isActive=true&limit=8',
  );
  return products;
}

export async function getMostSellingProducts(): Promise<Product[]> {
  const { products } = await fetchApi<{ products: Product[] }>(
    '/products?isActive=true&limit=4&sortBy=popularity&sortOrder=desc',
  );
  return products;
}

export async function getFlashSaleProducts(): Promise<Product[]> {
  const { products } = await fetchApi<{ products: Product[] }>(
    '/products?isActive=true&limit=24&sortBy=createdAt&sortOrder=desc',
  );
  const discounted = products
    .filter((p) => discountPercent(p) > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .slice(0, 8);
  return discounted.length > 0 ? discounted : products.slice(0, 8);
}
