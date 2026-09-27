import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { formatRwf } from '@/lib/pricing';

export interface SummaryLine {
  id: string;
  label: ReactNode;
  value: ReactNode;
  tone?: 'default' | 'positive';
}

interface OrderSummaryProps {
  readonly title?: string;
  readonly lines: SummaryLine[];
  readonly total: number;
  readonly children?: ReactNode;
  readonly footer?: ReactNode;
  readonly className?: string;
}

export function OrderSummary({
  title = 'Order summary',
  lines,
  total,
  children,
  footer,
  className,
}: OrderSummaryProps) {
  return (
    <section
      aria-label={title}
      className={cn('rounded-2xl border bg-card p-5 shadow-xs sm:p-6', className)}
    >
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>

      {children && <div className="mt-5">{children}</div>}

      <dl className="mt-5 space-y-3 border-t pt-5 text-sm">
        {lines.map((line) => (
          <div key={line.id} className="flex items-center justify-between gap-4">
            <dt
              className={
                line.tone === 'positive'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-muted-foreground'
              }
            >
              {line.label}
            </dt>
            <dd
              className={cn(
                'font-medium tabular-nums',
                line.tone === 'positive' && 'text-emerald-700 dark:text-emerald-400',
              )}
            >
              {line.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 flex items-baseline justify-between gap-4 border-t pt-5">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-semibold tabular-nums">{formatRwf(total)}</span>
      </div>

      {footer && <div className="mt-6">{footer}</div>}
    </section>
  );
}
