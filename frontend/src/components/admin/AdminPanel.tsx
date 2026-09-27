import type { ReactNode } from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import Link from '@/components/common/Link';
import { Heading } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

interface AdminPanelProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly action?: ReactNode;
  readonly href?: string;
  readonly hrefLabel?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly bodyClassName?: string;
}

export function AdminPanel({
  title,
  description,
  action,
  href,
  hrefLabel = 'View all',
  children,
  className,
  bodyClassName,
}: AdminPanelProps) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col rounded-2xl border bg-card text-card-foreground shadow-xs',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 border-b px-5 py-4">
        <div className="min-w-0">
          <Heading as="h2" size="xs">
            {title}
          </Heading>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
        {href && (
          <Link
            href={href}
            className="group inline-flex items-center gap-1 rounded-md text-sm font-medium text-accent-rose outline-none hover:text-accent-rose-dark focus-visible:ring-2 focus-visible:ring-accent-rose/40"
          >
            {hrefLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </header>
      <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
    </section>
  );
}

interface PanelEmptyProps {
  readonly icon: LucideIcon;
  readonly children: ReactNode;
}

export function PanelEmpty({ icon: Icon, children }: PanelEmptyProps) {
  return (
    <div className="flex h-full min-h-40 flex-col items-center justify-center gap-3 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="max-w-60 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
