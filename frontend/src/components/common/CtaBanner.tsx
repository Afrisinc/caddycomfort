import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/typography';

interface CtaBannerProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
}

export function CtaBanner({ title, description, actions, className }: CtaBannerProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border border-accent-rose/10 bg-linear-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30 px-6 py-12 text-center sm:px-12 sm:py-16',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-accent-rose/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-accent-rose/10 blur-3xl"
      />
      <div className="relative mx-auto max-w-2xl">
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
      </div>
    </section>
  );
}
