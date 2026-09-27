import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export interface RankedBarItem {
  readonly id: string;
  readonly label: ReactNode;
  readonly detail?: ReactNode;
  readonly value: number;
  readonly display: ReactNode;
  readonly media?: ReactNode;
}

interface RankedBarListProps {
  readonly items: readonly RankedBarItem[];
  readonly loading?: boolean;
  readonly rows?: number;
}

export function RankedBarList({ items, loading, rows = 5 }: RankedBarListProps) {
  if (loading) {
    return (
      <ul className="space-y-5" aria-busy="true">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="space-y-2">
            <div className="flex justify-between gap-4">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-1.5 w-full" />
          </li>
        ))}
      </ul>
    );
  }

  const max = Math.max(...items.map((item) => item.value), 0);

  return (
    <ol className="space-y-5">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-center gap-3">
          {item.media ?? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
              {index + 1}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="truncate text-sm font-medium">{item.label}</p>
              <p className="shrink-0 text-sm font-semibold tabular-nums">{item.display}</p>
            </div>
            {item.detail && <p className="truncate text-xs text-muted-foreground">{item.detail}</p>}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-accent-rose transition-[width] duration-500"
                style={{ width: `${max > 0 ? Math.max(2, (item.value / max) * 100) : 0}%` }}
              />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
