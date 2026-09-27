import { useId } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PanelEmpty } from '@/components/admin/AdminPanel';
import { formatRwf, formatRwfCompact } from '@/lib/pricing';
import { cn } from '@/lib/utils';

export interface RevenuePoint {
  date: string;
  sales: number;
  orders: number;
}

interface RevenueChartProps {
  readonly data: readonly RevenuePoint[];
  readonly granularity?: 'day' | 'month';
  readonly loading?: boolean;
  readonly className?: string;
}

function formatTick(date: string, granularity: 'day' | 'month') {
  const value = new Date(`${date}T00:00:00Z`);
  return granularity === 'month'
    ? value.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    : value.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function formatLabel(date: string, granularity: 'day' | 'month') {
  const value = new Date(`${date}T00:00:00Z`);
  return value.toLocaleDateString('en-US', {
    ...(granularity === 'day' && { weekday: 'short', day: 'numeric' }),
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

interface TooltipContentProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{ payload: RevenuePoint }>;
  readonly granularity: 'day' | 'month';
}

function ChartTooltip({ active, payload, granularity }: TooltipContentProps) {
  const point = active ? payload?.[0]?.payload : undefined;
  if (!point) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-md">
      <p className="text-xs text-muted-foreground">{formatLabel(point.date, granularity)}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{formatRwf(point.sales)}</p>
      <p className="text-xs text-muted-foreground tabular-nums">
        {point.orders} {point.orders === 1 ? 'order' : 'orders'}
      </p>
    </div>
  );
}

export function RevenueChart({ data, granularity = 'day', loading, className }: RevenueChartProps) {
  const gradientId = `revenue-${useId().replace(/[^\w-]/g, '')}`;
  const heightClass = cn('h-64 sm:h-72', className);

  if (loading) return <Skeleton className={cn(heightClass, 'w-full rounded-xl')} />;

  if (!data.some((point) => point.sales > 0)) {
    return (
      <div className={cn(heightClass, 'rounded-xl bg-muted/30')}>
        <PanelEmpty icon={TrendingUp}>No sales in this period yet.</PanelEmpty>
      </div>
    );
  }

  return (
    <div
      className={cn(
        heightClass,
        'text-accent-rose [&_.recharts-cartesian-axis-tick-value]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border',
      )}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={[...data]} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.25} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="date"
            tickFormatter={(date) => formatTick(date, granularity)}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
            tickMargin={8}
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value) => formatRwfCompact(Number(value)).replace('Rwf ', '')}
            tickLine={false}
            axisLine={false}
            width={44}
            fontSize={12}
          />
          <Tooltip
            cursor={{ stroke: 'currentColor', strokeOpacity: 0.3 }}
            content={<ChartTooltip granularity={granularity} />}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="currentColor"
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 4, strokeWidth: 0, fill: 'currentColor' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
