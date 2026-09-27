import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  Package,
  PackageCheck,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react';
import Link from '@/components/common/Link';
import { ImageThumbnail } from '@/components/common/ImageThumbnail';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { StatusPill } from '@/components/ui/status-pill';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPanel, PanelEmpty } from '@/components/admin/AdminPanel';
import { RankedBarList } from '@/components/admin/RankedBarList';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { OrderStatusBadge } from '@/components/orders/StatusBadge';
import { dashboardApi } from '@/lib/api';
import { formatRwf, formatRwfCompact } from '@/lib/pricing';
import { formatRelativeTime } from '@/lib/utils';
import { useStoreSettings } from '@/store/useSettingsStore';
import type {
  DashboardLowStockProduct,
  DashboardRecentOrder,
  DashboardStats,
  SalesAnalytics,
  TopProduct,
} from '@/types/api';

interface DashboardData {
  stats: DashboardStats | null;
  sales: SalesAnalytics | null;
  recentOrders: DashboardRecentOrder[];
  lowStock: DashboardLowStockProduct[];
  topProducts: TopProduct[];
}

const EMPTY: DashboardData = {
  stats: null,
  sales: null,
  recentOrders: [],
  lowStock: [],
  topProducts: [],
};

const STOCK_ALERT_LIMIT = 6;

