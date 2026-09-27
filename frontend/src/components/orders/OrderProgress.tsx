import { Check, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types/api';

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Placed' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'SHIPPED', label: 'Shipped' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const STEP_INDEX: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  PROCESSING: 1,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

interface OrderProgressProps {
  readonly status: OrderStatus;
  readonly className?: string;
}

export function OrderProgress({ status, className }: OrderProgressProps) {
  const current = STEP_INDEX[status];

  if (current === undefined) {
    return (
      <p className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <XCircle className="h-4 w-4" />
        {status === 'REFUNDED' ? 'This order was refunded.' : 'This order was cancelled.'}
      </p>
    );
  }

  return (
    <ol className={cn('grid grid-cols-4 gap-2', className)} aria-label="Order progress">
      {STEPS.map((step, index) => {
        const done = index <= current;
        return (
          <li
            key={step.status}
            aria-current={index === current ? 'step' : undefined}
            className="min-w-0"
          >
            <span
              className={cn(
                'block h-1.5 rounded-full transition-colors',
                done ? 'bg-accent-rose' : 'bg-muted',
              )}
            />
            <span
              className={cn(
                'mt-2 flex items-center gap-1 truncate text-xs',
                done ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {index < current && (
                <Check className="h-3 w-3 shrink-0 text-accent-rose" strokeWidth={3} />
              )}
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
