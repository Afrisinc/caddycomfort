import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <Skeleton className="h-4 w-64 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* Image Gallery */}
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <Separator />

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-12 w-12 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-9 w-14" />
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-11" />
            <Skeleton className="h-11 w-11" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4 mb-16">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