function customerName(user: DashboardRecentOrder['user']): string {
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

function greeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function settled<T>(result: PromiseSettledResult<T>, fallback: T): T {
  return result.status === 'fulfilled' ? result.value : fallback;
}

function AdminDashboard() {
  const settings = useStoreSettings();
  const [data, setData] = useState<DashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [stats, sales, recentOrders, lowStock, topProducts] = await Promise.allSettled([
      dashboardApi.getStats(),
      dashboardApi.getSalesAnalytics('month'),
      dashboardApi.getRecentOrders(6),
      dashboardApi.getLowStockAlert(),
      dashboardApi.getTopProducts(5),
    ]);
    setData({
      stats: settled(stats, null),
      sales: settled(sales, null),
      recentOrders: settled(recentOrders, []),
      lowStock: settled(lowStock, []),
      topProducts: settled(topProducts, []),
    });
    setFailed(stats.status === 'rejected');
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { stats, sales, recentOrders, lowStock, topProducts } = data;
  const pending = stats?.orders.pending ?? 0;
  const lowCount = stats?.products.lowStock ?? 0;
  const outCount = stats?.products.outOfStock ?? 0;
  const stockAlerts = lowCount + outCount;
  const cashToCollect = stats?.revenue.cashToCollect ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader
        title="Dashboard"
        description={`${greeting(new Date())} — here’s how ${settings.storeName} is doing.`}
      >
        <Button variant="outline" asChild className="gap-2">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            View store
          </Link>
        </Button>
        <Button asChild className="gap-2 bg-accent-rose hover:bg-accent-rose-dark">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </AdminHeader>

      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        {failed && !loading && (
          <div
            role="alert"
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          >
            Some dashboard figures couldn’t be loaded.
            <Button variant="outline" size="sm" onClick={load} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        )}

        <StatGrid columns={4} loading={loading} className="mb-0">
          <StatCard
            title="Revenue collected"
            value={formatRwf(stats?.revenue.total ?? 0)}
            icon={Wallet}
            tone="green"
            hint={
              cashToCollect > 0
                ? `${formatRwfCompact(cashToCollect)} still due at delivery`
                : 'Online payments and cash at delivery'
            }
            href="/admin/analytics"
          />
          <StatCard
            title="Orders"
            value={(stats?.orders.total ?? 0).toLocaleString()}
            icon={ShoppingBag}
            tone={pending > 0 ? 'amber' : 'blue'}
            hint={pending > 0 ? `${pending} waiting to be processed` : 'All caught up'}
            href={pending > 0 ? '/admin/orders?status=PENDING' : '/admin/orders'}
          />
          <StatCard
            title="Customers"
            value={(stats?.users.total ?? 0).toLocaleString()}
            icon={Users}
            tone="violet"
            hint={`${(stats?.orders.completed ?? 0).toLocaleString()} orders delivered`}
            href="/admin/customers"
          />
          <StatCard
            title="Stock alerts"
            value={stockAlerts.toLocaleString()}
            icon={stockAlerts > 0 ? AlertTriangle : PackageCheck}
            tone={outCount > 0 ? 'red' : lowCount > 0 ? 'amber' : 'neutral'}
            hint={
              stockAlerts > 0
                ? `${outCount} out · ${lowCount} running low`
                : 'Every product is well stocked'
            }
            href="/admin/products?stock=low"
          />
        </StatGrid>

        <div className="grid gap-6 xl:grid-cols-3">
          <AdminPanel
            className="xl:col-span-2"
            title="Sales"
            description="Last 30 days, excluding cancelled orders"
            href="/admin/analytics"
            hrefLabel="Analytics"
          >
            {sales && (
              <dl className="mb-4 flex flex-wrap gap-x-8 gap-y-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Sales</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatRwf(sales.summary.totalSales)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Orders</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {sales.summary.totalOrders.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Avg. order</dt>
                  <dd className="text-lg font-semibold tabular-nums">
                    {formatRwf(sales.summary.averageOrderValue)}
                  </dd>
                </div>
              </dl>
            )}
            <RevenueChart
              data={sales?.chart ?? []}
              granularity={sales?.granularity}
              loading={loading}
            />
          </AdminPanel>

          <AdminPanel
            title="Needs restocking"
            description={`At or below ${stats?.products.lowStockThreshold ?? 10} units`}
            href="/admin/inventory"
            hrefLabel="Inventory"
          >
            {loading ? (
              <SkeletonList rows={5} label="Loading stock alerts" />
            ) : lowStock.length === 0 ? (
              <PanelEmpty icon={PackageCheck}>Every active product is well stocked.</PanelEmpty>
            ) : (
              <ul className="-my-2 divide-y">
                {lowStock.slice(0, STOCK_ALERT_LIMIT).map((product) => {
                  const out = product.stockQuantity <= 0;
                  return (
                    <li key={product.id} className="flex items-center gap-3 py-2.5">
                      <ImageThumbnail
                        images={product.images?.length ? product.images : [product.imageUrl]}
                        alt={product.name}
                        size="sm"
                        fallbackIcon={Package}
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/admin/products/${product.slug || product.id}`}
                          className="block truncate text-sm font-medium outline-none hover:text-accent-rose focus-visible:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          {product.sku}
                        </p>
                      </div>
                      <StatusPill tone={out ? 'red' : 'amber'} className="shrink-0 tabular-nums">
                        {out ? 'Out of stock' : `${product.stockQuantity} left`}
                      </StatusPill>
                    </li>
                  );
                })}
                {lowStock.length > STOCK_ALERT_LIMIT && (
                  <li className="pt-3 text-xs text-muted-foreground">
                    +{lowStock.length - STOCK_ALERT_LIMIT} more in inventory
                  </li>
                )}
              </ul>
            )}
          </AdminPanel>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <AdminPanel
            className="xl:col-span-2"
            title="Recent orders"
            description="The latest orders across the store"
            href="/admin/orders"
          >
            {loading ? (
              <SkeletonList rows={6} label="Loading recent orders" />
            ) : recentOrders.length === 0 ? (
              <PanelEmpty icon={ShoppingBag}>New orders will appear here.</PanelEmpty>
            ) : (
              <ul className="-my-2 divide-y">
                {recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders?q=${encodeURIComponent(order.orderNumber)}`}
                      className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-accent-rose/40"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-rose/10 text-accent-rose">
                        <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{customerName(order.user)}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          <span className="font-mono">{order.orderNumber}</span> ·{' '}
                          {formatRelativeTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
                        <span className="text-sm font-semibold tabular-nums">
                          {formatRwf(order.total)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </AdminPanel>

          <AdminPanel
            title="Best sellers"
            description="By revenue, all time"
            href="/admin/analytics"
            hrefLabel="More"
          >
            {!loading && topProducts.length === 0 ? (
              <PanelEmpty icon={Trophy}>Your best-selling products will show up here.</PanelEmpty>
            ) : (
              <RankedBarList
                loading={loading}
                items={topProducts.map(({ product, totalSold, revenue }) => ({
                  id: product.id,
                  label: product.name,
                  detail: `${totalSold.toLocaleString()} sold`,
                  value: revenue,
                  display: formatRwfCompact(revenue),
                }))}
              />
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </ProtectedRoute>
  );
}
