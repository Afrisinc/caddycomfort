import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { InfoCard } from '@/components/ui/info-card';
import { Heading } from '@/components/ui/typography';
import { formatRwf } from '@/lib/pricing';
import { formatVariant } from '@/lib/checkout';
import Link from '@/components/common/Link';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { ordersApi } from '@/lib/api';
import { needsOnlinePayment } from '@/lib/checkout';
import { CompletePaymentCard } from '@/components/checkout/CompletePaymentCard';
import { DepositBreakdown } from '@/components/checkout/DepositBreakdown';
import { Order, OrderStatus } from '@/types/api';
import { toast } from 'sonner';
import { ArrowLeft, Ban, Loader2, MapPin, Package, Receipt } from 'lucide-react';
import { OrderStatusBadge } from '@/components/orders/StatusBadge';
import { OrderProgress } from '@/components/orders/OrderProgress';
import { OrderDetailSkeleton } from '@/components/orders/OrderSkeletons';
import { Skeleton } from '@/components/ui/skeleton';

const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING'];

function OrderDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await ordersApi.getById(id);
      setOrder(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order');
      router.push('/account/orders');
    }
  }, [id, router]);

  useEffect(() => {
    if (isAuthenticated) fetchOrder();
  }, [isAuthenticated, fetchOrder]);

  const handleCancel = async () => {
    if (!order) return;
    try {
      setIsCancelling(true);
      await ordersApi.cancel(order.id);
      toast.success('Order cancelled');
      fetchOrder();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isAuthenticated) return null;

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-4 w-28" />
          <OrderDetailSkeleton />
        </div>
      </div>
    );
  }
  const address = order.shippingAddress as
    | { street?: string; city?: string; state?: string; postalCode?: string; country?: string }
    | undefined;
  const addressLine = [
    ...new Set(
      [address?.street, address?.city, address?.state, address?.postalCode, address?.country]
        .map((part) => part?.trim())
        .filter(Boolean),
    ),
  ].join(', ');
  const summaryRows: { label: string; value: string; tone?: 'green' }[] = [
    { label: 'Subtotal', value: formatRwf(order.subtotal) },
    ...(order.discount > 0
      ? [{ label: 'Discount', value: `− ${formatRwf(order.discount)}`, tone: 'green' as const }]
      : []),
    { label: 'Shipping', value: order.shippingCost > 0 ? formatRwf(order.shippingCost) : 'Free' },
    { label: 'Tax', value: formatRwf(order.tax) },
  ];

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/account/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>

        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <Heading as="h1" size="lg" className="mb-1">
              Order {order.orderNumber}
            </Heading>
            <p className="text-sm text-muted-foreground">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <OrderProgress status={order.status} className="mb-8" />

        {order.paymentMethod === 'CASH_ON_DELIVERY' &&
          (order.depositAmount ?? 0) > 0 &&
          order.paymentStatus !== 'PAID' && (
            <DepositBreakdown
              className="mb-6"
              deposit={order.depositAmount ?? 0}
              balance={order.total - (order.depositAmount ?? 0)}
              depositPaid={order.paymentStatus === 'PARTIALLY_PAID'}
            />
          )}

        {needsOnlinePayment(order) && (
          <div className="mb-6">
            <CompletePaymentCard
              order={order}
              defaultPhone={(order.shippingAddress as { phone?: string } | undefined)?.phone}
              onPaid={fetchOrder}
            />
          </div>
        )}

        <InfoCard
          title={`Items (${order.items.reduce((sum, item) => sum + item.quantity, 0)})`}
          icon={Package}
          className="mb-6"
        >
          <ul className="divide-y">
            {order.items.map((item) => {
              const variant = formatVariant({
                size: item.size ?? undefined,
                color: item.color ?? undefined,
              });
              return (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-muted-foreground">
                      Qty {item.quantity}
                      {variant ? ` · ${variant}` : ''} · {formatRwf(item.price)} each
                    </p>
                  </div>
                  <p className="shrink-0 font-medium tabular-nums">
                    {formatRwf(item.price * item.quantity)}
                  </p>
                </li>
              );
            })}
          </ul>
        </InfoCard>

        {addressLine && (
          <InfoCard title="Shipping address" icon={MapPin} className="mb-6">
            <p className="text-sm text-muted-foreground">{addressLine}</p>
          </InfoCard>
        )}

        <InfoCard title="Summary" icon={Receipt} className="mb-6">
          <dl className="space-y-2 text-sm">
            {summaryRows.map((row) => (
              <div key={row.label} className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd
                  className={cn(
                    'tabular-nums',
                    row.tone === 'green' && 'text-emerald-700 dark:text-emerald-400',
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-t pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatRwf(order.total)}</dd>
            </div>
          </dl>
        </InfoCard>

        {CANCELLABLE_STATUSES.includes(order.status) && (
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={handleCancel}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Ban className="h-4 w-4 mr-2" />
            )}
            Cancel Order
          </Button>
        )}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>() as { id: string };
  return (
    <>
      <Navbar />
      <OrderDetailView id={id} />
      <Footer />
    </>
  );
}
