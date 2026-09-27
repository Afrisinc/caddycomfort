import { useCallback, useEffect, useState } from 'react';
import {
  FolderTree,
  Package,
  ShoppingBag,
  TrendingUp,
  Trophy,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageThumbnail } from '@/components/common/ImageThumbnail';
import { Skeleton } from '@/components/ui/skeleton';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPanel, PanelEmpty } from '@/components/admin/AdminPanel';
import { ExportButton } from '@/components/admin/ExportButton';
import { RankedBarList } from '@/components/admin/RankedBarList';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { dashboardApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';
import { formatRwf, formatRwfCompact } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import { useStoreSettings } from '@/store/useSettingsStore';
import type { RevenueByCategory, SalesAnalytics, TopProduct } from '@/types/api';

type Period = SalesAnalytics['period'];

const PERIODS: { value: Period; label: string; shortLabel: string; description: string }[] = [
  { value: 'week', label: '7 days', shortLabel: '7D', description: 'the last 7 days' },
  { value: 'month', label: '30 days', shortLabel: '30D', description: 'the last 30 days' },
  { value: 'year', label: '12 months', shortLabel: '12M', description: 'the last 12 months' },
];

const isPeriod = (value: string): value is Period => PERIODS.some((p) => p.value === value);

interface BreakdownRowProps {
  readonly label: string;
  readonly hint?: string;
  readonly value: number;
  readonly sign?: '+' | '−';
  readonly emphasis?: boolean;
  readonly tone?: 'green' | 'amber';
}

function BreakdownRow({ label, hint, value, sign, emphasis, tone }: BreakdownRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3">
      <div className="min-w-0">
        <dt className={cn('text-sm', emphasis ? 'font-medium' : 'text-muted-foreground')}>
          {label}
        </dt>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <dd
        className={cn(
          'shrink-0 text-sm tabular-nums',
          emphasis && 'text-base font-semibold',
          tone === 'green' && 'text-emerald-700 dark:text-emerald-400',
          tone === 'amber' && 'text-amber-700 dark:text-amber-400',
        )}
      >
        {sign && value > 0 ? `${sign} ` : ''}
        {formatRwf(value)}
      </dd>
    </div>
  );
}

