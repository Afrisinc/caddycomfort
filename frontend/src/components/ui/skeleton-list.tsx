import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SkeletonListProps {
  readonly rows?: number;
  readonly media?: boolean;
  readonly trailing?: boolean;
  readonly bordered?: boolean;
  readonly label?: string;
  readonly className?: string;
}

const TITLE_WIDTHS = ['w-1/2', 'w-2/5', 'w-3/5'];

export function SkeletonList({
  rows = 4,
  media = true,
  trailing = true,
  bordered,
  label = 'Loading',
  className,
}: SkeletonListProps) {
  return (
    <ul
      role="status"
      aria-label={label}
      className={cn(bordered ? 'space-y-2' : 'space-y-4', className)}
    >
      {Array.from({ length: rows }, (_, i) => (
        <li
          key={i}
          aria-hidden="true"
          className={cn('flex items-center gap-3', bordered && 'rounded-xl border px-3.5 py-3')}
        >
          {media && <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className={cn('h-4', TITLE_WIDTHS[i % TITLE_WIDTHS.length])} />
            <Skeleton className="h-3 w-1/3" />
          </div>
          {trailing && <Skeleton className="h-4 w-16 shrink-0" />}
        </li>
      ))}
    </ul>
  );
}
