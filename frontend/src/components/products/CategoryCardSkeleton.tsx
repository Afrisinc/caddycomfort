import { Skeleton } from '@/components/ui/skeleton';

export function CategoryCardSkeleton() {
  return <Skeleton className="h-[160px] md:h-[180px] w-full rounded-xl" />;
}

export function CategoryRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <CategoryCardSkeleton key={i} />
      ))}
    </div>
  );
}
