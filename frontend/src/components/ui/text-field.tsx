import type { ComponentProps, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { fieldDescribedBy } from '@/lib/forms';
import { cn } from '@/lib/utils';

export interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id'> {
  readonly id: string;
  readonly label: string;
  readonly icon?: LucideIcon;
  readonly hint?: ReactNode;
  readonly error?: string;
  readonly optional?: boolean;
  readonly aside?: ReactNode;
  readonly trailing?: ReactNode;
  readonly inputClassName?: string;
}

export function TextField({
  id,
  label,
  icon: Icon,
  hint,
  error,
  optional,
  aside,
  trailing,
  className,
  inputClassName,
  ...inputProps
}: TextFieldProps) {
  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      aside={aside}
      className={className}
    >
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          />
        )}
        <Input
          id={id}
          aria-invalid={!!error}
          aria-describedby={fieldDescribedBy(id, !!hint, !!error)}
          className={cn(
            'h-11 focus-visible:border-accent-rose/50 focus-visible:ring-accent-rose/20',
            Icon && 'pl-10',
            trailing && 'pr-11',
            inputClassName,
          )}
          {...inputProps}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
    </FormField>
  );
}
