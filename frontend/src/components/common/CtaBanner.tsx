import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/typography';

interface CtaBannerProps {
  readonly title: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly media?: ReactNode;
  readonly className?: string;
}

export function CtaBanner({
  title,
  eyebrow,
  description,
  actions,
  media,
  className,
}: CtaBannerProps) {
  const withMedia = Boolean(media);

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-3xl border border-accent-rose/10 bg-linear-to-br from-accent-rose-subtle via-background to-accent-rose-muted/30',
        withMedia
          ? 'grid items-center gap-6 px-6 pt-10 sm:px-10 md:grid-cols-2 md:gap-10 md:py-0 md:pl-12'
          : 'px-6 py-12 text-center sm:px-12 sm:py-16',
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
      <div className={cn('relative', withMedia ? 'md:py-12' : 'mx-auto max-w-2xl')}>
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-rose">
            {eyebrow}
          </p>
        )}
        <Heading as="h2" size="lg">
          {title}
        </Heading>
        {description && (
          <div
            className={cn(
              'mt-3 max-w-xl text-base leading-relaxed text-muted-foreground',
              !withMedia && 'mx-auto',
            )}
          >
            {description}
          </div>
        )}
        {actions && (
          <div className={cn('mt-8 flex flex-wrap gap-3', !withMedia && 'justify-center')}>
            {actions}
          </div>
        )}
      </div>
      {media && <div className="relative self-end">{media}</div>}
    </section>
  );
}
