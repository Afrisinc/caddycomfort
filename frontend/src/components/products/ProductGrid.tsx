import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const columnClasses = {
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
} as const;

interface ProductGridProps {
  readonly columns?: keyof typeof columnClasses;
  readonly children: ReactNode;
  readonly className?: string;
}

export function ProductGrid({ columns = 3, children, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        'grid gap-x-4 gap-y-10 sm:gap-x-6 lg:gap-y-12',
        columnClasses[columns],
        className,
      )}
    >
      {children}
    </div>
  );
}
