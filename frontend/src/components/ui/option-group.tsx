import type { ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLightSwatch, swatchColor } from '@/lib/swatches';

interface OptionGroupProps {
  readonly label: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly options: string[];
  readonly aside?: ReactNode;
  readonly className?: string;
}

function OptionGroupLabel({
  label,
  value,
  aside,
}: Readonly<{ label: string; value: string; aside?: ReactNode }>) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3 text-sm">
      <p className="font-medium text-foreground">
        {label}
        {value && <span className="ml-1.5 font-normal text-muted-foreground">{value}</span>}
      </p>
      {aside}
    </div>
  );
}

export function ChipGroup({
  label,
  value,
  onValueChange,
  options,
  aside,
  className,
}: OptionGroupProps) {
  return (
    <div className={className}>
      <OptionGroupLabel label={label} value={value} aside={aside} />
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option}
            value={option}
            className="h-10 min-w-12 rounded-lg border bg-background px-4 text-sm font-medium transition-all outline-none hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-accent-rose/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through"
          >
            {option}
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}

export function SwatchGroup({
  label,
  value,
  onValueChange,
  options,
  aside,
  className,
}: OptionGroupProps) {
  return (
    <div className={className}>
      <OptionGroupLabel label={label} value={value} aside={aside} />
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        aria-label={label}
        className="flex flex-wrap gap-3"
      >
        {options.map((option) => {
          const color = swatchColor(option);
          const isLight = isLightSwatch(option);
          return (
            <RadioGroupPrimitive.Item
              key={option}
              value={option}
              aria-label={option}
              title={option}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-background transition-all hover:ring-2 hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-accent-rose/50 data-[state=checked]:ring-2 data-[state=checked]:ring-foreground"
            >
              {color ? (
                <span
                  className={cn(
                    'h-full w-full rounded-full shadow-inner',
                    isLight && 'border border-border',
                  )}
                  style={{ backgroundColor: color }}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center rounded-full border bg-muted text-[10px] font-semibold uppercase text-muted-foreground">
                  {option.slice(0, 2)}
                </span>
              )}
              <RadioGroupPrimitive.Indicator className="absolute inset-0 flex items-center justify-center">
                <Check
                  className={cn(
                    'h-4 w-4 drop-shadow',
                    color && !isLight ? 'text-white' : 'text-foreground',
                  )}
                  strokeWidth={3}
                />
              </RadioGroupPrimitive.Indicator>
            </RadioGroupPrimitive.Item>
          );
        })}
      </RadioGroupPrimitive.Root>
    </div>
  );
}
