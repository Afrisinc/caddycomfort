import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import Link from '@/components/common/Link';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type StatTone = 'rose' | 'green' | 'blue' | 'violet' | 'amber' | 'red' | 'neutral';

const toneStyles: Record<StatTone, string> = {
  rose: 'bg-accent-rose/10 text-accent-rose',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'bg-muted text-muted-foreground',
};

export interface StatCardProps {
  readonly title: string;
  readonly value: ReactNode;
  readonly icon: LucideIcon;
  readonly tone?: StatTone;
  readonly hint?: ReactNode;
  readonly href?: string;
  readonly className?: string;
}

const cardBase =
  'relative flex flex-col rounded-xl border bg-card p-5 text-card-foreground shadow-xs';

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'rose',
  hint,
  href,
  className,
}: StatCardProps) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200',
            href && 'group-hover:scale-105',
            toneStyles[tone],
          )}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {(hint || href) && (
        <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{hint}</span>
          {href && (
            <ArrowUpRight
              aria-hidden="true"
              className="h-4 w-4 shrink-0 opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          )}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(
          cardBase,
          'group outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-rose/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent-rose/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          className,
        )}
      >
        {body}
      </Link>
    );
  }

  return <div className={cn(cardBase, className)}>{body}</div>;
}

export function StatCardSkeleton({ className }: { readonly className?: string }) {
  return (
    <div className={cn(cardBase, className)} aria-hidden="true">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-8 w-28" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

const gridCols = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
} as const;

interface StatGridProps {
  readonly columns?: keyof typeof gridCols;
  readonly loading?: boolean;
  readonly children?: ReactNode;
  readonly className?: string;
}

export function StatGrid({ columns = 4, loading, children, className }: StatGridProps) {
  return (
    <div
      className={cn('mb-8 grid grid-cols-1 gap-4 lg:gap-5', gridCols[columns], className)}
      aria-busy={loading || undefined}
    >
      {loading ? Array.from({ length: columns }, (_, i) => <StatCardSkeleton key={i} />) : children}
    </div>
  );
}
