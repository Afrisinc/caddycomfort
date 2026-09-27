import type { LucideIcon } from 'lucide-react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly shortLabel?: string;
  readonly icon?: LucideIcon;
}

interface SegmentedControlProps<T extends string> {
  readonly value: T;
  readonly onValueChange: (value: T) => void;
  readonly options: readonly SegmentedOption<T>[];
  readonly label: string;
  readonly size?: 'sm' | 'default';
  readonly fullWidth?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
}

const sizes = {
  sm: { root: 'h-8', item: 'h-7 px-2.5 text-xs' },
  default: { root: 'h-9', item: 'h-8 px-3 text-sm' },
};

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  label,
  size = 'default',
  fullWidth,
  disabled,
  className,
}: SegmentedControlProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={label}
      orientation="horizontal"
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-lg border bg-muted/70 p-0.5',
        sizes[size].root,
        fullWidth && 'flex w-full',
        className,
      )}
    >
      {options.map(({ value: optionValue, label: optionLabel, shortLabel, icon: Icon }) => (
        <RadioGroupPrimitive.Item
          key={optionValue}
          value={optionValue}
          aria-label={shortLabel ? optionLabel : undefined}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium text-muted-foreground outline-none transition-all duration-150',
            'hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent-rose/40 disabled:pointer-events-none disabled:opacity-50',
            'data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-sm dark:data-[state=checked]:bg-card',
            sizes[size].item,
            fullWidth && 'flex-1',
          )}
        >
          {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
          {shortLabel ? (
            <>
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{optionLabel}</span>
            </>
          ) : (
            optionLabel
          )}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
