'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { dashboardApi } from '@/lib/api';
import { DashboardStats, DashboardRecentOrder, DashboardLowStockProduct, OrderStatus } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-red-100 text-red-800',
};

function formatMoney(amount: number): string {
  return `Rwf ${amount.toLocaleString()}`;
}

function customerName(user: DashboardRecentOrder['user']): string {
  return user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
}

function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<DashboardRecentOrder[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<DashboardLowStockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [statsData, orders, lowStock] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentOrders(5),
          dashboardApi.getLowStockAlert(10),
        ]);
        setStats(statsData);
        setRecentOrders(orders);
        setLowStockProducts(lowStock);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load dashboard');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const statCards = stats
    ? [
        { title: 'Total Revenue', value: formatMoney(stats.revenue.total), icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: 'Total Orders', value: stats.orders.total.toLocaleString(), icon: ShoppingBag, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { title: 'Total Customers', value: stats.users.total.toLocaleString(), icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { title: 'Pending Orders', value: stats.orders.pending.toLocaleString(), icon: Clock, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <AdminHeader title="Dashboard" description="Welcome back! Here's what's happening today.">
        <Link href="/admin/products/new">
          <Button className="bg-accent-rose hover:bg-accent-rose-dark">
            <Package className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </Link>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 4 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                    <Skeleton className="h-7 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title}>
                    <CardContent className="p-6">
                      <div className={`p-3 rounded-lg w-fit ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest customer orders</CardDescription>
                </div>
                <Link href="/admin/orders">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="space-y-2 text-right">
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-5 w-24 ml-auto rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No orders yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-accent-rose/10 flex items-center justify-center">
                          <ShoppingBag className="h-5 w-5 text-accent-rose" />
                        </div>
                        <div>
                          <p className="font-medium">{order.orderNumber}</p>
                          <p className="text-sm text-muted-foreground">{customerName(order.user)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatMoney(order.total)}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${ORDER_STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(order.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <CardTitle>Low Stock Alert</CardTitle>
              </div>
              <CardDescription>Products running low</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="p-3 border rounded-lg space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products are running low.
                    </p>
                  ) : (
                    lowStockProducts.map((product) => (
                      <div key={product.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm">{product.name}</p>
                          <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                            {product.stockQuantity} left
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                    ))
                  )}
                  <Link href="/admin/inventory">
                    <Button variant="outline" className="w-full" size="sm">
                      Manage Inventory
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/admin/products">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Manage Products</p>
                      <p className="text-sm text-muted-foreground">Add, edit, or remove products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/orders">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">View Orders</p>
                      <p className="text-sm text-muted-foreground">Process and track orders</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/customers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-50">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Customer Analytics</p>
                      <p className="text-sm text-muted-foreground">View customer insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
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
