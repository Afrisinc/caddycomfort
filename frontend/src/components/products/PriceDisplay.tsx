import { cn } from '@/lib/utils';
import { formatRwf, type ProductPricing } from '@/lib/pricing';

interface PriceDisplayProps {
  readonly pricing: ProductPricing;
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

const currentSize = {
  sm: 'text-base font-semibold',
  md: 'text-xl font-semibold',
  lg: 'text-3xl font-semibold tracking-tight',
};

const originalSize = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-lg',
};

export function PriceDisplay({ pricing, size = 'md', className }: PriceDisplayProps) {
  const { current, original, discountPct } = pricing;
  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-3 gap-y-1', className)}>
      <span className={cn('tabular-nums text-foreground', currentSize[size])}>
        {formatRwf(current)}
      </span>
      {original && (
        <>
          <span
            className={cn('tabular-nums text-muted-foreground line-through', originalSize[size])}
          >
            <span className="sr-only">Was </span>
            {formatRwf(original)}
          </span>
          <span className="rounded-full bg-accent-rose/10 px-2 py-0.5 text-xs font-semibold text-accent-rose">
            Save {discountPct}%
          </span>
        </>
      )}
    </div>
  );
}
