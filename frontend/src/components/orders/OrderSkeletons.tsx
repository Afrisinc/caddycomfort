import { Skeleton } from '@/components/ui/skeleton';
import { InfoCardSkeleton } from '@/components/ui/info-card';

export function OrderCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border bg-card p-6" aria-hidden="true">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

export function OrderDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading order">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 max-w-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="mb-8 flex items-center justify-between gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-6">
        <InfoCardSkeleton lines={2} />
        <InfoCardSkeleton lines={1} />
        <InfoCardSkeleton lines={4} />
      </div>
    </div>
  );
}
