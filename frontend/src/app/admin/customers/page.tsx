'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MoreVertical,
  Eye,
  Mail,
  Ban,
  UserCheck,
  Users as UsersIcon,
  TrendingUp,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { customersApi } from '@/lib/api';
import { Customer, CustomerStats, CustomerStatus } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';

const STATUS_BADGES: Record<CustomerStatus, { label: string; className: string }> = {
  vip: { label: 'VIP', className: 'bg-purple-100 text-purple-700' },
  active: { label: 'Active', className: 'bg-green-100 text-green-700' },
  inactive: { label: 'Inactive', className: 'bg-gray-100 text-gray-700' },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700' },
};

function formatMoney(amount: number): string {
  return `Rwf ${(amount / 1000).toFixed(0)}K`;
}

function CustomersManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await customersApi.getAll();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customers');
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await customersApi.getStats();
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customer statistics');
    }
  };

  const handleToggleStatus = async (customer: Customer) => {
    const nextActive = !customer.isActive;
    try {
      setTogglingId(customer.id);
      await customersApi.updateStatus(customer.id, nextActive);
      toast.success(nextActive ? `${customer.name} reactivated` : `${customer.name} suspended`);
      await Promise.all([fetchCustomers(), fetchStats()]);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update customer status');
    } finally {
      setTogglingId(null);
    }
  };

  const statCards = stats
    ? [
        { title: 'Total Customers', value: stats.totalCustomers.toLocaleString(), icon: UsersIcon },
        { title: 'Active', value: stats.activeCount.toLocaleString(), icon: UserCheck },
        { title: 'Avg Orders', value: stats.avgOrdersPerCustomer.toFixed(1), icon: ShoppingBag },
        { title: 'Avg Value', value: formatMoney(stats.avgOrderValue), icon: TrendingUp },
      ]
    : [];

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Customer Management" description="View and manage your customers" />

      <div className="px-4 sm:px-8 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                      <stat.icon className="h-6 w-6 text-accent-rose" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as CustomerStatus | 'all')}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold">Contact</th>
                        <th className="text-left py-3 px-4 font-semibold">Orders</th>
                        <th className="text-left py-3 px-4 font-semibold">Total Spent</th>
                        <th className="text-left py-3 px-4 font-semibold">Last Order</th>
                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => {
                        const badge = STATUS_BADGES[customer.status];
                        return (
                          <tr key={customer.id} className="border-b hover:bg-muted/50">
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Joined{' '}
                                  {new Date(customer.joinedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm">{customer.email}</p>
                                <p className="text-sm text-muted-foreground">{customer.phone || '—'}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{customer.ordersCount}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{formatMoney(customer.totalSpent)}</p>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm">{formatRelativeTime(customer.lastOrderAt)}</p>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={badge.className}>{badge.label}</Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" disabled={togglingId === customer.id}>
                                    {togglingId === customer.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <MoreVertical className="h-4 w-4" />
                                    )}
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/admin/customers/${customer.id}`)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a href={`mailto:${customer.email}`}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Send Email
                                    </a>
                                  </DropdownMenuItem>
                                  {customer.isActive ? (
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleToggleStatus(customer)}
                                    >
                                      <Ban className="h-4 w-4 mr-2" />
                                      Suspend Account
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(customer)}>
                                      <UserCheck className="h-4 w-4 mr-2" />
                                      Reactivate Account
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {filteredCustomers.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No customers found</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CustomersManagementPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <CustomersManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
