import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputGroupProps extends Omit<ComponentProps<'input'>, 'prefix'> {
  readonly prefix?: ReactNode;
  readonly suffix?: ReactNode;
}

export function InputGroup({ prefix, suffix, className, ...props }: Readonly<InputGroupProps>) {
  return (
    <div
      className={cn(
        'flex h-11 w-full items-stretch overflow-hidden rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] focus-within:border-accent-rose/50 focus-within:ring-[3px] focus-within:ring-accent-rose/20 has-[input[aria-invalid=true]]:border-red-500/60',
        className,
      )}
    >
      {prefix && (
        <span className="flex items-center border-r bg-muted/50 px-3 text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <input
        className="min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums outline-none placeholder:text-muted-foreground disabled:opacity-50"
        {...props}
      />
      {suffix && (
        <span className="flex items-center border-l bg-muted/50 px-3 text-sm text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  );
}
