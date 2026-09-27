import type { ReactNode } from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isLightSwatch, swatchColor } from '@/lib/swatches';

const chipClass =
  'h-10 min-w-12 rounded-lg border bg-background px-4 text-sm font-medium transition-all outline-none hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-accent-rose/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=checked]:border-foreground data-[state=checked]:bg-foreground data-[state=checked]:text-background aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through';

const swatchClass =
  'relative flex h-10 w-10 items-center justify-center rounded-full outline-none ring-offset-2 ring-offset-background transition-all hover:ring-2 hover:ring-foreground/20 focus-visible:ring-2 focus-visible:ring-accent-rose/50 data-[state=checked]:ring-2 data-[state=checked]:ring-foreground aria-pressed:ring-2 aria-pressed:ring-foreground';

function SwatchFill({ option, selected }: Readonly<{ option: string; selected: boolean }>) {
  const color = swatchColor(option);
  const isLight = isLightSwatch(option);
  return (
    <>
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
      {selected && (
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className={cn(
            'absolute h-4 w-4 drop-shadow',
            color && !isLight ? 'text-white' : 'text-foreground',
          )}
        />
      )}
    </>
  );
}

function GroupLabel({
  label,
  value,
  aside,
}: Readonly<{ label: string; value?: string; aside?: ReactNode }>) {
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

interface SingleSelectProps {
  readonly label: string;
  readonly value: string;
  readonly onValueChange: (value: string) => void;
  readonly options: string[];
  readonly aside?: ReactNode;
  readonly className?: string;
}

export function ChipGroup({
  label,
  value,
  onValueChange,
  options,
  aside,
  className,
}: SingleSelectProps) {
  return (
    <div className={className}>
      <GroupLabel label={label} value={value} aside={aside} />
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        aria-label={label}
        className="flex flex-wrap gap-2"
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item key={option} value={option} className={chipClass}>
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
}: SingleSelectProps) {
  return (
    <div className={className}>
      <GroupLabel label={label} value={value} aside={aside} />
      <RadioGroupPrimitive.Root
        value={value}
        onValueChange={onValueChange}
        aria-label={label}
        className="flex flex-wrap gap-3"
      >
        {options.map((option) => (
          <RadioGroupPrimitive.Item
            key={option}
            value={option}
            aria-label={option}
            title={option}
            className={swatchClass}
          >
            <SwatchFill option={option} selected={value === option} />
          </RadioGroupPrimitive.Item>
        ))}
      </RadioGroupPrimitive.Root>
    </div>
  );
}

interface MultiSelectProps {
  readonly label: string;
  readonly values: string[];
  readonly onToggle: (value: string) => void;
  readonly options: string[];
  readonly className?: string;
}

export function ChipToggleGroup({ label, values, onToggle, options, className }: MultiSelectProps) {
  return (
    <fieldset className={cn('m-0 flex min-w-0 flex-wrap gap-2 border-0 p-0', className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={values.includes(option)}
          onClick={() => onToggle(option)}
          className={cn(chipClass, 'h-9 min-w-11 px-3')}
        >
          {option}
        </button>
      ))}
    </fieldset>
  );
}

export function SwatchToggleGroup({
  label,
  values,
  onToggle,
  options,
  className,
}: MultiSelectProps) {
  return (
    <fieldset className={cn('m-0 flex min-w-0 flex-wrap gap-3 border-0 p-0', className)}>
      <legend className="sr-only">{label}</legend>
      {options.map((option) => {
        const selected = values.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            aria-label={option}
            title={option}
            onClick={() => onToggle(option)}
            className={cn(swatchClass, 'h-9 w-9')}
          >
            <SwatchFill option={option} selected={selected} />
          </button>
        );
      })}
    </fieldset>
  );
}
