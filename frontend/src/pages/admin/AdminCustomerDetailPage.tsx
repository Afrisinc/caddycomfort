import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRouter } from '@/router/compat';
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CustomerStatusBadge } from '@/components/admin/CustomerStatusBadge';
import { TablePagination } from '@/components/admin/TablePagination';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmptyState } from '@/components/common/EmptyState';
import { InfoCardSkeleton } from '@/components/ui/info-card';
import { customersApi } from '@/lib/api';
import { CustomerDetail } from '@/types/api';
import { CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
import { ADMIN_PAGE_SIZE, pageCount, pageSlice } from '@/lib/pagination';
import { formatRwf } from '@/lib/pricing';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'sonner';
import { OrderStatusBadge } from '@/components/orders/StatusBadge';

const ORDER_COLUMNS = [
  { key: 'order', label: 'Order' },
  { key: 'date', label: 'Date' },
  { key: 'total', label: 'Total', align: 'right' },
  { key: 'status', label: 'Status' },
] as const;

function CustomerDetailView({ id }: { id: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);

  const fetchCustomer = useCallback(async () => {
    try {
      const data = await customersApi.getById(id);
      setCustomer(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load customer');
      router.push('/admin/customers');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

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

  if (isLoading && !customer) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader title="Customer" description="Loading customer details" />
        <div className="space-y-6 px-4 py-8 sm:px-8" role="status" aria-label="Loading customer">
          <div className="grid gap-6 lg:grid-cols-3">
            <InfoCardSkeleton lines={4} />
            <InfoCardSkeleton lines={1} />
            <InfoCardSkeleton lines={1} />
          </div>
          <InfoCardSkeleton lines={5} />
        </div>
      </div>
    );
  }

  if (!customer) return null;

  const currentOrdersPage = Math.min(
    ordersPage,
    pageCount(customer.orders.length, ADMIN_PAGE_SIZE),
  );
  const visibleOrders = pageSlice(customer.orders, currentOrdersPage, ADMIN_PAGE_SIZE);
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Customer
                <CustomerStatusBadge status={customer.status} />
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
                <p className="text-2xl font-bold mt-1">{formatRwf(customer.totalSpent)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-accent-rose" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order history</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.orders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No orders yet"
                description="Orders this customer places will appear here."
              />
            ) : (
              <>
                <DataTable
                  columns={ORDER_COLUMNS}
                  label="Order history"
                  minWidth="min-w-128"
                  bordered={false}
                >
                  {visibleOrders.map((order) => (
                    <DataRow key={order.id}>
                      <DataCell>
                        <CellTitle mono>{order.orderNumber}</CellTitle>
                      </DataCell>
                      <DataCell muted>
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </DataCell>
                      <DataCell align="right" numeric strong>
                        {formatRwf(order.total)}
                      </DataCell>
                      <DataCell>
                        <OrderStatusBadge status={order.status} />
                      </DataCell>
                    </DataRow>
                  ))}
                </DataTable>
                <TablePagination
                  page={currentOrdersPage}
                  pageSize={ADMIN_PAGE_SIZE}
                  total={customer.orders.length}
                  onPageChange={setOrdersPage}
                  noun={['order', 'orders']}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>() as { id: string };
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <CustomerDetailView id={id} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
