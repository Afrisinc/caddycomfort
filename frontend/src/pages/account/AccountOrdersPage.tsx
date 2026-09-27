import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, RefreshCw } from 'lucide-react';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/ui/button';
import { OrderCardSkeleton } from '@/components/orders/OrderSkeletons';
import { Pagination } from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/useAuthStore';
import { ordersApi } from '@/lib/api';
import type { Order, OrderStatus } from '@/types/api';

const PAGE_SIZE = 10;

const TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AccountOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get('status') as OrderStatus | null) ?? 'all';
  const page = Number(searchParams.get('page')) || 1;

  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.push('/login?redirect=/account/orders');
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await ordersApi.getAll({
        page,
        limit: PAGE_SIZE,
        status: status === 'all' ? undefined : status,
      });
      setOrders(result.orders);
      setTotalPages(result.pagination.totalPages || 1);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  const updateParams = (next: { status?: string; page?: number }) => {
    const params = new URLSearchParams(searchParams);
    if (next.status !== undefined) {
      if (next.status === 'all') params.delete('status');
      else params.set('status', next.status);
      params.delete('page');
    }
    if (next.page !== undefined) {
      if (next.page > 1) params.set('page', String(next.page));
      else params.delete('page');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setSearchParams(params);
  };

  if (!isAuthenticated) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      );
    }
    if (loadFailed) {
      return (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load your orders"
          description="Please check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (orders.length === 0) {
      const filtered = status !== 'all';
      return (
        <EmptyState
          icon={Package}
          title={filtered ? 'No orders with this status' : 'No orders yet'}
          description={
            filtered
              ? 'Try another tab to see the rest of your orders.'
              : 'When you place an order, you can follow it here from payment to delivery.'
          }
          action={
            filtered ? (
              <Button variant="outline" onClick={() => updateParams({ status: 'all' })}>
                Show all orders
              </Button>
            ) : (
              <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                <Link href="/shop">Start shopping</Link>
              </Button>
            )
          }
        />
      );
    }
    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(next) => updateParams({ page: next })}
          className="pt-4"
        />
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-20">
        <PageHeader
          title="My orders"
          description="Track your orders, complete pending payments and see what's due on delivery."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Account', href: '/account' },
            { label: 'Orders' },
          ]}
        />
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <Tabs
            value={status}
            onValueChange={(value) => updateParams({ status: value })}
            variant="underline"
            className="mb-8"
          >
            <TabsList aria-label="Filter orders by status">
              {TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          {renderContent()}
        </div>
      </main>
      <Footer />
    </>
  );
}
