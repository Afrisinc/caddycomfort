import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { dashboardApi } from '@/lib/api';
import { DashboardStats, SalesAnalytics, TopProduct, RevenueByCategory } from '@/types/api';
import { toast } from 'sonner';

type Period = 'week' | 'month' | 'year';

const PERIOD_LABELS: Record<Period, string> = {
  week: 'Last 7 Days',
  month: 'Last 30 Days',
  year: 'Last 12 Months',
};

function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `Rwf ${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `Rwf ${(amount / 1_000).toFixed(0)}K`;
  return `Rwf ${amount.toLocaleString()}`;
}

function escapeCsvField(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function Analytics() {
  const [period, setPeriod] = useState<Period>('month');
  const [overallStats, setOverallStats] = useState<DashboardStats | null>(null);
  const [sales, setSales] = useState<SalesAnalytics | null>(null);
  const [newCustomers, setNewCustomers] = useState<number | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<RevenueByCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChartLoading, setIsChartLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [stats, insights, products, categories] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getCustomerInsights(),
          dashboardApi.getTopProducts(5),
          dashboardApi.getRevenueByCategory(),
        ]);
        setOverallStats(stats);
        setNewCustomers(insights.newCustomersThisMonth);
        setTopProducts(products);
        setTopCategories(categories);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchSales = useCallback(async (p: Period) => {
    try {
      setIsChartLoading(true);
      const data = await dashboardApi.getSalesAnalytics(p);
      setSales(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load sales chart');
    } finally {
      setIsChartLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales(period);
  }, [period, fetchSales]);

  const totalCategoryRevenue = topCategories.reduce((sum, c) => sum + c.revenue, 0);

  const statCards = overallStats
    ? [
        {
          title: 'Total Revenue',
          value: formatMoney(overallStats.revenue.total),
          icon: DollarSign,
        },
        {
          title: 'Total Orders',
          value: overallStats.orders.total.toLocaleString(),
          icon: ShoppingBag,
        },
        {
          title: 'New Customers',
          value: (newCustomers ?? 0).toLocaleString(),
          icon: Users,
          hint: 'this month',
        },
        {
          title: 'Avg. Order Value',
          value: sales ? formatMoney(sales.summary.averageOrderValue) : '—',
          icon: TrendingUp,
        },
      ]
    : [];

  const handleExport = () => {
    if (!sales) return;
    const rows: (string | number)[][] = [
      ['Date', 'Sales (Rwf)', 'Orders'],
      ...sales.chart.map((row) => [row.date, row.sales, row.orders]),
      [],
      ['Summary'],
      ['Total Sales', sales.summary.totalSales],
      ['Total Orders', sales.summary.totalOrders],
      ['Average Order Value', sales.summary.averageOrderValue],
      ['Total Discount', sales.summary.totalDiscount],
      ['Total Tax', sales.summary.totalTax],
      ['Total Shipping', sales.summary.totalShipping],
    ];
    downloadCsv(`analytics-${period}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    toast.success('Report exported');
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Analytics & Reports" description="Track your business performance">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-44">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{PERIOD_LABELS.week}</SelectItem>
            <SelectItem value="month">{PERIOD_LABELS.month}</SelectItem>
            <SelectItem value="year">{PERIOD_LABELS.year}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={!sales || sales.chart.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                    <Skeleton className="h-7 w-20" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <div className="h-10 w-10 rounded-full bg-accent-rose/10 flex items-center justify-center">
                        <stat.icon className="h-5 w-5 text-accent-rose" />
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.hint && (
                        <p className="text-sm text-muted-foreground mt-1">{stat.hint}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sales yet.</p>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((item, index) =>
                    item.product ? (
                      <div key={item.product.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent-rose/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-accent-rose">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground">{item.totalSold} sold</p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {formatMoney(item.product.price * item.totalSold)}
                        </p>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  ))}
                </div>
              ) : topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No sales yet.</p>
              ) : (
                <div className="space-y-4">
                  {topCategories.map((category) => {
                    const percentage =
                      totalCategoryRevenue > 0
                        ? (category.revenue / totalCategoryRevenue) * 100
                        : 0;
                    return (
                      <div key={category.categoryId}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <p className="font-medium">{category.categoryName}</p>
                            <p className="text-sm text-muted-foreground">
                              {category.itemsSold} items
                            </p>
                          </div>
                          <p className="font-semibold">{percentage.toFixed(0)}%</p>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-rose"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {isChartLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : !sales || sales.chart.length === 0 ? (
              <div className="h-80 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No sales in this period yet</p>
                </div>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sales.chart}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C2185B" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C2185B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) =>
                        new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }
                      fontSize={12}
                    />
                    <YAxis tickFormatter={(v) => formatMoney(v)} fontSize={12} width={70} />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'sales' ? formatMoney(Number(value)) : value,
                        name === 'sales' ? 'Sales' : 'Orders',
                      ]}
                      labelFormatter={(d) =>
                        new Date(String(d)).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#C2185B"
                      fill="url(#revenueFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
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
