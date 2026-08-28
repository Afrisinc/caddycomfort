import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border border-border/50 bg-card">
      <div className="p-4">
        <Skeleton className="h-[300px] md:h-[350px] w-full rounded-lg" />
      </div>
      <div className="p-5 space-y-2.5">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </Card>
  );
}

/** Renders `count` card skeletons inside the same grid classes the real product grid uses. */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** A horizontal image+text row, for list-style product placements (e.g. "Most Selling"). */
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
