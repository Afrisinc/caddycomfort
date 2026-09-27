import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewBlockProps {
  readonly title: string;
  readonly icon?: LucideIcon;
  readonly onEdit?: () => void;
  readonly children: ReactNode;
  readonly className?: string;
}

export function ReviewBlock({ title, icon: Icon, onEdit, children, className }: ReviewBlockProps) {
  return (
    <section className={cn('rounded-2xl border bg-card p-5 sm:p-6', className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          {Icon && <Icon className="h-4 w-4 text-accent-rose" aria-hidden="true" />}
          {title}
        </h3>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${title.toLowerCase()}`}
            className="rounded text-sm font-medium text-accent-rose underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40"
          >
            Edit
          </button>
        )}
      </div>
      <div className="text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
