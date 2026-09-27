import { Banknote, Smartphone } from 'lucide-react';
import { formatRwf } from '@/lib/pricing';
import { cn } from '@/lib/utils';

interface DepositBreakdownProps {
  readonly deposit: number;
  readonly balance: number;
  readonly depositPaid?: boolean;
  readonly className?: string;
}

export function DepositBreakdown({
  deposit,
  balance,
  depositPaid,
  className,
}: DepositBreakdownProps) {
  const rows = [
    {
      id: 'now',
      icon: Smartphone,
      label: depositPaid ? 'Deposit paid' : 'Pay now (50% deposit)',
      value: deposit,
      tone: depositPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground',
    },
    {
      id: 'delivery',
      icon: Banknote,
      label: 'Pay in cash on delivery',
      value: balance,
      tone: 'text-foreground',
    },
  ];

  return (
    <dl className={cn('divide-y rounded-xl border bg-muted/30 text-sm', className)}>
      {rows.map(({ id, icon: Icon, label, value, tone }) => (
        <div key={id} className="flex items-center justify-between gap-3 px-4 py-3">
          <dt className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {label}
          </dt>
          <dd className={cn('font-semibold tabular-nums', tone)}>{formatRwf(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
