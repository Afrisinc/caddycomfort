import { useCallback, useEffect, useState } from 'react';
import {
  Copy,
  MoreVertical,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Tag,
  Ticket,
  Trash2,
  Wallet,
} from 'lucide-react';
import Link from '@/components/common/Link';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/ui/search-input';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { TablePagination } from '@/components/admin/TablePagination';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ALL, useUrlFilters } from '@/hooks/useUrlFilters';
import { couponsApi, type CouponStatus } from '@/lib/api';
import { ADMIN_PAGE_SIZE } from '@/lib/pagination';
import { formatRwf } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import type { Coupon, CouponStats } from '@/types/api';

const STATUS_STYLES: Record<CouponStatus, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  expired: {
    label: 'Expired',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  inactive: { label: 'Paused', className: 'bg-muted text-muted-foreground' },
};

const STATUSES = Object.keys(STATUS_STYLES) as CouponStatus[];

function couponStatus(coupon: Coupon): CouponStatus {
  if (!coupon.isActive) return 'inactive';
  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return 'expired';
  return 'active';
}

function discountLabel(coupon: Coupon): string {
  if (coupon.discountType === 'PERCENTAGE') return `${coupon.discountValue}% off`;
  if (coupon.discountType === 'FREE_SHIPPING') return 'Free shipping';
  return `${formatRwf(coupon.discountValue)} off`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function CouponsManagement() {
  const { get, query, search, setSearch, setFilter, page, setPage, clearFilters, hasFilters } =
    useUrlFilters();
  const status = get('status') as CouponStatus | typeof ALL;

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await couponsApi.getAll({
        page,
        limit: ADMIN_PAGE_SIZE,
        search: query || undefined,
        status: status === ALL ? undefined : status,
      });
      setCoupons(result.coupons);
      setTotalCount(result.pagination.total);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, query, status]);

  const loadStats = useCallback(() => {
    couponsApi
      .getStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const renderRows = () => {
    if (loading) {
      return Array.from({ length: 6 }, (_, i) => (
        <tr key={i} className="border-b last:border-0">
          <td colSpan={6} className="p-4">
            <Skeleton className="h-9 w-full" />
          </td>
        </tr>
      ));
    }
    return coupons.map((coupon) => {
      const style = STATUS_STYLES[couponStatus(coupon)];
      const editHref = `/admin/coupons/${coupon.id}/edit`;
      return (
        <tr key={coupon.id} className="border-b transition-colors last:border-0 hover:bg-muted/40">
          <td className="p-4">
            <Link
              href={editHref}
              className="font-mono text-sm font-semibold tracking-wide text-accent-rose outline-none hover:underline focus-visible:underline"
            >
              {coupon.code}
            </Link>
            <p className="max-w-64 truncate text-xs text-muted-foreground">
              {coupon.description || 'No description'}
            </p>
          </td>
          <td className="p-4 text-sm">
            <p className="font-medium">{discountLabel(coupon)}</p>
            {coupon.maxDiscountAmount ? (
              <p className="text-xs text-muted-foreground">
                Up to {formatRwf(coupon.maxDiscountAmount)}
              </p>
            ) : null}
          </td>
          <td className="p-4 text-right text-sm tabular-nums">
            {coupon.minPurchaseAmount ? (
              formatRwf(coupon.minPurchaseAmount)
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </td>
          <td className="p-4 text-right text-sm tabular-nums">
            <span className="font-medium">{coupon.usedCount}</span>
            <span className="text-muted-foreground">
              {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ' uses'}
            </span>
          </td>
          <td className="p-4">
            <span
              className={cn(
                'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                style.className,
              )}
            >
              {style.label}
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              {coupon.validUntil ? `Ends ${formatDate(coupon.validUntil)}` : 'No end date'}
            </p>
          </td>
          <td className="p-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${coupon.code}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={editHref}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/coupons/new?duplicate=${coupon.id}`}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setToDelete(coupon)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          title="We couldn't load coupons"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && coupons.length === 0) {
      return (
        <EmptyState
          icon={Ticket}
          title={hasFilters ? 'No coupons match these filters' : 'No coupons yet'}
          description={
            hasFilters
              ? 'Try a different search or clear the filters.'
              : 'Create a coupon to run a promotion or reward loyal customers.'
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                <Link href="/admin/coupons/new">Create coupon</Link>
              </Button>
            )
          }
        />
      );
    }
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-208">
            <thead className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 text-right font-medium">Min. spend</th>
                <th className="p-4 text-right font-medium">Usage</th>
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

  const expired = stats?.expired ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Coupons" description="Create and manage discount codes">
        <Button asChild className="gap-2 bg-accent-rose hover:bg-accent-rose-dark">
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4" />
            Create coupon
          </Link>
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        <StatGrid columns={4} loading={statsLoading}>
          <StatCard
            title="Active coupons"
            value={(stats?.active ?? 0).toLocaleString()}
            icon={Tag}
            tone="green"
            hint={`${(stats?.total ?? 0).toLocaleString()} in total`}
            href="/admin/coupons?status=active"
          />
          <StatCard
            title="Expired"
            value={expired.toLocaleString()}
            icon={Ticket}
            tone={expired > 0 ? 'amber' : 'neutral'}
            href="/admin/coupons?status=expired"
          />
          <StatCard
            title="Times used"
            value={(stats?.totalUses ?? 0).toLocaleString()}
            icon={Percent}
            tone="blue"
          />
          <StatCard
            title="Customer savings"
            value={formatRwf(stats?.totalDiscountGiven ?? 0)}
            icon={Wallet}
            tone="violet"
            hint="Discounts given at checkout"
          />
        </StatGrid>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            className="flex-1"
            label="Search coupons"
            placeholder="Search by code or description"
            value={search}
            onValueChange={setSearch}
          />
          <Select value={status} onValueChange={(value) => setFilter('status', value)}>
            <SelectTrigger
              className="h-10 w-full bg-background sm:w-44"
              aria-label="Filter by status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All coupons</SelectItem>
              {STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_STYLES[value].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderTable()}

        {!loading && !loadFailed && (
          <TablePagination
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={totalCount}
            onPageChange={setPage}
            noun={['coupon', 'coupons']}
          />
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete coupon"
        description={
          toDelete ? (
            <>
              Delete <span className="font-mono font-medium text-foreground">{toDelete.code}</span>?
              This cannot be undone.
            </>
          ) : null
        }
        warning={
          toDelete && toDelete.usedCount > 0
            ? 'Coupons used on past orders can’t be deleted. Pause it instead by editing it.'
            : undefined
        }
        successMessage="Coupon deleted"
        errorMessage="Could not delete the coupon"
        onConfirm={async () => {
          if (!toDelete) return;
          await couponsApi.delete(toDelete.id);
        }}
        onSuccess={() => {
          setToDelete(null);
          load();
          loadStats();
        }}
      />
    </div>
  );
}

export default function CouponsManagementPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <CouponsManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
