import { useEffect, useState } from 'react';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from '@/components/common/Link';
import { useAuthStore } from '@/store/useAuthStore';
import { usersApi, ordersApi } from '@/lib/api';
import { Order, OrderStatus } from '@/types/api';
import { toast } from 'sonner';
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  wishlistItems: number;
  savedAddresses: number;
  totalSpent: number;
}

const ORDER_STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
  PROCESSING: { label: 'Processing', className: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-gray-100 text-gray-800' },
  REFUNDED: { label: 'Refunded', className: 'bg-red-100 text-red-800' },
};

function formatMoney(amount: number): string {
  return `Rwf ${amount.toLocaleString()}`;
}

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    (async () => {
      try {
        setIsLoading(true);
        const [userStats, orders] = await Promise.all([
          usersApi.getStats(),
          ordersApi.getAll({ limit: 3 }),
        ]);
        setStats({
          totalOrders: userStats.orders.total,
          wishlistItems: userStats.wishlistCount,
          savedAddresses: userStats.addressCount,
          totalSpent: userStats.totalSpent,
        });
        setRecentOrders(orders.orders);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load account overview');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const statCards = stats
    ? [
        { label: 'Total Orders', value: stats.totalOrders.toString(), icon: Package },
        { label: 'Wishlist Items', value: stats.wishlistItems.toString(), icon: Heart },
        { label: 'Saved Addresses', value: stats.savedAddresses.toString(), icon: MapPin },
        { label: 'Total Spent', value: formatMoney(stats.totalSpent), icon: TrendingUp },
      ]
    : [];

  const quickLinks = [
    {
      href: '/account/orders',
      icon: Package,
      title: 'Orders',
      description: 'Track and manage your orders',
    },
    {
      href: '/account/profile',
      icon: User,
      title: 'Profile',
      description: 'Update your personal information',
    },
    {
      href: '/account/wishlist',
      icon: Heart,
      title: 'Wishlist',
      description: 'View your saved items',
    },
    {
      href: '/account/addresses',
      icon: MapPin,
      title: 'Addresses',
      description: 'Manage shipping addresses',
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-serif mb-2">Welcome back, {user.firstName}!</h1>
            <p className="text-muted-foreground">Manage your account and track your orders</p>
          </div>

          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-card border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-7 w-16" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-5 w-5 text-accent-rose" />
                      <span className="text-2xl font-bold">{stat.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-serif mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="bg-card border rounded-lg p-6 hover:border-accent-rose transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-accent-rose-subtle flex items-center justify-center group-hover:bg-accent-rose-muted transition-colors">
                            <Icon className="h-6 w-6 text-accent-rose" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold mb-1">{link.title}</h3>
                            <p className="text-sm text-muted-foreground">{link.description}</p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-serif">Recent Orders</h2>
                  <Link href="/account/orders">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }, (_, i) => (
                      <div key={i} className="bg-card border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-36" />
                          </div>
                          <div className="space-y-2 text-right">
                            <Skeleton className="h-4 w-20 ml-auto" />
                            <Skeleton className="h-5 w-16 ml-auto rounded-full" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-full" />
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length === 0 ? (
                  <div className="bg-card border rounded-lg p-8 text-center text-sm text-muted-foreground">
                    You haven&apos;t placed any orders yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => {
                      const badge = ORDER_STATUS_BADGES[order.status];
                      return (
                        <div key={order.id} className="bg-card border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <p className="font-semibold">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()} •{' '}
                                {order.items.length} item
                                {order.items.length === 1 ? '' : 's'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatMoney(order.total)}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${badge.className}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                          <Link href={`/account/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Account Info Sidebar */}
            <div className="space-y-6">
              <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-accent-rose-subtle flex items-center justify-center">
                    <User className="h-8 w-8 text-accent-rose" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="gap-4 flex flex-col">
                  <Link href="/account/profile">
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button className="w-full justify-start bg-accent-rose hover:bg-accent-rose-dark">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:text-white hover:bg-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>

              {/* Support */}
              <div className="bg-card border rounded-lg p-6">
                <h3 className="text-base font-semibold mb-4">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our customer service team is here to assist you.
                </p>
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="w-full">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
