import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContactMethodProps {
  readonly icon: LucideIcon;
  readonly label: string;
  readonly value: ReactNode;
  readonly description?: ReactNode;
  readonly href?: string;
  readonly external?: boolean;
  readonly className?: string;
}

export function ContactMethod({
  icon: Icon,
  label,
  value,
  description,
  href,
  external,
  className,
}: ContactMethodProps) {
  const body = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-rose/10 text-accent-rose transition-colors group-hover:bg-accent-rose group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className="mt-0.5 block font-medium break-words text-foreground">{value}</span>
        {description && (
          <span className="mt-0.5 block text-sm text-muted-foreground">{description}</span>
        )}
      </span>
      {href && (
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent-rose"
        />
      )}
    </>
  );

  const base = 'flex items-center gap-4 rounded-2xl border bg-card p-4 sm:p-5';

  if (!href) return <div className={cn(base, className)}>{body}</div>;

  return (
    <a
      href={href}
      {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
      className={cn(
        base,
        'group transition-all outline-none hover:-translate-y-0.5 hover:border-accent-rose/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent-rose/40',
        className,
      )}
    >
      {body}
    </a>
  );
}
