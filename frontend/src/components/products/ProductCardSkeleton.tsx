import { Skeleton } from '@/components/ui/skeleton';
import { ProductGrid } from '@/components/products/ProductGrid';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col" aria-hidden="true">
      <Skeleton className="aspect-4/5 w-full rounded-xl" />
      <div className="space-y-2 pt-3.5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 6,
  columns = 3,
}: Readonly<{ count?: number; columns?: 3 | 4 }>) {
  return (
    <ProductGrid columns={columns}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </ProductGrid>
  );
}

export function ProductRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="w-20 h-20 md:w-24 md:h-24 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function ProductRowGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProductRowSkeleton key={i} />
      ))}
    </div>
  );
}
