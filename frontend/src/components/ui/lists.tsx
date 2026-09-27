import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListProps {
  readonly items: ReactNode[];
  readonly className?: string;
}

export function CheckList({ items, className }: ListProps) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-[15px] leading-6 text-muted-foreground">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-rose/10 text-accent-rose">
            <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function StepList({ items, className }: ListProps) {
  return (
    <ol className={cn('space-y-5', className)}>
      {items.map((item, i) => (
        <li key={i} className="relative flex gap-4">
          {i < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-8 bottom-[-1.25rem] left-3.5 w-px bg-border"
            />
          )}
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-rose text-xs font-semibold text-white tabular-nums">
            {i + 1}
          </span>
          <span className="pt-0.5 text-[15px] leading-6 text-muted-foreground">{item}</span>
        </li>
      ))}
    </ol>
  );
}
