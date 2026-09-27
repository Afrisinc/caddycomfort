import { Product } from '@/types/api';
import { formatRwf, getProductPricing } from '@/lib/pricing';

/** Maps a real Product into the flat, pre-formatted props ProductCard expects. */
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
  };
}
