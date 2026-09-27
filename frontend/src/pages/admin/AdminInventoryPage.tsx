import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  History,
  MoreVertical,
  Package,
  PackageX,
  RefreshCw,
  SlidersHorizontal,
  Upload,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { CellMeta, CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
import { StatusPill, type StatusTone } from '@/components/ui/status-pill';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { TablePagination } from '@/components/admin/TablePagination';
import { ExportButton } from '@/components/admin/ExportButton';
import { AdjustStockDialog } from '@/components/admin/AdjustStockDialog';
import { StockHistoryDialog } from '@/components/admin/StockHistoryDialog';
import { ImportStockDialog } from '@/components/admin/ImportStockDialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ALL, useUrlFilters } from '@/hooks/useUrlFilters';
import { inventoryApi } from '@/lib/api';
import { downloadCsv } from '@/lib/csv';
import { ADMIN_PAGE_SIZE, pageCount, pageSlice } from '@/lib/pagination';
import { formatRwf, formatRwfCompact } from '@/lib/pricing';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { InventorySummary, InventoryValuationItem, RestockRecommendation } from '@/types/api';

type StockTier = 'out' | 'critical' | 'low' | 'good';

const TIERS: Record<StockTier, { label: string; tone: StatusTone }> = {
  good: { label: 'In stock', tone: 'green' },
  low: { label: 'Low stock', tone: 'amber' },
  critical: { label: 'Critical', tone: 'red' },
  out: { label: 'Out of stock', tone: 'neutral' },
};

const STOCK_FILTERS = [
  { value: ALL, label: 'All items' },
  { value: 'good', label: 'In stock' },
  { value: 'low', label: 'Low stock' },
  { value: 'out', label: 'Out of stock' },
];

const COLUMNS = [
  { key: 'product', label: 'Product' },
  { key: 'stock', label: 'Stock', align: 'right' },
  { key: 'restocked', label: 'Last restocked' },
  { key: 'value', label: 'Value', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', hideLabel: true },
] as const;

function stockTier(quantity: number): StockTier {
  if (quantity <= 0) return 'out';
  if (quantity <= 3) return 'critical';
  if (quantity <= 10) return 'low';
  return 'good';
}

function matchesStock(filter: string, tier: StockTier) {
  if (filter === 'low') return tier === 'low' || tier === 'critical';
  return filter === ALL || filter === tier;
}

function Inventory() {
  const { get, query, search, setSearch, setFilter, page, setPage, clearFilters, hasFilters } =
    useUrlFilters();
  const stockFilter = get('stock');
  const term = query.toLowerCase();

  const [items, setItems] = useState<InventoryValuationItem[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [recommendations, setRecommendations] = useState<RestockRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryValuationItem | null>(null);
  const [historyTarget, setHistoryTarget] = useState<InventoryValuationItem | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const [valuation, summaryData, recs] = await Promise.all([
        inventoryApi.getValuation(),
        inventoryApi.getSummary(),
        inventoryApi.getRestockRecommendations(),
      ]);
      setItems(valuation.items);
      setSummary(summaryData);
      setRecommendations(recs);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recommendationByProduct = useMemo(
    () => new Map(recommendations.map((r) => [r.productId, r])),
    [recommendations],
  );

  const filteredItems = items.filter(
    (item) =>
      (item.productName.toLowerCase().includes(term) || item.sku.toLowerCase().includes(term)) &&
      matchesStock(stockFilter, stockTier(item.quantity)),
  );
  const currentPage = Math.min(page, pageCount(filteredItems.length, ADMIN_PAGE_SIZE));
  const visibleItems = pageSlice(filteredItems, currentPage, ADMIN_PAGE_SIZE);

  const lowCount = summary?.lowStockCount ?? 0;
  const outCount = summary?.outOfStockCount ?? 0;

  const handleExport = () => {
    downloadCsv(`inventory-${new Date().toISOString().slice(0, 10)}.csv`, [
      [
        'SKU',
        'Product',
        'Category',
        'Stock',
        'Unit price (Rwf)',
        'Total value (Rwf)',
        'Status',
        'Last restocked',
      ],
      ...filteredItems.map((item) => [
        item.sku,
        item.productName,
        item.category,
        item.quantity,
        item.unitPrice,
        item.totalValue,
        TIERS[stockTier(item.quantity)].label,
        item.lastRestockedAt ? new Date(item.lastRestockedAt).toISOString().slice(0, 10) : 'Never',
      ]),
    ]);
    toast.success('Inventory exported');
  };

  const renderRows = () =>
    visibleItems.map((item) => {
      const tier = TIERS[stockTier(item.quantity)];
      const restock = recommendationByProduct.get(item.productId);
      const restockQty = restock?.recommendedRestockQuantity ?? 0;
      return (
        <DataRow key={item.productId}>
          <DataCell>
            <div className="flex items-center gap-2">
              <CellTitle>{item.productName}</CellTitle>
              {!item.isActive && <StatusPill>Draft</StatusPill>}
            </div>
            <CellMeta>
              <span className="font-mono">{item.sku}</span> · {item.category}
            </CellMeta>
          </DataCell>
          <DataCell align="right" numeric>
            <p className="font-semibold">{item.quantity}</p>
            {restockQty > 0 && (
              <p
                className={cn(
                  'text-xs',
                  restock?.priority === 'HIGH'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-amber-700 dark:text-amber-400',
                )}
              >
                Reorder {restockQty}
              </p>
            )}
          </DataCell>
          <DataCell muted>{formatRelativeTime(item.lastRestockedAt)}</DataCell>
          <DataCell align="right" numeric>
            <p className="font-medium">{formatRwf(item.totalValue)}</p>
            <CellMeta>{formatRwf(item.unitPrice)} each</CellMeta>
          </DataCell>
          <DataCell>
            <StatusPill tone={tier.tone}>{tier.label}</StatusPill>
          </DataCell>
          <DataCell align="right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${item.productName}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setAdjustTarget(item)}>
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Adjust stock
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setHistoryTarget(item)}>
                  <History className="mr-2 h-4 w-4" />
                  View history
                </DropdownMenuItem>
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
          title="We couldn't load inventory"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && filteredItems.length === 0) {
      return (
        <EmptyState
          icon={Boxes}
          title={hasFilters ? 'No items match these filters' : 'No products to track yet'}
          description={
            hasFilters
              ? 'Try a different search or clear the filters.'
              : 'Products you add will appear here with their stock levels.'
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
      <DataTable columns={COLUMNS} label="Inventory" loading={loading} minWidth="min-w-208">
        {renderRows()}
      </DataTable>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Inventory" description="Monitor and manage stock levels">
        <ExportButton onExport={handleExport} disabled={filteredItems.length === 0} />
        <Button
          className="gap-2 bg-accent-rose hover:bg-accent-rose-dark"
          onClick={() => setImportOpen(true)}
        >
          <Upload className="h-4 w-4" />
          Import stock
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        <StatGrid columns={4} loading={loading}>
          <StatCard
            title="Products"
            value={(summary?.totalProducts ?? 0).toLocaleString()}
            icon={Package}
            tone="blue"
            hint={`${(summary?.totalStockQuantity ?? 0).toLocaleString()} units`}
          />
          <StatCard
            title="Low stock"
            value={lowCount.toLocaleString()}
            icon={AlertTriangle}
            tone={lowCount > 0 ? 'amber' : 'neutral'}
            hint={lowCount > 0 ? 'Restock soon' : 'Stock levels healthy'}
            href="/admin/inventory?stock=low"
          />
          <StatCard
            title="Out of stock"
            value={outCount.toLocaleString()}
            icon={PackageX}
            tone={outCount > 0 ? 'red' : 'neutral'}
            hint={outCount > 0 ? 'Unavailable to customers' : 'Everything in stock'}
            href="/admin/inventory?stock=out"
          />
          <StatCard
            title="Stock value"
            value={formatRwfCompact(summary?.totalInventoryValue ?? 0)}
            icon={Wallet}
            tone="green"
            hint="At current prices"
          />
        </StatGrid>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            className="flex-1"
            label="Search inventory"
            placeholder="Search by product name or SKU"
            value={search}
            onValueChange={setSearch}
          />
          <Select value={stockFilter} onValueChange={(value) => setFilter('stock', value)}>
            <SelectTrigger
              className="h-10 w-full bg-background sm:w-44"
              aria-label="Filter by stock level"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderTable()}

        {!loading && !loadFailed && (
          <TablePagination
            page={currentPage}
            pageSize={ADMIN_PAGE_SIZE}
            total={filteredItems.length}
            onPageChange={setPage}
            noun={['item', 'items']}
          />
        )}
      </div>

      {adjustTarget && (
        <AdjustStockDialog
          open={!!adjustTarget}
          onOpenChange={(open) => !open && setAdjustTarget(null)}
          productId={adjustTarget.productId}
          productName={adjustTarget.productName}
          currentStock={adjustTarget.quantity}
          onSuccess={load}
        />
      )}

      {historyTarget && (
        <StockHistoryDialog
          open={!!historyTarget}
          onOpenChange={(open) => !open && setHistoryTarget(null)}
          productId={historyTarget.productId}
          productName={historyTarget.productName}
        />
      )}

      <ImportStockDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        items={items}
        onSuccess={load}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <Inventory />
      </AdminLayout>
    </ProtectedRoute>
  );
}
