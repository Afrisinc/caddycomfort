import type { ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface RadioCardOption<T extends string> {
  value: T;
  title: string;
  description?: ReactNode;
  icon?: LucideIcon;
  content?: ReactNode;
}

interface RadioCardGroupProps<T extends string> {
  readonly label: string;
  readonly value: T;
  readonly onValueChange: (value: T) => void;
  readonly options: RadioCardOption<T>[];
  readonly className?: string;
}

export function RadioCardGroup<T extends string>({
  label,
  value,
  onValueChange,
  options,
  className,
}: RadioCardGroupProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={(next) => onValueChange(next as T)}
      aria-label={label}
      className={cn('space-y-3', className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const Icon = option.icon;
        return (
          <div
            key={option.value}
            className={cn(
              'rounded-xl border bg-card transition-colors',
              selected
                ? 'border-accent-rose ring-1 ring-accent-rose'
                : 'hover:border-foreground/30',
            )}
          >
            <RadioGroupPrimitive.Item
              value={option.value}
              className="flex w-full items-start gap-4 rounded-xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40"
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                  selected ? 'border-accent-rose' : 'border-muted-foreground/40',
                )}
              >
                <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-accent-rose" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{option.title}</span>
                {option.description && (
                  <span className="mt-0.5 block text-sm text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </span>
              {Icon && (
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'h-5 w-5 shrink-0',
                    selected ? 'text-accent-rose' : 'text-muted-foreground',
                  )}
                />
              )}
            </RadioGroupPrimitive.Item>
            {selected && option.content && (
              <div className="animate-in fade-in-0 border-t px-4 pt-4 pb-4 sm:pl-13">
                {option.content}
              </div>
            )}
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}
