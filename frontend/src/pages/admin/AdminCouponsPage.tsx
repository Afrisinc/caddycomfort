import React, { useState, useEffect } from 'react';
import Link from '@/components/common/Link';
import { useRouter } from '@/router/compat';
import { Plus, MoreVertical, Edit, Trash2, Copy, Tag, Percent, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard, StatGrid, type StatCardProps } from '@/components/admin/StatCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { couponsApi } from '@/lib/api';
import { Coupon, CouponStats } from '@/types/api';
import { toast } from 'sonner';
import { SearchInput } from '@/components/ui/search-input';

type CouponUiStatus = 'active' | 'expired' | 'inactive';

function getCouponStatus(coupon: Coupon): CouponUiStatus {
  if (!coupon.isActive) return 'inactive';
  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) return 'expired';
  return 'active';
}

const STATUS_BADGES: Record<CouponUiStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-700' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
};

const TYPE_LABELS: Record<Coupon['discountType'], string> = {
  PERCENTAGE: 'Percentage',
  FIXED_AMOUNT: 'Fixed Amount',
  FREE_SHIPPING: 'Free Shipping',
};

function formatMoney(amount: number): string {
  return `Rwf ${(amount / 1000).toFixed(0)}K`;
}

function CouponsManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [stats, setStats] = useState<CouponStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [couponsData, statsData] = await Promise.all([
        couponsApi.getAll(),
        couponsApi.getStats(),
      ]);
      setCoupons(couponsData);
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  };

  const totalUses = coupons.reduce((sum, c) => sum + c.usedCount, 0);

  const statCards: StatCardProps[] = stats
    ? [
        { title: 'Active Coupons', value: stats.active.toLocaleString(), icon: Tag },
        { title: 'Total Uses', value: totalUses.toLocaleString(), icon: Percent, tone: 'blue' },
        {
          title: 'Total Savings',
          value: formatMoney(stats.totalDiscountGiven),
          icon: Calendar,
          tone: 'green',
          hint: 'Discounts given to customers',
        },
      ]
    : [];

  const filteredCoupons = coupons.filter(
    (coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (coupon.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Coupon Management" description="Create and manage discount coupons">
        <Link href="/admin/coupons/new">
          <Button className="bg-accent-rose hover:bg-accent-rose-dark">
            <Plus className="h-4 w-4 mr-2" />
            Create Coupon
          </Button>
        </Link>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        <StatGrid columns={3} loading={isLoading}>
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </StatGrid>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <SearchInput
              label="Search coupons"
              placeholder="Search coupons..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
          </CardContent>
        </Card>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Coupons ({filteredCoupons.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Code</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Discount</th>
                    <th className="text-left py-3 px-4 font-semibold">Min Purchase</th>
                    <th className="text-left py-3 px-4 font-semibold">Usage</th>
                    <th className="text-left py-3 px-4 font-semibold">Valid Until</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-right py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }, (_, i) => (
                        <tr key={i} className="border-b">
                          {Array.from({ length: 8 }, (_, j) => (
                            <td key={j} className="py-4 px-4">
                              <Skeleton className="h-4 w-full max-w-24" />
                            </td>
                          ))}
                        </tr>
                      ))
                    : filteredCoupons.map((coupon) => {
                        const status = getCouponStatus(coupon);
                        const badge = STATUS_BADGES[status];
                        return (
                          <tr key={coupon.id} className="border-b hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-mono font-bold text-accent-rose">
                                  {coupon.code}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {coupon.description || '—'}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">{TYPE_LABELS[coupon.discountType]}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">
                                {coupon.discountType === 'PERCENTAGE'
                                  ? `${coupon.discountValue}%`
                                  : coupon.discountType === 'FREE_SHIPPING'
                                    ? 'Free'
                                    : `Rwf ${coupon.discountValue.toLocaleString()}`}
                              </p>
                              {coupon.maxDiscountAmount && (
                                <p className="text-sm text-muted-foreground">
                                  Max: {formatMoney(coupon.maxDiscountAmount)}
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">
                                {coupon.minPurchaseAmount
                                  ? formatMoney(coupon.minPurchaseAmount)
                                  : '—'}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">
                                {coupon.usedCount}
                                {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">
                                {coupon.validUntil
                                  ? new Date(coupon.validUntil).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'No expiry'}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={badge.className}>{badge.label}</Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/admin/coupons/${coupon.id}/edit`)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/admin/coupons/new?duplicate=${coupon.id}`)
                                    }
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => setDeleteTarget(coupon)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>

            {!isLoading && filteredCoupons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No coupons found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Coupon"
        description={
          <>
            Are you sure you want to delete &quot;{deleteTarget?.code}&quot;? This action cannot be
            undone.
          </>
        }
        warning={
          deleteTarget && deleteTarget.usedCount > 0
            ? `This coupon has been used ${deleteTarget.usedCount} time${deleteTarget.usedCount === 1 ? '' : 's'} — deletion will be blocked if it's attached to existing orders.`
            : undefined
        }
        successMessage="Coupon deleted"
        errorMessage="Failed to delete coupon"
        onConfirm={async () => {
          if (!deleteTarget) return;
          await couponsApi.delete(deleteTarget.id);
        }}
        onSuccess={fetchAll}
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
