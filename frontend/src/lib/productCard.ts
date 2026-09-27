import { Product } from '@/types/api';
import { formatRwf, getProductPricing } from '@/lib/pricing';

export function toProductCardProps(product: Product) {
  const { current, original, discountPct } = getProductPricing(product);

  return {
    id: product.id,
    title: product.name,
    category: product.category?.name || 'Uncategorized',
    categorySlug: product.category?.slug,
    price: formatRwf(current),
    originalPrice: original ? formatRwf(original) : undefined,
    discount: discountPct ? `${discountPct}%` : undefined,
    image: product.imageUrl || product.images[0] || '',
    isBestSeller: product.isFeatured,
    soldOut: product.stockQuantity <= 0,
    requiresOptions: requiresOptions(product),
  };
}

export function requiresOptions(product: Pick<Product, 'sizes' | 'colors'>): boolean {
  return product.sizes.length > 1 || product.colors.length > 1;
}
