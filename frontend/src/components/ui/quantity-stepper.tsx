import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  readonly value: number;
  readonly onChange: (value: number) => void;
  readonly min?: number;
  readonly max?: number;
  readonly disabled?: boolean;
  readonly size?: 'sm' | 'md';
  readonly label?: string;
  readonly className?: string;
}

const buttonClass =
  'flex items-center justify-center text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground disabled:pointer-events-none disabled:opacity-40';

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = Number.POSITIVE_INFINITY,
  disabled,
  size = 'md',
  label = 'Quantity',
  className,
}: QuantityStepperProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const dimension = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';

  return (
    <fieldset
      aria-label={label}
      className={cn(
        'm-0 inline-flex min-w-0 items-center overflow-hidden rounded-lg border p-0 bg-background focus-within:ring-2 focus-within:ring-accent-rose/30',
        disabled && 'opacity-50',
        className,
      )}
    >
      <button
        type="button"
        className={cn(buttonClass, dimension)}
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={Number.isFinite(max) ? max : undefined}
        disabled={disabled}
        onChange={(e) => {
          const next = Number.parseInt(e.target.value, 10);
          if (!Number.isNaN(next)) onChange(clamp(next));
        }}
        className={cn(
          'w-12 border-x bg-transparent text-center text-sm font-semibold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
          size === 'sm' ? 'h-9' : 'h-11',
        )}
      />
      <button
        type="button"
        className={cn(buttonClass, dimension)}
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </fieldset>
  );
}
