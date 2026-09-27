import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly optional?: boolean;
  readonly hint?: ReactNode;
  readonly error?: string;
  readonly aside?: ReactNode;
  readonly className?: string;
  readonly children: ReactNode;
}

export function FormField({
  id,
  label,
  required,
  optional,
  hint,
  error,
  aside,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && (
            <span className="ml-0.5 text-accent-rose" aria-hidden="true">
              *
            </span>
          )}
          {optional && <span className="ml-1.5 font-normal text-muted-foreground">(optional)</span>}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
