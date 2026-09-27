import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export function ProductDetailSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-8"
      aria-busy="true"
      aria-label="Loading product"
    >
      <Skeleton className="mb-6 h-4 w-56 lg:mb-8" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>

        <div className="space-y-7">
          <div className="space-y-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Separator />
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-full" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-16" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-14 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-lg" />
            <Skeleton className="h-11 flex-1 rounded-md" />
            <Skeleton className="h-11 w-11 rounded-md" />
            <Skeleton className="h-11 w-11 rounded-md" />
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
