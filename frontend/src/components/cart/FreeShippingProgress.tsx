import { Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRwf } from '@/lib/pricing';

interface FreeShippingProgressProps {
  readonly subtotal: number;
  readonly threshold: number;
  readonly unlocked: boolean;
  readonly className?: string;
}

export function FreeShippingProgress({
  subtotal,
  threshold,
  unlocked,
  className,
}: FreeShippingProgressProps) {
  const percent = unlocked ? 100 : Math.min(99, Math.round((subtotal / threshold) * 100));
  const remaining = Math.max(1, threshold - subtotal);

  return (
    <div className={cn('rounded-xl border bg-muted/30 p-4', className)}>
      <p className="flex items-center gap-2 text-sm">
        <Truck
          className={cn('h-4 w-4 shrink-0', unlocked ? 'text-emerald-600' : 'text-accent-rose')}
        />
        {unlocked ? (
          <span className="font-medium text-emerald-700 dark:text-emerald-400">
            You&apos;ve unlocked free shipping
          </span>
        ) : (
          <span>
            Add <span className="font-semibold tabular-nums">{formatRwf(remaining)}</span> more for
            free shipping
          </span>
        )}
      </p>
      <div
        role="progressbar"
        aria-label="Progress to free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500 ease-out',
            unlocked ? 'bg-emerald-500' : 'bg-accent-rose',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
