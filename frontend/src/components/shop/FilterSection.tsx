import { useState, type ReactNode } from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSectionProps {
  readonly title: string;
  readonly count?: number;
  readonly onClear?: () => void;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function FilterSection({
  title,
  count = 0,
  onClear,
  defaultOpen = true,
  children,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <CollapsiblePrimitive.Root
      open={open}
      onOpenChange={setOpen}
      className="border-b py-5 first:pt-0 last:border-0"
    >
      <div className="flex items-center justify-between gap-3">
        <CollapsiblePrimitive.Trigger className="group flex flex-1 items-center gap-2 rounded text-left text-sm font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent-rose/40">
          {title}
          {count > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-rose/10 px-1.5 text-[11px] font-semibold text-accent-rose tabular-nums">
              {count}
            </span>
          )}
          <ChevronDown
            className={cn(
              'ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200',
              open && 'rotate-180',
            )}
          />
        </CollapsiblePrimitive.Trigger>
        {onClear && count > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="rounded text-xs font-medium text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-accent-rose/40"
          >
            Clear
          </button>
        )}
      </div>
      <CollapsiblePrimitive.Content className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
        <div className="pt-4">{children}</div>
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  );
}
