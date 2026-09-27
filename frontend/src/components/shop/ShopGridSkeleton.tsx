import { ProductGridSkeleton } from '@/components/products/ProductCardSkeleton';
import { PAGE_SIZE } from '@/lib/shopFilters';

export function ShopGridSkeleton({ count = PAGE_SIZE }: Readonly<{ count?: number }>) {
  return <ProductGridSkeleton count={count} />;
}
