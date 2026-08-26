'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  Package,
  AlertCircle,
  Loader2
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/types/api';
import { toast } from 'sonner';

function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories once on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when category filter changes
  useEffect(() => {
    fetchProducts();
  }, [categoryFilter]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const filters = categoryFilter !== 'all' ? { categoryId: categoryFilter } : undefined;
      const response = await productsApi.getAll(filters, { page: 1, limit: 100 });
      
      // Handle nested response structure: { data: { products: [...], pagination: {...} } }
      const resAny = response as any;
      const productsData = resAny.products || resAny.data?.products || resAny.data || (Array.isArray(response) ? response : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll();
      const result = data as any;
      setCategories(Array.isArray(result.categories) ? result.categories : Array.isArray(result) ? result : []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      await productsApi.delete(productToDelete.id);
      toast.success('Product deleted successfully');
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Out of Stock</span>;
    }
    if (stock <= 5) {
      return <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">Low Stock</span>;
    }
    return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">In Stock</span>;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === 'all' || product.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Product Management" description="Manage your product catalog and inventory">
        <Link href="/admin/products/new">
            <Button className="bg-accent-rose hover:bg-accent-rose-dark">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
            </Button>
        </Link>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{filteredProducts.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold text-green-600">
                {filteredProducts.filter(p => p.stockQuantity > 5).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredProducts.filter(p => p.stockQuantity > 0 && p.stockQuantity <= 5).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stockQuantity === 0).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-sm">Product</th>
                    <th className="text-left p-4 font-medium text-sm">SKU</th>
                    <th className="text-left p-4 font-medium text-sm">Category</th>
                    <th className="text-right p-4 font-medium text-sm">Price</th>
                    <th className="text-center p-4 font-medium text-sm">Stock</th>
                    <th className="text-center p-4 font-medium text-sm">Sales</th>
                    <th className="text-center p-4 font-medium text-sm">Status</th>
                    <th className="text-center p-4 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent-rose" />
                        <p className="text-muted-foreground mt-2">Loading products...</p>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No products found</p>
                      </td>
                    </tr>
                  ) : (
                      filteredProducts.map((product) => {
                        const category = categories.find(c => c.id === product.categoryId);
                        const productUrl = `/admin/products/${product.slug || product.id}`;

                        return (
                          <tr key={product.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <Link href={productUrl} className="flex items-center gap-3 group">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted border border-border/50 group-hover:border-accent-rose/50 transition-colors">
                                  {product.images && product.images.length > 0 ? (
                                    <Image
                                      src={product.images[0]}
                                      alt={product.name}
                                      fill
                                      className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                  ) : (
                                    <Package className="w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium group-hover:text-accent-rose transition-colors">{product.name}</p>
                                  <p className="text-xs text-muted-foreground sm:hidden">{product.sku || 'No SKU'}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{product.sku || 'N/A'}</td>
                            <td className="p-4 text-sm">{category?.name || 'Uncategorized'}</td>
                            <td className="p-4 text-right font-medium">
                              Rwf {product.price.toLocaleString()}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-medium ${product.stockQuantity <= 5 && product.stockQuantity > 0 ? 'text-orange-600' : product.stockQuantity === 0 ? 'text-red-600' : ''}`}>
                                {product.stockQuantity}
                              </span>
                            </td>
                            <td className="p-4 text-center text-sm">-</td>
                            <td className="p-4 text-center">
                              {getStatusBadge(product.stockQuantity)}
                            </td>
                            <td className="p-4 text-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={productUrl} className="cursor-pointer">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`${productUrl}/edit`} className="cursor-pointer">
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600 cursor-pointer"
                                    onClick={() => handleDeleteClick(product)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{productToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ProductsManagementPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <ProductsManagement />
      </AdminLayout>
    </ProtectedRoute>
  );
}