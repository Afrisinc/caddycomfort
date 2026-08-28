'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Wallet,
  Ban,
  UserCheck,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { customersApi } from '@/lib/api';
import { CustomerDetail, CustomerStatus, OrderStatus } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_BADGES: Record<CustomerStatus, { label: string; className: string }> = {
  vip: { label: 'VIP', className: 'bg-purple-100 text-purple-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700' },
};

const ORDER_STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700' },
  SHIPPED: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-700' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-700' },
  REFUNDED: { label: 'Refunded', className: 'bg-red-100 text-red-700' },
};

function formatMoney(amount: number): string {
  return `Rwf ${amount.toLocaleString()}`;
}

function CustomerDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      setIsLoading(true);
      const data = await customersApi.getById(id);
      setCustomer(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customer');
      router.push('/admin/customers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!customer) return;
    const nextActive = !customer.isActive;
    try {
      setIsToggling(true);
      await customersApi.updateStatus(customer.id, nextActive);
      toast.success(nextActive ? 'Customer reactivated' : 'Customer suspended');
      await fetchCustomer();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update customer status');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
      </div>
    );
  }

  if (!customer) return null;

  const badge = STATUS_BADGES[customer.status];
  const defaultAddress = customer.addresses.find((a) => a.isDefault) || customer.addresses[0];

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title={customer.name} description={customer.email}>
        <Button variant="outline" onClick={() => router.push('/admin/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          variant={customer.isActive ? 'destructive' : 'default'}
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={customer.isActive ? '' : 'bg-accent-rose hover:bg-accent-rose-dark'}
        >
          {isToggling ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : customer.isActive ? (
            <Ban className="h-4 w-4 mr-2" />
          ) : (
            <UserCheck className="h-4 w-4 mr-2" />
          )}
          {customer.isActive ? 'Suspend Account' : 'Reactivate Account'}
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8 space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Customer
                <Badge className={badge.className}>{badge.label}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span className="text-foreground">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-foreground">{customer.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-foreground">
                  Joined{' '}
                  {new Date(customer.joinedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
              {defaultAddress && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-foreground">
                    {defaultAddress.addressLine1}, {defaultAddress.city}, {defaultAddress.state},{' '}
                    {defaultAddress.country}
                  </span>
                </div>
              )}
              {!customer.isVerified && (
                <p className="text-xs text-amber-600 mt-2">Email not verified</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold mt-1">{customer.ordersCount}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Last order {formatRelativeTime(customer.lastOrderAt)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-accent-rose" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-2xl font-bold mt-1">{formatMoney(customer.totalSpent)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-accent-rose" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle>Order History ({customer.orders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Order</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Total</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((order) => {
                      const orderBadge = ORDER_STATUS_BADGES[order.status];
                      return (
                        <tr key={order.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <code className="text-sm bg-muted px-2 py-1 rounded">{order.orderNumber}</code>
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 font-medium">{formatMoney(order.total)}</td>
                          <td className="py-3 px-4">
                            <Badge className={orderBadge.className}>{orderBadge.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <CustomerDetailView id={id} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
