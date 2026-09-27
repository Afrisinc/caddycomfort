import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Heading } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  readonly title: ReactNode;
  readonly icon?: LucideIcon;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
}

export function InfoCard({ title, icon: Icon, action, children, className }: InfoCardProps) {
  return (
    <section className={cn('rounded-2xl border bg-card p-5 sm:p-6', className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <Heading as="h2" size="xs" className="flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-accent-rose" aria-hidden="true" />}
          {title}
        </Heading>
        {action}
      </header>
      {children}
    </section>
  );
}

interface InfoCardSkeletonProps {
  readonly lines?: number;
  readonly className?: string;
}

const LINE_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/3', 'w-2/5'];

export function InfoCardSkeleton({ lines = 3, className }: InfoCardSkeletonProps) {
  return (
    <div className={cn('rounded-2xl border bg-card p-5 sm:p-6', className)} aria-hidden="true">
      <Skeleton className="mb-5 h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className={cn('h-4', LINE_WIDTHS[i % LINE_WIDTHS.length])} />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
