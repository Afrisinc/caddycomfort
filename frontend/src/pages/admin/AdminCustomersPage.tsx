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
import { CellMeta, CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
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

const COLUMNS = [
  { key: 'customer', label: 'Customer' },
  { key: 'phone', label: 'Phone' },
  { key: 'orders', label: 'Orders', align: 'right' },
  { key: 'spent', label: 'Total spent', align: 'right' },
  { key: 'login', label: 'Last login' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', hideLabel: true },
] as const;

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

  const renderRows = () =>
    customers.map((customer) => {
      const busy = togglingId === customer.id;
      return (
        <DataRow key={customer.id}>
          <DataCell>
            <CellTitle href={`/admin/customers/${customer.id}`} className="max-w-56">
              {customer.name}
            </CellTitle>
            <CellMeta className="max-w-56">{customer.email}</CellMeta>
          </DataCell>
          <DataCell muted>{customer.phone || '—'}</DataCell>
          <DataCell align="right" numeric>
            <CellTitle>{customer.ordersCount}</CellTitle>
            <CellMeta>
              {customer.lastOrderAt ? formatRelativeTime(customer.lastOrderAt) : 'Never'}
            </CellMeta>
          </DataCell>
          <DataCell align="right" numeric strong>
            {formatRwf(customer.totalSpent)}
          </DataCell>
          <DataCell>
            {customer.lastLoginAt ? (
              <>
                <CellTitle className="font-normal">
                  {formatRelativeTime(customer.lastLoginAt)}
                </CellTitle>
                <CellMeta>
                  {new Date(customer.lastLoginAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </CellMeta>
              </>
            ) : (
              <span className="text-muted-foreground">Never</span>
            )}
          </DataCell>
          <DataCell>
            <CustomerStatusBadge status={customer.status} />
          </DataCell>
          <DataCell align="right">
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
          </DataCell>
        </DataRow>
      );
    });

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
      <DataTable columns={COLUMNS} label="Customers" loading={loading} minWidth="min-w-240">
        {renderRows()}
      </DataTable>
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
