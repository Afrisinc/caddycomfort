import type { ReactNode } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Smartphone,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Heading, Text } from '@/components/ui/typography';
import { formatRwf } from '@/lib/pricing';
import type { PaymentPhase } from '@/hooks/usePayment';
import { cn } from '@/lib/utils';

interface PaymentStatusPanelProps {
  readonly phase: PaymentPhase;
  readonly orderNumber?: string;
  readonly amount?: number;
  readonly balanceDue?: number;
  readonly phoneNumber?: string;
  readonly error?: string | null;
  readonly actions?: ReactNode;
}

interface PhaseView {
  icon: LucideIcon;
  tone: 'rose' | 'green' | 'red' | 'amber';
  title: string;
  spin?: boolean;
}

const VIEWS: Partial<Record<PaymentPhase, PhaseView>> = {
  starting: { icon: Loader2, tone: 'rose', title: 'Starting your payment…', spin: true },
  redirecting: { icon: CreditCard, tone: 'rose', title: 'Taking you to secure card payment…' },
  'awaiting-approval': {
    icon: Smartphone,
    tone: 'rose',
    title: 'Approve the payment on your phone',
  },
  paid: { icon: CheckCircle2, tone: 'green', title: 'Payment received — thank you!' },
  failed: { icon: XCircle, tone: 'red', title: 'Payment not completed' },
  'timed-out': { icon: Clock, tone: 'amber', title: 'Still waiting for your approval' },
};

const TONES = {
  rose: 'bg-accent-rose/10 text-accent-rose',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

function describe(
  phase: PaymentPhase,
  phoneNumber?: string,
  error?: string | null,
  balanceDue?: number,
) {
  switch (phase) {
    case 'awaiting-approval':
      return `We sent a payment request to ${phoneNumber ?? 'your phone'}. Enter your Mobile Money PIN to confirm. This page updates automatically.`;
    case 'redirecting':
      return 'You will enter your card details on our payment partner’s secure page.';
    case 'paid':
      return balanceDue
        ? `Your order is confirmed. Please pay the remaining ${formatRwf(balanceDue)} in cash when it arrives — nothing is owed after delivery.`
        : 'Your order is confirmed. We will email you when it ships.';
    case 'failed':
      return `${error ?? 'The payment did not go through.'} Your order is saved — you can try again now or later from your orders.`;
    case 'timed-out':
      return 'We have not received a confirmation yet. If you approved it, your order will update shortly. You can also retry the payment.';
    default:
      return 'Please keep this page open.';
  }
}

export function PaymentStatusPanel({
  phase,
  orderNumber,
  amount,
  balanceDue,
  phoneNumber,
  error,
  actions,
}: PaymentStatusPanelProps) {
  const baseView = VIEWS[phase];
  if (!baseView) return null;
  const view =
    phase === 'paid' && balanceDue
      ? { ...baseView, title: 'Deposit received — thank you!' }
      : baseView;
  const Icon = view.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border bg-card px-6 py-12 text-center"
    >
      <span
        className={cn(
          'mb-5 flex h-16 w-16 items-center justify-center rounded-full',
          TONES[view.tone],
        )}
      >
        <Icon
          className={cn(
            'h-8 w-8',
            view.spin && 'animate-spin',
            phase === 'awaiting-approval' && 'animate-pulse',
          )}
        />
      </span>
      <Heading as="h1" size="md">
        {view.title}
      </Heading>
      <Text className="mt-2">{describe(phase, phoneNumber, error, balanceDue)}</Text>

      {(orderNumber || amount !== undefined) && (
        <dl className="mt-6 grid w-full max-w-xs grid-cols-2 gap-3 rounded-xl bg-muted/50 p-4 text-left text-sm">
          {orderNumber && (
            <div>
              <dt className="text-xs text-muted-foreground">Order</dt>
              <dd className="font-medium">{orderNumber}</dd>
            </div>
          )}
          {amount !== undefined && (
            <div>
              <dt className="text-xs text-muted-foreground">{balanceDue ? 'Deposit' : 'Amount'}</dt>
              <dd className="font-medium tabular-nums">{formatRwf(amount)}</dd>
            </div>
          )}
        </dl>
      )}

      {phase === 'awaiting-approval' && (
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Waiting for confirmation…
        </p>
      )}

      {actions && <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}
