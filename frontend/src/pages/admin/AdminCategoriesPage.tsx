import React, { useState, useEffect } from 'react';
import Link from '@/components/common/Link';
import { useRouter } from '@/router/compat';
import { Plus, Search, MoreVertical, Edit, Trash2, FolderTree, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types/api';
import { toast } from 'sonner';

function CategoriesManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesApi.getAll();
      // Ensure data is an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load categories');
      setCategories([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleDeleted = () => {
    setCategoryToDelete(null);
    fetchCategories();
  };

  const getParentName = (parentId: string | null | undefined) => {
    if (!parentId) return null;
    const parent = categories.find((cat) => cat.id === parentId);
    return parent?.name || null;
  };

  const countProducts = (category: Category): number => {
    return category._count?.products || 0;
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()),
  );

  const parentCategories = filteredCategories.filter((cat) => !cat.parentId);
  const childCategories = filteredCategories.filter((cat) => cat.parentId);

  // Build hierarchical tree: parent followed by its children
  const buildCategoryTree = () => {
    const tree: Category[] = [];

    parentCategories.forEach((parent) => {
      // Add parent
      tree.push(parent);

      // Add its children right after
      const children = childCategories.filter((child) => child.parentId === parent.id);
      tree.push(...children);
    });

    // Add orphaned children (children whose parent is not in filtered list)
    const orphanedChildren = childCategories.filter(
      (child) => !parentCategories.some((parent) => parent.id === child.parentId),
    );
    tree.push(...orphanedChildren);

    return tree;
  };

  const hierarchicalCategories = buildCategoryTree();

  const categoryToDeleteChildCount = categoryToDelete
    ? categories.filter((c) => c.parentId === categoryToDelete.id).length
    : 0;
  const categoryToDeleteProductCount = categoryToDelete?._count?.products ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Category Management" description="Organize your product categories">
        <Link href="categories/new">
          <Button className="bg-accent-rose hover:bg-accent-rose-dark">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        {/* Loading State */}
        {isLoading ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: 3 }, (_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-7 w-12" />
                      </div>
                      <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mb-6">
              <CardContent className="p-6">
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex gap-4">
                      {Array.from({ length: 6 }, (_, j) => (
                        <Skeleton key={j} className="h-4 flex-1" />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Categories</p>
                      <p className="text-2xl font-bold mt-1">{categories.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                      <FolderTree className="h-6 w-6 text-accent-rose" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Parent Categories</p>
                      <p className="text-2xl font-bold mt-1">{parentCategories.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                      <FolderTree className="h-6 w-6 text-accent-rose" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Child Categories</p>
                      <p className="text-2xl font-bold mt-1">{childCategories.length}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-accent-rose/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-accent-rose" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Categories ({filteredCategories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Slug</th>
                        <th className="text-left py-3 px-4 font-semibold">Description</th>
                        <th className="text-left py-3 px-4 font-semibold">Parent</th>
                        <th className="text-left py-3 px-4 font-semibold">Products</th>
                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hierarchicalCategories.map((category) => {
                        const parentName = getParentName(category.parentId);
                        const isParent = !category.parentId;
                        return (
                          <tr
                            key={category.id}
                            className={`border-b hover:bg-muted/50 ${isParent ? 'bg-muted/20' : ''}`}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                {category.parentId && (
                                  <span className="text-muted-foreground ml-4">└─</span>
                                )}
                                {isParent && <FolderTree className="h-4 w-4 text-accent-rose" />}
                                <p className={`${isParent ? 'font-bold' : 'font-medium'}`}>
                                  {category.name}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <code className="text-sm bg-muted px-2 py-1 rounded">
                                {category.slug}
                              </code>
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm text-muted-foreground">
                                {category.description || '—'}
                              </p>
                            </td>
                            <td className="py-4 px-4">
                              {parentName ? (
                                <Badge variant="outline">{parentName}</Badge>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <p className="font-medium">{countProducts(category)}</p>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(`/admin/categories/${category.id}/edit`)
                                    }
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleDeleteClick(category)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
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

                {filteredCategories.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No categories found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDeleteDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Category"
          description={
            <>
              Are you sure you want to delete &quot;{categoryToDelete?.name}&quot;? This action
              cannot be undone.
            </>
          }
          warning={
            (categoryToDeleteChildCount > 0 || categoryToDeleteProductCount > 0) && (
              <>
                {categoryToDeleteChildCount > 0 && (
                  <p>
                    This category has {categoryToDeleteChildCount} subcategor
                    {categoryToDeleteChildCount === 1 ? 'y' : 'ies'} — remove{' '}
                    {categoryToDeleteChildCount === 1 ? 'it' : 'them'} first before deleting.
                  </p>
                )}
                {categoryToDeleteProductCount > 0 && (
                  <p className="mt-1">
                    This category has {categoryToDeleteProductCount} product
                    {categoryToDeleteProductCount === 1 ? '' : 's'} — remove or reassign{' '}
                    {categoryToDeleteProductCount === 1 ? 'it' : 'them'} first before deleting.
                  </p>
                )}
              </>
            )
          }
          successMessage="Category deleted successfully"
          errorMessage="Failed to delete category"
          onConfirm={async () => {
            if (!categoryToDelete) return;
            await categoriesApi.delete(categoryToDelete.id);
          }}
          onSuccess={handleDeleted}
        />
      </div>
    </div>
  );
}

export default function CategoriesManagementPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <CategoriesManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}
