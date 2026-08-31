import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from '@/components/common/Link';
import { useAuthStore } from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types/api';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, MapPin, Ban } from 'lucide-react';

const ORDER_STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
  REFUNDED: { label: 'Refunded', className: 'bg-red-100 text-red-800' },
};

const CANCELLABLE_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING'];

function formatMoney(amount: number): string {
  return `Rwf ${amount.toLocaleString()}`;
}

function OrderDetailView({ id }: { id: string }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrder();
  }, [isAuthenticated, id]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const data = await ordersApi.getById(id);
      setOrder(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load order');
      router.push('/account/orders');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
      </div>
    );
  }

  if (!order) return null;

  const badge = ORDER_STATUS_BADGES[order.status];
  const address = order.shippingAddress as
    | { street?: string; city?: string; state?: string; postalCode?: string; country?: string }
    | undefined;

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

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif mb-1">{order.orderNumber}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <Badge className={badge.className}>{badge.label}</Badge>
        </div>

        {/* Items */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">
                    Qty {item.quantity}
                    {item.size ? ` • Size ${item.size}` : ''}
                    {item.color ? ` • ${item.color}` : ''}
                  </p>
                </div>
                <p className="font-medium">{formatMoney(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Address */}
        {address && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent-rose" />
              Shipping Address
            </h2>
            <p className="text-sm text-muted-foreground">
              {address.street}, {address.city}, {address.state} {address.postalCode},{' '}
              {address.country}
            </p>
          </div>
        )}

        {/* Totals */}
        <div className="bg-card border rounded-lg p-6 mb-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-{formatMoney(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatMoney(order.shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatMoney(order.tax)}</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>

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
