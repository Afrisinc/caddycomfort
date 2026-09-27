import { useCallback, useEffect, useState } from 'react';
import { Banknote, Clock, PackageCheck, RefreshCw, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CellMeta, CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
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
import { TablePagination } from '@/components/admin/TablePagination';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmptyState } from '@/components/common/EmptyState';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/StatusBadge';
import { ALL, useUrlFilters } from '@/hooks/useUrlFilters';
import { adminOrdersApi, type AdminOrderStats } from '@/lib/api';
import { ADMIN_PAGE_SIZE } from '@/lib/pagination';
import { formatRwf } from '@/lib/pricing';
import {
  ADMIN_ORDER_STATUSES,
  ADMIN_PAYMENT_STATUSES,
  ORDER_STATUS_STYLES,
  PAYMENT_METHOD_NAMES,
  PAYMENT_STATUS_STYLES,
} from '@/lib/orderStatus';
import type { Order, OrderStatus, PaymentStatus } from '@/types/api';
import { SearchInput } from '@/components/ui/search-input';

const COLUMNS = [
  { key: 'order', label: 'Order' },
  { key: 'customer', label: 'Customer' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'payment', label: 'Payment' },
  { key: 'collect', label: 'Cash to collect', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', hideLabel: true },
] as const;

function cashToCollect(order: Order): number {
  if (order.paymentMethod !== 'CASH_ON_DELIVERY') return 0;
  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') return 0;
  return order.balanceDue ?? 0;
}

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const { get, query, search, setSearch, setFilter, page, setPage, clearFilters, hasFilters } =
    useUrlFilters();
  const status = get('status') as OrderStatus | typeof ALL;
  const paymentStatus = get('payment') as PaymentStatus | typeof ALL;
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await adminOrdersApi.getAll({
        page,
        limit: ADMIN_PAGE_SIZE,
        search: query,
        status: status === ALL ? undefined : status,
        paymentStatus: paymentStatus === ALL ? undefined : paymentStatus,
      });
      setOrders(result.orders);
      setTotalCount(result.pagination.total);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, query, status, paymentStatus]);

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

  const handleUpdated = (updated: Order) => {
    setOrders((list) => list.map((order) => (order.id === updated.id ? updated : order)));
    setSelected(updated);
    loadStats();
  };

  const needsAction = (stats?.byStatus.PENDING ?? 0) + (stats?.byStatus.PROCESSING ?? 0);

  const renderRows = () =>
    orders.map((order) => {
      const collect = cashToCollect(order);
      return (
        <DataRow key={order.id}>
          <DataCell>
            <CellTitle mono>{order.orderNumber}</CellTitle>
            <CellMeta>
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </CellMeta>
          </DataCell>
          <DataCell>
            <CellTitle className="max-w-48">{order.customer?.name || 'Customer'}</CellTitle>
            <CellMeta className="max-w-48">{order.customer?.email}</CellMeta>
          </DataCell>
          <DataCell align="right" numeric strong>
            {formatRwf(order.total)}
          </DataCell>
          <DataCell>
            <div className="flex flex-col items-start gap-1">
              <PaymentStatusBadge status={order.paymentStatus} />
              <CellMeta>{PAYMENT_METHOD_NAMES[order.paymentMethod]}</CellMeta>
            </div>
          </DataCell>
          <DataCell align="right" numeric>
            {collect > 0 ? (
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                {formatRwf(collect)}
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </DataCell>
          <DataCell>
            <OrderStatusBadge status={order.status} />
          </DataCell>
          <DataCell align="right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelected(order)}
              aria-label={`Manage order ${order.orderNumber}`}
            >
              Manage
            </Button>
          </DataCell>
        </DataRow>
      );
    });

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
      <DataTable columns={COLUMNS} label="Orders" loading={loading} minWidth="min-w-224">
        {renderRows()}
      </DataTable>
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
          <SearchInput
            className="flex-1"
            label="Search orders"
            placeholder="Search by order number, customer name or email"
            value={search}
            onValueChange={setSearch}
          />
          <div className="flex flex-wrap gap-3">
            <Select value={status} onValueChange={(value) => setFilter('status', value)}>
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
            <Select value={paymentStatus} onValueChange={(value) => setFilter('payment', value)}>
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

        {renderTable()}

        {!loading && !loadFailed && (
          <TablePagination
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={totalCount}
            onPageChange={setPage}
            noun={['order', 'orders']}
          />
        )}
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
