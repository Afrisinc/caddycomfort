import { useEffect, useState } from 'react';
import { Banknote, Loader2, Mail, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FormField } from '@/components/ui/form-field';
import { ReviewBlock } from '@/components/common/ReviewBlock';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/StatusBadge';
import { DepositBreakdown } from '@/components/checkout/DepositBreakdown';
import { adminOrdersApi } from '@/lib/api';
import { formatRwf } from '@/lib/pricing';
import { formatVariant } from '@/lib/checkout';
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_NAMES,
  PAYMENT_STATUS_STYLES,
} from '@/lib/orderStatus';
import type { Order, OrderStatus, PaymentStatus } from '@/types/api';

interface OrderDetailSheetProps {
  readonly order: Order | null;
  readonly onOpenChange: (open: boolean) => void;
  readonly onUpdated: (order: Order) => void;
}

interface ShippingAddress {
  street?: string;
  city?: string;
  state?: string;
  phone?: string;
}

export function OrderDetailSheet({ order, onOpenChange, onUpdated }: OrderDetailSheetProps) {
  const [status, setStatus] = useState<OrderStatus>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PENDING');
  const [saving, setSaving] = useState<'status' | 'payment' | null>(null);

  useEffect(() => {
    if (!order) return;
    setStatus(order.status);
    setPaymentStatus(order.paymentStatus);
  }, [order]);

  if (!order) return <Sheet open={false} onOpenChange={onOpenChange} />;

  const address = (order.shippingAddress ?? {}) as ShippingAddress;
  const isCod = order.paymentMethod === 'CASH_ON_DELIVERY';
  const deposit = order.depositAmount ?? 0;
  const locked = order.status === 'DELIVERED' || order.status === 'CANCELLED';
  const cashToCollect = isCod && !locked ? (order.balanceDue ?? 0) : 0;

  let statusHint: string | undefined;
  if (locked) statusHint = 'Delivered and cancelled orders can no longer change status.';
  else if (isCod && status === 'DELIVERED') {
    statusHint = 'Marking as delivered records the cash as collected and the order as fully paid.';
  }

  const save = async (kind: 'status' | 'payment') => {
    setSaving(kind);
    try {
      const updated =
        kind === 'status'
          ? await adminOrdersApi.updateStatus(order.id, status)
          : await adminOrdersApi.updatePaymentStatus(order.id, paymentStatus);
      onUpdated({ ...order, ...updated, customer: order.customer });
      toast.success(kind === 'status' ? 'Order status updated' : 'Payment status updated');
    } catch (error: any) {
      toast.error(error.message || 'Update failed');
    } finally {
      setSaving(null);
    }
  };

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="flex flex-wrap items-center gap-2">
            {order.orderNumber}
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </SheetTitle>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {cashToCollect > 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <Banknote className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-sm">
                Collect{' '}
                <span className="font-semibold tabular-nums">{formatRwf(cashToCollect)}</span> in
                cash on delivery.
                {order.paymentStatus !== 'PARTIALLY_PAID' && ' The deposit has not been paid yet.'}
              </p>
            </div>
          )}

          <ReviewBlock title="Customer">
            <p className="font-medium text-foreground">{order.customer?.name || 'Customer'}</p>
            {order.customer?.email && (
              <a
                href={`mailto:${order.customer.email}`}
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5" />
                {order.customer.email}
              </a>
            )}
            {address.phone && (
              <a
                href={`tel:${address.phone}`}
                className="flex items-center gap-1.5 hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" />
                {address.phone}
              </a>
            )}
          </ReviewBlock>

          <ReviewBlock title="Delivery address" icon={MapPin}>
            <p>{address.street}</p>
            <p>{[address.city, address.state].filter(Boolean).join(', ')}</p>
          </ReviewBlock>

          <ReviewBlock title={`Items (${order.items.length})`}>
            <ul className="divide-y">
              {order.items.map((item) => {
                const variant = formatVariant({
                  size: item.size ?? undefined,
                  color: item.color ?? undefined,
                });
                return (
                  <li
                    key={item.id}
                    className="flex justify-between gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-foreground">
                        {item.quantity} × {item.productName}
                      </span>
                      {variant && <span className="block text-xs">{variant}</span>}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatRwf(item.price * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </ReviewBlock>

          <ReviewBlock title="Payment">
            <dl className="space-y-1.5">
              <div className="flex justify-between">
                <dt>Method</dt>
                <dd className="text-foreground">
                  {PAYMENT_METHOD_NAMES[order.paymentMethod]}
                  {isCod &&
                    order.depositMethod &&
                    ` · deposit by ${PAYMENT_METHOD_NAMES[order.depositMethod]}`}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Total</dt>
                <dd className="font-semibold text-foreground tabular-nums">
                  {formatRwf(order.total)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Paid</dt>
                <dd className="tabular-nums">{formatRwf(order.amountPaid ?? 0)}</dd>
              </div>
            </dl>
            {isCod && deposit > 0 && (
              <DepositBreakdown
                className="mt-3"
                deposit={deposit}
                balance={order.total - deposit}
                depositPaid={
                  order.paymentStatus === 'PARTIALLY_PAID' || order.paymentStatus === 'PAID'
                }
              />
            )}
          </ReviewBlock>

          <section className="space-y-4 rounded-2xl border bg-card p-5">
            <FormField id="order-status" label="Order status" hint={statusHint}>
              <div className="flex gap-2">
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as OrderStatus)}
                  disabled={locked}
                >
                  <SelectTrigger id="order-status" className="h-10 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_ORDER_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {ORDER_STATUS_STYLES[value].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => save('status')}
                  disabled={locked || status === order.status || saving !== null}
                  className="h-10 bg-accent-rose hover:bg-accent-rose-dark"
                >
                  {saving === 'status' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
            </FormField>

            <FormField
              id="payment-status"
              label="Payment status"
              hint="Use this to record a payment received outside the website."
            >
              <div className="flex gap-2">
                <Select
                  value={paymentStatus}
                  onValueChange={(value) => setPaymentStatus(value as PaymentStatus)}
                >
                  <SelectTrigger id="payment-status" className="h-10 flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_PAYMENT_STATUSES.map((value) => (
                      <SelectItem key={value} value={value}>
                        {PAYMENT_STATUS_STYLES[value].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => save('payment')}
                  disabled={paymentStatus === order.paymentStatus || saving !== null}
                  className="h-10"
                >
                  {saving === 'payment' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                </Button>
              </div>
            </FormField>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
