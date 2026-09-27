import type { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  readonly id?: string;
  readonly title: string;
  readonly description?: ReactNode;
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function FormSection({
  id,
  title,
  description,
  children,
  footer,
  className,
}: FormSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      tabIndex={id ? -1 : undefined}
      className={cn('scroll-mt-28 rounded-2xl border bg-card outline-none', className)}
    >
      <header className="border-b px-5 py-4 sm:px-6">
        <h2 id={id ? `${id}-title` : undefined} className="text-base font-semibold">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </header>
      <div className="space-y-5 px-5 py-5 sm:px-6">{children}</div>
      {footer && (
        <footer className="flex items-center justify-end gap-3 border-t bg-muted/30 px-5 py-3 sm:px-6">
          {footer}
        </footer>
      )}
    </section>
  );
}

export function FormSectionSkeleton({
  fields = 4,
  className,
}: {
  readonly fields?: number;
  readonly className?: string;
}) {
  return (
    <div className={cn('rounded-2xl border bg-card', className)} aria-hidden="true">
      <div className="space-y-2 border-b px-5 py-4 sm:px-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6">
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