function Analytics() {
  const settings = useStoreSettings();
  const { get, setFilter } = useUrlFilters();
  const requested = get('period');
  const period: Period = isPeriod(requested) ? requested : 'month';
  const periodInfo = PERIODS.find((p) => p.value === period)!;

  const [sales, setSales] = useState<SalesAnalytics | null>(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [newCustomers, setNewCustomers] = useState(0);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [categories, setCategories] = useState<RevenueByCategory[]>([]);
  const [rankingsLoading, setRankingsLoading] = useState(true);

  const loadSales = useCallback(async (value: Period) => {
    setSalesLoading(true);
    try {
      setSales(await dashboardApi.getSalesAnalytics(value));
    } catch {
      setSales(null);
      toast.error('We couldn’t load sales for this period');
    } finally {
      setSalesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSales(period);
  }, [period, loadSales]);

  useEffect(() => {
    Promise.allSettled([
      dashboardApi.getCustomerInsights(),
      dashboardApi.getTopProducts(5),
      dashboardApi.getRevenueByCategory(),
    ]).then(([insights, products, byCategory]) => {
      if (insights.status === 'fulfilled') setNewCustomers(insights.value.newCustomersThisMonth);
      if (products.status === 'fulfilled') setTopProducts(products.value);
      if (byCategory.status === 'fulfilled') setCategories(byCategory.value);
      setRankingsLoading(false);
    });
  }, []);

  const summary = sales?.summary;
  const outstanding = summary ? Math.max(0, summary.totalSales - summary.totalCollected) : 0;
  const categoryTotal = categories.reduce((sum, c) => sum + c.revenue, 0);

  const handleExport = () => {
    if (!sales) return;
    downloadCsv(`sales-${period}-${new Date().toISOString().slice(0, 10)}.csv`, [
      [sales.granularity === 'month' ? 'Month' : 'Date', 'Sales (Rwf)', 'Orders'],
      ...sales.chart.map((row) => [row.date, Math.round(row.sales), row.orders]),
      [],
      ['Summary', `Last ${periodInfo.label}`],
      ['Sales', Math.round(sales.summary.totalSales)],
      ['Orders', sales.summary.totalOrders],
      ['Average order value', Math.round(sales.summary.averageOrderValue)],
      ['Collected', Math.round(sales.summary.totalCollected)],
      ['Discounts', Math.round(sales.summary.totalDiscount)],
      ['Tax', Math.round(sales.summary.totalTax)],
      ['Shipping', Math.round(sales.summary.totalShipping)],
    ]);
    toast.success('Sales report downloaded');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Analytics" description="Sales, payments and best sellers">
        <SegmentedControl
          label="Reporting period"
          value={period}
          onValueChange={(value) => setFilter('period', value === 'month' ? '' : value)}
          options={PERIODS}
        />
        <ExportButton onExport={handleExport} disabled={!sales || salesLoading} />
      </AdminHeader>

      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <StatGrid columns={4} loading={salesLoading} className="mb-0">
          <StatCard
            title="Sales"
            value={formatRwf(summary?.totalSales ?? 0)}
            icon={TrendingUp}
            tone="rose"
            hint={`Last ${periodInfo.label}`}
          />
          <StatCard
            title="Orders"
            value={(summary?.totalOrders ?? 0).toLocaleString()}
            icon={ShoppingBag}
            tone="blue"
            hint="Excluding cancelled and refunded"
            href="/admin/orders"
          />
          <StatCard
            title="Average order"
            value={formatRwf(summary?.averageOrderValue ?? 0)}
            icon={Wallet}
            tone="violet"
            hint={`Free shipping from ${formatRwfCompact(settings.freeShippingThreshold)}`}
          />
          <StatCard
            title="New customers"
            value={newCustomers.toLocaleString()}
            icon={UserPlus}
            tone="green"
            hint="Signed up this month"
            href="/admin/customers"
          />
        </StatGrid>

        <div className="grid gap-6 xl:grid-cols-3">
          <AdminPanel
            className="xl:col-span-2"
            title="Revenue"
            description={`Order value placed in ${periodInfo.description}`}
          >
            <RevenueChart
              data={sales?.chart ?? []}
              granularity={sales?.granularity}
              loading={salesLoading}
              className="sm:h-80"
            />
          </AdminPanel>

          <AdminPanel title="Money breakdown" description={`Last ${periodInfo.label}`}>
            {salesLoading || !summary ? (
              <div className="space-y-4" aria-busy="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <dl className="-my-3 divide-y">
                  <BreakdownRow
                    label="Order value"
                    value={summary.totalSales}
                    emphasis
                    hint={`${summary.totalOrders.toLocaleString()} orders`}
                  />
                  <BreakdownRow
                    label="Discounts given"
                    hint="Already taken off the order value"
                    value={summary.totalDiscount}
                    sign="−"
                  />
                  <BreakdownRow
                    label="Tax"
                    hint={`${settings.taxRate}% VAT`}
                    value={summary.totalTax}
                  />
                  <BreakdownRow
                    label="Shipping"
                    hint={`${formatRwf(settings.standardShippingFee)} standard fee`}
                    value={summary.totalShipping}
                  />
                  <BreakdownRow
                    label="Collected"
                    hint="Online payments and cash received"
                    value={summary.totalCollected}
                    tone="green"
                    emphasis
                  />
                  <BreakdownRow
                    label="Still to collect"
                    hint="Unpaid orders and cash due at delivery"
                    value={outstanding}
                    tone={outstanding > 0 ? 'amber' : undefined}
                  />
                </dl>
                {settings.codDepositPercent > 0 && settings.codDepositPercent < 100 && (
                  <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    Cash on delivery orders pay a {settings.codDepositPercent}% deposit online; the
                    remaining {100 - settings.codDepositPercent}% is collected at the door.
                  </p>
                )}
              </>
            )}
          </AdminPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <AdminPanel
            title="Best-selling products"
            description="By revenue, all time"
            href="/admin/products"
            hrefLabel="Products"
          >
            {!rankingsLoading && topProducts.length === 0 ? (
              <PanelEmpty icon={Trophy}>Your best-selling products will show up here.</PanelEmpty>
            ) : (
              <RankedBarList
                loading={rankingsLoading}
                items={topProducts.map(({ product, totalSold, revenue }) => ({
                  id: product.id,
                  label: product.name,
                  detail: [`${totalSold.toLocaleString()} sold`, product.category?.name]
                    .filter(Boolean)
                    .join(' · '),
                  value: revenue,
                  display: formatRwfCompact(revenue),
                  media: (
                    <ImageThumbnail
                      images={product.images?.length ? product.images : [product.imageUrl]}
                      alt={product.name}
                      size="sm"
                      fallbackIcon={Package}
                    />
                  ),
                }))}
              />
            )}
          </AdminPanel>

          <AdminPanel
            title="Sales by category"
            description="Share of revenue, all time"
            href="/admin/categories"
            hrefLabel="Categories"
          >
            {!rankingsLoading && categories.length === 0 ? (
              <PanelEmpty icon={FolderTree}>Category sales will show up here.</PanelEmpty>
            ) : (
              <RankedBarList
                loading={rankingsLoading}
                items={categories.slice(0, 6).map((category) => ({
                  id: category.categoryId,
                  label: category.categoryName,
                  detail: `${category.itemsSold.toLocaleString()} items · ${formatRwfCompact(category.revenue)}`,
                  value: category.revenue,
                  display: `${categoryTotal > 0 ? Math.round((category.revenue / categoryTotal) * 100) : 0}%`,
                }))}
              />
            )}
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <Analytics />
      </AdminLayout>
    </ProtectedRoute>
  );
}
