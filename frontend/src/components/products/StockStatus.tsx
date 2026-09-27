import { cn } from '@/lib/utils';
import { LOW_STOCK_THRESHOLD } from '@/lib/pricing';

interface StockStatusProps {
  readonly quantity: number;
  readonly className?: string;
}

export function StockStatus({ quantity, className }: StockStatusProps) {
  let state: 'in' | 'low' | 'out' = 'in';
  if (quantity <= 0) state = 'out';
  else if (quantity <= LOW_STOCK_THRESHOLD) state = 'low';

  const styles = {
    in: {
      dot: 'bg-emerald-500',
      text: 'text-emerald-700 dark:text-emerald-400',
      label: 'In stock',
    },
    low: {
      dot: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
      label: `Only ${quantity} left`,
    },
    out: { dot: 'bg-red-500', text: 'text-red-700 dark:text-red-400', label: 'Out of stock' },
  }[state];

  return (
    <p className={cn('inline-flex items-center gap-2 text-sm font-medium', styles.text, className)}>
      <span className="relative flex h-2 w-2">
        {state === 'low' && (
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
              styles.dot,
            )}
          />
        )}
        <span className={cn('relative inline-flex h-2 w-2 rounded-full', styles.dot)} />
      </span>
      {styles.label}
    </p>
  );
}
