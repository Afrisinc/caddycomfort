import type { ReactNode } from 'react';
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
      className={cn('scroll-mt-28 rounded-2xl border bg-card', className)}
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
