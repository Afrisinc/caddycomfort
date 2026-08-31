import React, { useState } from 'react';
import Link from '@/components/common/Link';
import {
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  Printer,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      email: 'john@example.com',
      date: '2025-01-06',
      time: '14:30',
      total: 125000,
      status: 'completed',
      items: 3,
      payment: 'Card',
      shipping: 'Standard',
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      date: '2025-01-06',
      time: '13:15',
      total: 89500,
      status: 'processing',
      items: 2,
      payment: 'MoMo',
      shipping: 'Express',
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      email: 'mike@example.com',
      date: '2025-01-06',
      time: '11:45',
      total: 234000,
      status: 'pending',
      items: 5,
      payment: 'COD',
      shipping: 'Standard',
    },
    {
      id: 'ORD-004',
      customer: 'Sarah Wilson',
      email: 'sarah@example.com',
      date: '2025-01-06',
      time: '10:20',
      total: 156000,
      status: 'shipped',
      items: 4,
      payment: 'Card',
      shipping: 'Express',
    },
    {
      id: 'ORD-005',
      customer: 'David Brown',
      email: 'david@example.com',
      date: '2025-01-06',
      time: '09:00',
      total: 98000,
      status: 'cancelled',
      items: 2,
      payment: 'MoMo',
      shipping: 'Standard',
    },
    {
      id: 'ORD-006',
      customer: 'Emily Davis',
      email: 'emily@example.com',
      date: '2025-01-05',
      time: '16:30',
      total: 178000,
      status: 'completed',
      items: 3,
      payment: 'Card',
      shipping: 'Express',
    },
  ];

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: Truck },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
    };
    return configs[status] || configs.pending;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Order Management" description="View and manage all customer orders">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Orders
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-all ${statusFilter === 'all' ? 'ring-2 ring-accent-rose' : 'hover:shadow-md'}`}
            onClick={() => setStatusFilter('all')}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{statusCounts.all}</p>
              <p className="text-xs text-muted-foreground">All Orders</p>
            </CardContent>
          </Card>
          {['pending', 'processing', 'shipped', 'completed', 'cancelled'].map((status) => {
            const config = getStatusConfig(status);
            return (
              <Card
                key={status}
                className={`cursor-pointer transition-all ${statusFilter === status ? 'ring-2 ring-accent-rose' : 'hover:shadow-md'}`}
                onClick={() => setStatusFilter(status)}
              >
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">
                    {statusCounts[status as keyof typeof statusCounts]}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">{status}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Order ID</th>
                    <th className="text-left p-4 font-medium text-sm">Customer</th>
                    <th className="text-left p-4 font-medium text-sm">Date</th>
                    <th className="text-right p-4 font-medium text-sm">Amount</th>
                    <th className="text-center p-4 font-medium text-sm">Items</th>
                    <th className="text-center p-4 font-medium text-sm">Payment</th>
                    <th className="text-center p-4 font-medium text-sm">Status</th>
                    <th className="text-center p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <p className="font-semibold">{order.id}</p>
                          <p className="text-xs text-muted-foreground">{order.time}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{order.customer}</p>
                          <p className="text-xs text-muted-foreground">{order.email}</p>
                        </td>
                        <td className="p-4 text-sm">{order.date}</td>
                        <td className="p-4 text-right font-semibold">
                          Rwf {order.total.toLocaleString()}
                        </td>
                        <td className="p-4 text-center">{order.items}</td>
                        <td className="p-4 text-center">
                          <Badge variant="outline" className="text-xs">
                            {order.payment}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Printer className="h-4 w-4 mr-2" />
                                Print Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Update Status
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

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function OrdersManagementPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <OrdersManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
