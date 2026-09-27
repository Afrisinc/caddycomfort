import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  ExternalLink,
  MoreVertical,
  Package,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from '@/components/common/Link';
import { ImageThumbnail } from '@/components/common/ImageThumbnail';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { CellMeta, CellTitle, DataCell, DataRow, DataTable } from '@/components/ui/data-table';
import { StatusPill } from '@/components/ui/status-pill';
import { SearchInput } from '@/components/ui/search-input';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard, StatGrid } from '@/components/admin/StatCard';
import { TablePagination } from '@/components/admin/TablePagination';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { ALL, useUrlFilters } from '@/hooks/useUrlFilters';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi, productsApi } from '@/lib/api';
import { categoryOptions } from '@/lib/productForm';
import { ADMIN_PAGE_SIZE } from '@/lib/pagination';
import { getProductPricing } from '@/lib/pricing';
import { cn } from '@/lib/utils';
import type { Category, Product, ProductFilters } from '@/types/api';

const LOW_STOCK = 10;
const COLUMNS = [
  { key: 'product', label: 'Product' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', hideLabel: true },
] as const;
const NO_CATEGORIES: Category[] = [];

type Stats = Awaited<ReturnType<typeof productsApi.getStats>>;

function stockTone(quantity: number) {
  if (quantity <= 0) return 'text-red-600 dark:text-red-400';
  if (quantity <= LOW_STOCK) return 'text-amber-700 dark:text-amber-400';
  return 'text-foreground';
}

function ProductsManagement() {
  const { get, query, search, setSearch, setFilter, page, setPage, clearFilters, hasFilters } =
    useUrlFilters();
  const category = get('category');
  const status = get('status');
  const stock = get('stock');

  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    const filters: ProductFilters = {
      search: query || undefined,
      categoryId: category === ALL ? undefined : category,
      isActive: status === ALL ? undefined : status === 'active',
      stock: stock === 'low' || stock === 'out' ? stock : undefined,
    };
    try {
      const result = await productsApi.getAll(filters, { page, limit: ADMIN_PAGE_SIZE });
      setProducts(result.products);
      setTotalCount(result.pagination.total);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, [query, category, status, stock, page]);

  const loadStats = useCallback(() => {
    productsApi
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

  const options = useMemo(() => categoryOptions(categories.data), [categories.data]);

  const toggleVisibility = async (product: Product) => {
    try {
      await productsApi.update(product.id, { isActive: !product.isActive });
      toast.success(
        product.isActive
          ? `${product.name} hidden from the shop`
          : `${product.name} is now visible`,
      );
      load();
      loadStats();
    } catch (error: any) {
      toast.error(error.message || 'Could not update the product');
    }
  };

  const orderCount = toDelete?._count?.orderItems ?? 0;
  const deleteBlocker =
    orderCount > 0
      ? `This product appears in ${orderCount} order${orderCount === 1 ? '' : 's'}, so it can't be deleted. Hide it from the shop instead.`
      : null;

  const renderRows = () =>
    products.map((product) => {
      const href = `/admin/products/${product.slug || product.id}`;
      const images = product.images?.length ? product.images : [product.imageUrl];
      return (
        <DataRow key={product.id}>
          <DataCell>
            <div className="flex items-center gap-3">
              <ImageThumbnail images={images} alt={product.name} fallbackIcon={Package} />
              <div className="min-w-0">
                <CellTitle href={href}>{product.name}</CellTitle>
                <CellMeta mono>{product.sku}</CellMeta>
              </div>
            </div>
          </DataCell>
          <DataCell>{product.category?.name ?? '—'}</DataCell>
          <DataCell>
            <PriceDisplay pricing={getProductPricing(product)} size="sm" className="gap-x-2" />
          </DataCell>
          <DataCell
            align="right"
            numeric
            className={cn('font-medium', stockTone(product.stockQuantity))}
          >
            {product.stockQuantity}
          </DataCell>
          <DataCell>
            <div className="flex flex-wrap gap-1.5">
              <StatusPill tone={product.isActive ? 'green' : 'neutral'}>
                {product.isActive ? 'Active' : 'Draft'}
              </StatusPill>
              {product.isFeatured && <StatusPill tone="rose">Featured</StatusPill>}
            </div>
          </DataCell>
          <DataCell align="right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Actions for ${product.name}`}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`${href}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={href}>
                    <Eye className="mr-2 h-4 w-4" />
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/shop/${product.id}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View in shop
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => toggleVisibility(product)}>
                  {product.isActive ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {product.isActive ? 'Hide from shop' : 'Show in shop'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => setToDelete(product)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
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
          title="We couldn't load products"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && products.length === 0) {
      return (
        <EmptyState
          icon={Package}
          title={hasFilters ? 'No products match these filters' : 'No products yet'}
          description={
            hasFilters
              ? 'Try a different search or clear the filters.'
              : 'Add your first product to start selling.'
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                <Link href="/admin/products/new">Add product</Link>
              </Button>
            )
          }
        />
      );
    }
    return (
      <DataTable columns={COLUMNS} label="Products" loading={loading} minWidth="min-w-208">
        {renderRows()}
      </DataTable>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Products" description="Manage your catalog, prices and stock">
        <Button asChild className="gap-2 bg-accent-rose hover:bg-accent-rose-dark">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            Add product
          </Link>
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        <StatGrid columns={4} loading={statsLoading}>
          <StatCard
            title="Total products"
            value={stats?.total ?? 0}
            icon={Package}
            tone="blue"
            href="/admin/products"
          />
          <StatCard
            title="Active"
            value={stats?.active ?? 0}
            icon={PackageCheck}
            tone="green"
            hint={`${stats?.inactive ?? 0} drafts`}
            href="/admin/products?status=active"
          />
          <StatCard
            title="Low stock"
            value={stats?.lowStock ?? 0}
            icon={AlertTriangle}
            tone={(stats?.lowStock ?? 0) > 0 ? 'amber' : 'neutral'}
            hint={`${LOW_STOCK} or fewer left`}
            href="/admin/products?stock=low"
          />
          <StatCard
            title="Out of stock"
            value={stats?.outOfStock ?? 0}
            icon={PackageX}
            tone={(stats?.outOfStock ?? 0) > 0 ? 'red' : 'neutral'}
            hint="Customers can't buy these"
            href="/admin/products?stock=out"
          />
        </StatGrid>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            className="flex-1"
            label="Search products"
            placeholder="Search by name or SKU"
            value={search}
            onValueChange={setSearch}
          />
          <div className="flex flex-wrap gap-3">
            <Select value={category} onValueChange={(value) => setFilter('category', value)}>
              <SelectTrigger
                className="h-10 w-full bg-background sm:w-52"
                aria-label="Filter by category"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(value) => setFilter('status', value)}>
              <SelectTrigger
                className="h-10 w-full bg-background sm:w-36"
                aria-label="Filter by status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stock} onValueChange={(value) => setFilter('stock', value)}>
              <SelectTrigger
                className="h-10 w-full bg-background sm:w-40"
                aria-label="Filter by stock"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All stock levels</SelectItem>
                <SelectItem value="low">Low stock</SelectItem>
                <SelectItem value="out">Out of stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {renderTable()}

        {!loading && !loadFailed && (
          <TablePagination
            page={page}
            pageSize={ADMIN_PAGE_SIZE}
            total={totalCount}
            onPageChange={setPage}
            noun={['product', 'products']}
          />
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete product"
        description={
          toDelete ? (
            <>
              Delete <span className="font-medium text-foreground">{toDelete.name}</span>? This
              cannot be undone.
            </>
          ) : null
        }
        warning={deleteBlocker ?? undefined}
        blocked={!!deleteBlocker}
        onConfirm={async () => {
          if (toDelete) await productsApi.delete(toDelete.id);
        }}
        onSuccess={() => {
          setToDelete(null);
          load();
          loadStats();
        }}
        successMessage="Product deleted"
      />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <ProductsManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
