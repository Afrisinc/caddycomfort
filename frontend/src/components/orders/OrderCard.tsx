import { ArrowRight, Banknote, CreditCard } from 'lucide-react';
import Link from '@/components/common/Link';
import { Button } from '@/components/ui/button';
import { OrderProgress } from '@/components/orders/OrderProgress';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/StatusBadge';
import { formatRwf } from '@/lib/pricing';
import { needsOnlinePayment, onlineAmountDue } from '@/lib/checkout';
import { PAYMENT_METHOD_NAMES } from '@/lib/orderStatus';
import type { Order } from '@/types/api';

interface OrderCardProps {
  readonly order: Order;
}

function itemSummary(order: Order): string {
  const names = order.items.map((item) => item.productName);
  if (names.length <= 2) return names.join(', ');
  return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
}

export function OrderCard({ order }: OrderCardProps) {
  const href = `/account/orders/${order.id}`;
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const payNow = needsOnlinePayment(order);
  const cashDue =
    order.paymentMethod === 'CASH_ON_DELIVERY' &&
    order.paymentStatus === 'PARTIALLY_PAID' &&
    order.status !== 'DELIVERED'
      ? (order.balanceDue ?? 0)
      : 0;

  return (
    <article className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={href}
              className="font-semibold tracking-tight outline-none hover:text-accent-rose focus-visible:underline"
            >
              {order.orderNumber}
            </Link>
            <OrderStatusBadge status={order.status} />
            {order.paymentStatus !== 'PAID' && <PaymentStatusBadge status={order.paymentStatus} />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })} ·{' '}
            {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
            {PAYMENT_METHOD_NAMES[order.paymentMethod]}
          </p>
          <p className="mt-1 truncate text-sm">{itemSummary(order)}</p>
        </div>
        <p className="text-lg font-semibold tabular-nums">{formatRwf(order.total)}</p>
      </div>

      <OrderProgress status={order.status} className="mt-5" />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        {payNow && (
          <p className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
            <CreditCard className="h-4 w-4" />
            {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Deposit' : 'Payment'} of{' '}
            {formatRwf(onlineAmountDue(order))} needed to confirm this order
          </p>
        )}
        {cashDue > 0 && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Banknote className="h-4 w-4" />
            Pay <span className="font-medium text-foreground">{formatRwf(cashDue)}</span> in cash on
            delivery
          </p>
        )}
        <div className="ml-auto flex gap-2">
          {payNow && (
            <Button asChild size="sm" className="bg-accent-rose hover:bg-accent-rose-dark">
              <Link href={href}>Pay now</Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href={href} aria-label={`View order ${order.orderNumber}`}>
              View order
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
