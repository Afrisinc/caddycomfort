import { useCallback, useEffect, useState } from 'react';
import {
  Ban,
  Eye,
  Loader2,
  Mail,
  MoreVertical,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from '@/components/common/Link';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/ui/search-input';
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
import { CustomerStatusBadge } from '@/components/admin/CustomerStatusBadge';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ALL, useUrlFilters } from '@/hooks/useUrlFilters';
import { customersApi } from '@/lib/api';
import { CUSTOMER_STATUSES, CUSTOMER_STATUS_STYLES } from '@/lib/customerStatus';
import { ADMIN_PAGE_SIZE } from '@/lib/pagination';
import { formatRwf } from '@/lib/pricing';
import { formatRelativeTime } from '@/lib/utils';
import type { Customer, CustomerStats, CustomerStatus } from '@/types/api';

function CustomersManagement() {
  const { get, query, search, setSearch, setFilter, page, setPage, clearFilters, hasFilters } =
    useUrlFilters();
  const status = get('status') as CustomerStatus | typeof ALL;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const result = await customersApi.getAll({
        page,
        limit: ADMIN_PAGE_SIZE,
        search: query || undefined,
        status,
      });
      setCustomers(result.customers);
      setTotalCount(result.pagination.total);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [page, query, status]);

  const loadStats = useCallback(() => {
    customersApi
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

  const toggleStatus = async (customer: Customer) => {
    const nextActive = !customer.isActive;
    setTogglingId(customer.id);
    try {
      await customersApi.updateStatus(customer.id, nextActive);
      toast.success(nextActive ? `${customer.name} reactivated` : `${customer.name} suspended`);
      load();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Could not update the customer');
    } finally {
      setTogglingId(null);
    }
  };

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
    return customers.map((customer) => {
      const busy = togglingId === customer.id;
      return (
        <tr
          key={customer.id}
          className="border-b transition-colors last:border-0 hover:bg-muted/40"
        >
          <td className="p-4">
            <Link
              href={`/admin/customers/${customer.id}`}
              className="block max-w-56 truncate font-medium outline-none hover:text-accent-rose focus-visible:underline"
            >
              {customer.name}
            </Link>
            <p className="max-w-56 truncate text-xs text-muted-foreground">{customer.email}</p>
          </td>
          <td className="p-4 text-sm text-muted-foreground">{customer.phone || '—'}</td>
          <td className="p-4 text-right text-sm tabular-nums">
            <p className="font-medium">{customer.ordersCount}</p>
            <p className="text-xs text-muted-foreground">
              {customer.lastOrderAt ? formatRelativeTime(customer.lastOrderAt) : 'Never'}
            </p>
          </td>
          <td className="p-4 text-right text-sm font-semibold tabular-nums">
            {formatRwf(customer.totalSpent)}
          </td>
          <td className="p-4">
            <CustomerStatusBadge status={customer.status} />
          </td>
          <td className="p-4 text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  aria-label={`Actions for ${customer.name}`}
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/admin/customers/${customer.id}`}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`mailto:${customer.email}`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Send email
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {customer.isActive ? (
                  <DropdownMenuItem
                    onSelect={() => toggleStatus(customer)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Suspend account
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => toggleStatus(customer)}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Reactivate account
                  </DropdownMenuItem>
                )}
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
          title="We couldn't load customers"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && customers.length === 0) {
      return (
        <EmptyState
          icon={Users}
          title={hasFilters ? 'No customers match these filters' : 'No customers yet'}
          description={
            hasFilters
              ? 'Try a different search or clear the filters.'
              : 'Customers appear here once they create an account.'
          }
          action={
            hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
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
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Phone</th>
                <th className="p-4 text-right font-medium">Orders</th>
                <th className="p-4 text-right font-medium">Total spent</th>
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

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Customers" description="See who shops with you and manage their accounts">
        <Button
          variant="outline"
          onClick={() => {
            load();
            loadStats();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        <StatGrid columns={4} loading={statsLoading}>
          <StatCard
            title="Total customers"
            value={(stats?.totalCustomers ?? 0).toLocaleString()}
            icon={Users}
            tone="blue"
          />
          <StatCard
            title="Active"
            value={(stats?.activeCount ?? 0).toLocaleString()}
            icon={UserCheck}
            tone="green"
            hint="Placed at least one order"
            href="/admin/customers?status=active"
          />
          <StatCard
            title="Avg orders"
            value={(stats?.avgOrdersPerCustomer ?? 0).toFixed(1)}
            icon={ShoppingBag}
            tone="violet"
            hint="Per customer"
          />
          <StatCard
            title="Avg order value"
            value={formatRwf(stats?.avgOrderValue ?? 0)}
            icon={TrendingUp}
            tone="amber"
          />
        </StatGrid>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            className="flex-1"
            label="Search customers"
            placeholder="Search by name or email"
            value={search}
            onValueChange={setSearch}
          />
          <Select value={status} onValueChange={(value) => setFilter('status', value)}>
            <SelectTrigger
              className="h-10 w-full bg-background sm:w-48"
              aria-label="Filter by status"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All customers</SelectItem>
              {CUSTOMER_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {CUSTOMER_STATUS_STYLES[value].label}
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
            noun={['customer', 'customers']}
          />
        )}
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
