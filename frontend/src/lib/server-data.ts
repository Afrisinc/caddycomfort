import { Category, Product } from '@/types/api';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';

async function fetchApi<T>(path: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(`${BACKEND_URL}/api${path}`, { next: { revalidate: revalidateSeconds } });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  const json = await res.json();
  return json.data;
}

function discountPercent(product: Product): number {
  if (!product.comparePrice || product.comparePrice <= product.price) return 0;
  return Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
}

export async function getHomeCategories(): Promise<Category[]> {
  const { categories } = await fetchApi<{ categories: Category[] }>('/categories', 300);
  return categories
    .filter((c) => (c._count?.products ?? 0) > 0)
    .sort((a, b) => (b._count?.products ?? 0) - (a._count?.products ?? 0))
    .slice(0, 8);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await fetchApi<{ products: Product[] }>(
    '/products?isFeatured=true&isActive=true&limit=8',
    300
  );
  return products;
}

export async function getMostSellingProducts(): Promise<Product[]> {
  const { products } = await fetchApi<{ products: Product[] }>(
    '/products?isActive=true&limit=4&sortBy=popularity&sortOrder=desc',
    300
  );
  return products;
}

export async function getFlashSaleProducts(): Promise<Product[]> {
  const { products } = await fetchApi<{ products: Product[] }>(
    '/products?isActive=true&limit=24&sortBy=createdAt&sortOrder=desc',
    300
  );
  const discounted = products
    .filter((p) => discountPercent(p) > 0)
    .sort((a, b) => discountPercent(b) - discountPercent(a))
    .slice(0, 8);
  return discounted.length > 0 ? discounted : products.slice(0, 8);
}
