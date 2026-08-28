import { Product } from '@/types/api';

/** Maps a real Product into the flat, pre-formatted props ProductCard expects. */
export function toProductCardProps(product: Product) {
  const hasDiscount = product.comparePrice != null && product.comparePrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : undefined;

  return {
    id: product.id,
    title: product.name,
    category: product.category?.name || 'Uncategorized',
    categorySlug: product.category?.slug,
    price: `Rwf ${product.price.toLocaleString()}`,
    originalPrice: hasDiscount ? `Rwf ${product.comparePrice!.toLocaleString()}` : undefined,
    discount: discountPct ? `${discountPct}%` : undefined,
    image: product.imageUrl || product.images[0] || '',
    isBestSeller: product.isFeatured,
  };
}
