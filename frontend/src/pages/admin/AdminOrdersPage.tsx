import { useCallback, useEffect, useState } from 'react';
import {
  Banknote,
  Clock,
  PackageCheck,
  RefreshCw,
  Search,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OrderDetailSheet } from '@/components/admin/OrderDetailSheet';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmptyState } from '@/components/common/EmptyState';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { adminOrdersApi, type AdminOrderStats } from '@/lib/api';
import { formatRwf } from '@/lib/pricing';
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_NAMES,
  PAYMENT_STATUS_STYLES,
} from '@/lib/orderStatus';
import type { Order, OrderStatus, PaymentStatus } from '@/types/api';

const PAGE_SIZE = 20;
const ALL = 'all';

function cashToCollect(order: Order): number {
  if (order.paymentMethod !== 'CASH_ON_DELIVERY') return 0;
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return 0;
  return order.balanceDue ?? 0;
}

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<OrderStatus | typeof ALL>(ALL);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | typeof ALL>(ALL);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const debouncedSearch = useDebounce(search, 350);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await adminOrdersApi.getAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        status: status === ALL ? undefined : status,
        paymentStatus: paymentStatus === ALL ? undefined : paymentStatus,
      });
      setOrders(result.orders);
      setTotalPages(result.pagination.totalPages || 1);
      setTotalCount(result.pagination.total);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, paymentStatus]);

  const loadStats = useCallback(() => {
    adminOrdersApi
      .getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, paymentStatus]);

  const handleUpdated = (updated: Order) => {
    setOrders((list) => list.map((order) => (order.id === updated.id ? updated : order)));
    setSelected(updated);
    loadStats();
  };

  const hasFilters = !!search || status !== ALL || paymentStatus !== ALL;
  const clearFilters = () => {
    setSearch('');
    setStatus(ALL);
    setPaymentStatus(ALL);
  };

  const needsAction = (stats?.byStatus.PENDING ?? 0) + (stats?.byStatus.PROCESSING ?? 0);

  const renderRows = () => {
    if (loading) {
      return Array.from({ length: 6 }, (_, i) => (
        <tr key={i} className="border-b">
          <td colSpan={7} className="p-4">
            <Skeleton className="h-6 w-full" />
          </td>
        </tr>
      ));
    }
    return orders.map((order) => {
      const collect = cashToCollect(order);
      return (
        <tr key={order.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
          <td className="p-4">
            <p className="font-medium">{order.orderNumber}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </td>
          <td className="p-4">
            <p className="max-w-48 truncate text-sm font-medium">
              {order.customer?.name || 'Customer'}
            </p>
            <p className="max-w-48 truncate text-xs text-muted-foreground">
              {order.customer?.email}
            </p>
          </td>
          <td className="p-4 text-right text-sm font-semibold tabular-nums">
            {formatRwf(order.total)}
          </td>
          <td className="p-4">
            <div className="flex flex-col items-start gap-1">
              <PaymentStatusBadge status={order.paymentStatus} />
              <span className="text-xs text-muted-foreground">
                {PAYMENT_METHOD_NAMES[order.paymentMethod]}
              </span>
            </div>
          </td>
          <td className="p-4 text-right text-sm tabular-nums">
            {collect > 0 ? (
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {formatRwf(collect)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </td>
          <td className="p-4">
            <OrderStatusBadge status={order.status} />
          </td>
          <td className="p-4 text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(order)}
              aria-label={`Manage order ${order.orderNumber}`}
            >
              Manage
            </Button>
          </td>
        </tr>
      );
    });
  };

  const renderTable = () => {
    if (loadFailed) {
      return (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load orders"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={loadOrders}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && orders.length === 0) {
      return (
        <EmptyState
          icon={ShoppingBag}
          title={hasFilters ? 'No orders match these filters' : 'No orders yet'}
          description={
            hasFilters
              ? 'Try a different search or clear the filters.'
              : 'New orders will appear here.'
          }
          action={
            hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )
          }
        />
      );
    }
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[56rem]">
            <thead className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 text-right font-medium">Total</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 text-right font-medium">Cash to collect</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Orders" description="Track, update and fulfil customer orders">
        <Button
          variant="outline"
          onClick={() => {
            loadOrders();
            loadStats();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        <StatGrid columns={4} loading={statsLoading}>
          <StatCard
            title="Total orders"
            value={(stats?.totalOrders ?? 0).toLocaleString()}
            icon={ShoppingBag}
            tone="blue"
          />
          <StatCard
            title="Needs action"
            value={needsAction.toLocaleString()}
            icon={Clock}
            tone={needsAction > 0 ? 'amber' : 'neutral'}
            hint="Pending or processing"
          />
          <StatCard
            title="Deposit paid"
            value={(stats?.byPaymentStatus.PARTIALLY_PAID ?? 0).toLocaleString()}
            icon={Banknote}
            tone="violet"
            hint="Cash due on delivery"
          />
          <StatCard
            title="Delivered"
            value={(stats?.byStatus.DELIVERED ?? 0).toLocaleString()}
            icon={PackageCheck}
            tone="green"
            hint={stats ? `${formatRwf(stats.totalRevenue)} revenue` : undefined}
          />
        </StatGrid>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order number, customer name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search orders"
              className="h-10 bg-background pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as OrderStatus | typeof ALL)}
            >
              <SelectTrigger
                className="h-10 w-full bg-background sm:w-44"
                aria-label="Filter by order status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                {ADMIN_ORDER_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {ORDER_STATUS_STYLES[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as PaymentStatus | typeof ALL)}
            >
              <SelectTrigger
                className="h-10 w-full bg-background sm:w-44"
                aria-label="Filter by payment status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All payments</SelectItem>
                {ADMIN_PAYMENT_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PAYMENT_STATUS_STYLES[value].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!loading && !loadFailed && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            {totalCount.toLocaleString()} {totalCount === 1 ? 'order' : 'orders'}
          </p>
        )}

        {renderTable()}

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} className="mt-6" />
      </div>

      <OrderDetailSheet
        order={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <OrdersManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
