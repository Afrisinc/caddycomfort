import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CornerDownRight,
  ExternalLink,
  FolderTree,
  Layers,
  MoreVertical,
  Package,
  PackageX,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import Link from '@/components/common/Link';
import { ImageThumbnail } from '@/components/common/ImageThumbnail';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchInput } from '@/components/ui/search-input';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
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
import { EmptyState } from '@/components/common/EmptyState';
import { categoriesApi } from '@/lib/api';
import { categoryRows, groupRowsByRoot } from '@/lib/categoryForm';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { ADMIN_PAGE_SIZE, pageCount, pageSlice } from '@/lib/pagination';
import type { Category } from '@/types/api';

function deleteBlocker(category: Category, childCount: number): string | null {
  const products = category._count?.products ?? 0;
  if (childCount > 0)
    return `Move or delete its ${childCount} subcategor${childCount === 1 ? 'y' : 'ies'} first.`;
  if (products > 0)
    return `Move its ${products} product${products === 1 ? '' : 's'} to another category first.`;
  return null;
}

function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const { query, search, setSearch, page, setPage, clearFilters } = useUrlFilters();
  const [toDelete, setToDelete] = useState<Category | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      setCategories(await categoriesApi.getAll());
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(
    () => groupRowsByRoot(categoryRows(categories, query)),
    [categories, query],
  );
  const currentPage = Math.min(page, pageCount(groups.length, ADMIN_PAGE_SIZE));
  const rows = pageSlice(groups, currentPage, ADMIN_PAGE_SIZE).flat();
  const topLevel = categories.filter((c) => !c.parentId).length;
  const empty = categories.filter((c) => (c._count?.products ?? 0) === 0).length;
  const toDeleteChildren = toDelete
    ? categories.filter((c) => c.parentId === toDelete.id).length
    : 0;
  const toDeleteBlocker = toDelete ? deleteBlocker(toDelete, toDeleteChildren) : null;

  const renderTable = () => {
    if (loadFailed) {
      return (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load categories"
          description="Check your connection and try again."
          action={
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          }
        />
      );
    }
    if (!loading && rows.length === 0) {
      return (
        <EmptyState
          icon={FolderTree}
          title={query ? 'No categories match your search' : 'No categories yet'}
          description={
            query
              ? 'Try a different word.'
              : 'Create your first category to start organizing products.'
          }
          action={
            query ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear search
              </Button>
            ) : (
              <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                <Link href="/admin/categories/new">Add category</Link>
              </Button>
            )
          }
        />
      );
    }
    return (
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-176">
            <thead className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">URL handle</th>
                <th className="p-4 text-right font-medium">Products</th>
                <th className="p-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }, (_, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td colSpan={4} className="p-4">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map(({ category, depth, childCount }) => {
                    const products = category._count?.products ?? 0;
                    const image = category.image || category.imageUrl;
                    return (
                      <tr
                        key={category.id}
                        className="border-b transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="p-4">
                          <div
                            className="flex items-center gap-3"
                            style={{ paddingLeft: depth * 24 }}
                          >
                            {depth > 0 && (
                              <CornerDownRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <ImageThumbnail
                              images={[image]}
                              alt={category.name}
                              size="sm"
                              fallbackIcon={FolderTree}
                            />
                            <div className="min-w-0">
                              <Link
                                href={`/admin/categories/${category.id}/edit`}
                                className="font-medium outline-none hover:text-accent-rose focus-visible:underline"
                              >
                                {category.name}
                              </Link>
                              <p className="max-w-md truncate text-xs text-muted-foreground">
                                {depth === 0 && childCount > 0
                                  ? `${childCount} subcategor${childCount === 1 ? 'y' : 'ies'}`
                                  : category.description ||
                                    (depth > 0 ? 'Subcategory' : 'Top-level category')}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {category.slug}
                        </td>
                        <td className="p-4 text-right text-sm tabular-nums">
                          {products > 0 ? (
                            products
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Actions for ${category.name}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/categories/${category.id}/edit`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/shop?category=${category.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="mr-2 h-4 w-4" />
                                  View in shop
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onSelect={() => setToDelete(category)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Categories" description="Organize how customers browse your products">
        <Button asChild className="gap-2 bg-accent-rose hover:bg-accent-rose-dark">
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4" />
            Add category
          </Link>
        </Button>
      </AdminHeader>

      <div className="px-4 py-8 sm:px-8">
        <StatGrid columns={4} loading={loading}>
          <StatCard
            title="Total categories"
            value={categories.length}
            icon={FolderTree}
            tone="blue"
          />
          <StatCard
            title="Top-level"
            value={topLevel}
            icon={Layers}
            tone="violet"
            hint="Shown in shop navigation"
          />
          <StatCard
            title="Subcategories"
            value={categories.length - topLevel}
            icon={Package}
            tone="green"
          />
          <StatCard
            title="Empty"
            value={empty}
            icon={PackageX}
            tone={empty > 0 ? 'amber' : 'neutral'}
            hint={empty > 0 ? 'Hidden from the home page' : 'Every category has products'}
          />
        </StatGrid>

        <SearchInput
          className="mb-5 max-w-md"
          label="Search categories"
          placeholder="Search by name, handle or description"
          value={search}
          onValueChange={setSearch}
        />

        {renderTable()}

        {!loading && !loadFailed && (
          <TablePagination
            page={currentPage}
            pageSize={ADMIN_PAGE_SIZE}
            total={groups.length}
            onPageChange={setPage}
            noun={['top-level category', 'top-level categories']}
          />
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete category"
        description={
          toDelete ? (
            <>
              Delete <span className="font-medium text-foreground">{toDelete.name}</span>? This
              cannot be undone.
            </>
          ) : null
        }
        warning={toDeleteBlocker ?? undefined}
        blocked={!!toDeleteBlocker}
        onConfirm={async () => {
          if (!toDelete) return;
          await categoriesApi.delete(toDelete.id);
        }}
        onSuccess={() => {
          setToDelete(null);
          load();
        }}
        successMessage="Category deleted"
      />
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <CategoriesManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
