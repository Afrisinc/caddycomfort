import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import { useRouter } from '@/router/compat';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  ExternalLink,
  Tag,
  Layers,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RefreshCw,
  Hash,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { productsApi } from '@/lib/api';
import { Product } from '@/types/api';
import { toast } from 'sonner';

function ProductDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Stock update modal state
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockOperation, setStockOperation] = useState<'SET' | 'ADD' | 'SUBTRACT'>('SET');
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [stockReason, setStockReason] = useState('');
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProduct = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let fetchedProduct: Product | null = null;

      try {
        fetchedProduct = await productsApi.getBySlug(slug);
      } catch (slugError) {
        // Fallback to getById in case the slug is a UUID or slug route failed
        try {
          fetchedProduct = await productsApi.getById(slug);
        } catch (idError) {
          throw slugError;
        }
      }

      if (!fetchedProduct || !fetchedProduct.id) {
        throw new Error('Product not found');
      }

      setProduct(fetchedProduct);
      setStockAmount(fetchedProduct.stockQuantity ?? (fetchedProduct as any).stock ?? 0);
    } catch (err: any) {
      console.error('Failed to load product detail:', err);
      setError(err.message || 'Failed to load product details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    try {
      setIsUpdatingStock(true);
      const updatedProduct = await productsApi.updateStock(product.id, {
        quantity: Number(stockAmount),
        type: stockOperation,
        reason: stockReason.trim() || undefined,
      });

      toast.success('Inventory stock updated successfully');
      setProduct((prev) =>
        prev
          ? {
              ...prev,
              stockQuantity: updatedProduct.stockQuantity ?? updatedProduct.stock ?? stockAmount,
            }
          : updatedProduct,
      );
      setIsStockModalOpen(false);
      setStockReason('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update stock');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!product) return;

    try {
      setIsDeleting(true);
      await productsApi.delete(product.id);
      toast.success('Product deleted successfully');
      setIsDeleteDialogOpen(false);
      router.push('/admin/products');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader title="Product Details" description="Loading product information...">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </AdminHeader>
        <div className="px-4 sm:px-8 py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-accent-rose mb-4" />
          <p className="text-muted-foreground font-medium">Fetching product data for "{slug}"...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader
          title="Product Not Found"
          description="The requested product could not be located"
        >
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </AdminHeader>
        <div className="px-4 sm:px-8 py-12 max-w-2xl mx-auto">
          <Card className="border-destructive/30 bg-destructive/5 text-center p-8">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-6">
              {error ||
                `We could not find any product with the slug "${slug}". It might have been deleted or the link is incorrect.`}
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={fetchProduct}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                <Link href="/admin/products">Back to Product Catalog</Link>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const currentStock = product.stockQuantity ?? (product as any).stock ?? 0;
  const activePrice =
    product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
  const originalPrice =
    product.comparePrice ??
    (product as any).compareAtPrice ??
    (product.salePrice && product.salePrice < product.price ? product.price : undefined);
  const hasDiscount = originalPrice && originalPrice > activePrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const stockBadge =
    currentStock === 0 ? (
      <Badge variant="destructive" className="font-semibold gap-1">
        <XCircle className="h-3.5 w-3.5" /> Out of Stock
      </Badge>
    ) : currentStock <= 5 ? (
      <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1">
        <AlertTriangle className="h-3.5 w-3.5" /> Low Stock ({currentStock} left)
      </Badge>
    ) : (
      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" /> In Stock ({currentStock} units)
      </Badge>
    );

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminHeader
        title={product.name}
        description={`SKU: ${product.sku || 'N/A'} • Slug: ${product.slug}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/products/${product?.slug || slug}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStockAmount(currentStock);
              setStockOperation('SET');
              setIsStockModalOpen(true);
            }}
          >
            <Package className="h-4 w-4 mr-2" />
            Quick Stock
          </Button>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/shop`} target="_blank">
              <ExternalLink className="h-4 w-4 mr-2" />
              View in Shop
            </Link>
          </Button>

          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/products">Products</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-md">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Image Gallery & Badges (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="overflow-hidden shadow-sm border-border/60">
              <CardContent className="p-4 space-y-4">
                {/* Main Active Image Display */}
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/60 border border-border/40 shadow-inner flex items-center justify-center group/gallery">
                  {images.length > 0 ? (
                    <Image
                      src={images[selectedImageIndex] || images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-all duration-300 hover:scale-105"
                      priority
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                      <Package className="h-16 w-16 mb-2 opacity-40" />
                      <p className="text-sm font-medium">No product images uploaded</p>
                    </div>
                  )}

                  {/* Prev / Next arrows — only when multiple images */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === 0 ? images.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border/60 rounded-full p-1.5 shadow opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-background"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImageIndex((prev) =>
                            prev === images.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border/60 rounded-full p-1.5 shadow opacity-0 group-hover/gallery:opacity-100 transition-opacity hover:bg-background"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      {/* Image counter dot indicator */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              selectedImageIndex === idx
                                ? 'bg-white scale-125 shadow'
                                : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`Image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Badges on image */}
                  <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {product.isFeatured && (
                      <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-md flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> Featured
                      </Badge>
                    )}
                    {product.isActive ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                        Active Catalog
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="shadow-md bg-muted text-muted-foreground"
                      >
                        Draft / Inactive
                      </Badge>
                    )}
                  </div>

                  {hasDiscount && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-accent-rose text-white shadow-md font-bold">
                        {discountPercent}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Thumbnails Gallery */}
                {images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-accent-rose ring-2 ring-accent-rose/20 scale-105'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Status Card */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-accent-rose" />
                  Product Status & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Inventory Status</span>
                  <div>{stockBadge}</div>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Store Visibility</span>
                  <Badge variant={product.isActive ? 'default' : 'secondary'}>
                    {product.isActive ? 'Published & Live' : 'Hidden / Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">SKU Code</span>
                  <code className="px-2 py-0.5 rounded bg-muted font-mono text-xs">
                    {product.sku || 'None'}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Pricing, Overview, Attributes, Inventory (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pricing & Commercial Highlights */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl font-bold">{product.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {product.category?.name
                        ? `Category: ${product.category.name}`
                        : 'Catalog Item'}
                    </CardDescription>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-2xl sm:text-3xl font-black text-foreground">
                      Rwf {activePrice.toLocaleString()}
                    </div>
                    {product.salePrice && product.salePrice < product.price && (
                      <div className="text-xs text-accent-rose font-semibold">
                        Sale Price (Reg: Rwf {product.price.toLocaleString()})
                      </div>
                    )}
                    {hasDiscount && originalPrice && (
                      <div className="text-sm text-muted-foreground line-through">
                        Rwf {originalPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground">Available Stock</p>
                    <p
                      className={`text-lg font-bold ${currentStock === 0 ? 'text-red-600' : currentStock <= 5 ? 'text-orange-600' : 'text-emerald-600'}`}
                    >
                      {currentStock} units
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SKU Number</p>
                    <p className="text-lg font-semibold truncate">{product.sku || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pricing Status</p>
                    <p className="text-lg font-semibold text-accent-rose">
                      {product.salePrice && product.salePrice < product.price
                        ? 'On Sale'
                        : hasDiscount
                          ? 'Discounted'
                          : 'Standard'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description Card */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Layers className="h-4 w-4 text-accent-rose" />
                  Product Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.description ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No detailed description provided for this product.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Sizes, Colors & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Sizes Card */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-accent-rose" />
                    Available Sizes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.sizes && product.sizes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1 text-sm font-medium border-border/80 bg-background"
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific sizes specified</p>
                  )}
                </CardContent>
              </Card>

              {/* Colors Card */}
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent-rose" />
                    Available Colors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {product.colors && product.colors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color, index) => {
                        const isHex =
                          color.startsWith('#') || /^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color);
                        const hexValue = isHex
                          ? color.startsWith('#')
                            ? color
                            : `#${color}`
                          : null;

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background text-sm font-medium"
                          >
                            {hexValue && (
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: hexValue }}
                              />
                            )}
                            <span>{color}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific colors specified</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tags Card */}
            {product.tags && product.tags.length > 0 && (
              <Card className="shadow-sm border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Hash className="h-4 w-4 text-accent-rose" />
                    Keywords & Search Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-2.5 py-1">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metadata & Technical Info */}
            <Card className="shadow-sm border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent-rose" />
                  System Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">System ID</span>
                  <code className="text-xs font-mono select-all bg-muted px-2 py-0.5 rounded block mt-0.5 truncate">
                    {product.id}
                  </code>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Slug</span>
                  <code className="text-xs font-mono select-all bg-muted px-2 py-0.5 rounded block mt-0.5 truncate">
                    {product.slug}
                  </code>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Created At</span>
                  <span className="text-sm font-medium block mt-0.5">
                    {product.createdAt ? new Date(product.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Last Modified</span>
                  <span className="text-sm font-medium block mt-0.5">
                    {product.updatedAt ? new Date(product.updatedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Quick Stock Update Modal */}
      <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Inventory Stock</DialogTitle>
            <DialogDescription>
              Adjust available inventory units for <strong>{product.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleStockSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="stockOperation">Operation Mode</Label>
              <Select
                value={stockOperation}
                onValueChange={(val: 'SET' | 'ADD' | 'SUBTRACT') => setStockOperation(val)}
              >
                <SelectTrigger id="stockOperation">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SET">Set Absolute Quantity</SelectItem>
                  <SelectItem value="ADD">Add to Current Stock (+)</SelectItem>
                  <SelectItem value="SUBTRACT">Subtract from Stock (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockAmount">
                {stockOperation === 'SET' ? 'New Total Quantity' : 'Units to Adjust'}
              </Label>
              <Input
                id="stockAmount"
                type="number"
                min="0"
                required
                value={stockAmount}
                onChange={(e) => setStockAmount(Math.max(0, parseInt(e.target.value) || 0))}
              />
              <p className="text-xs text-muted-foreground">
                Current stock: <strong>{currentStock} units</strong>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockReason">Adjustment Reason (Optional)</Label>
              <Input
                id="stockReason"
                placeholder="e.g. Stock replenishment, physical count audit"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsStockModalOpen(false)}
                disabled={isUpdatingStock}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdatingStock}
                className="bg-accent-rose hover:bg-accent-rose-dark"
              >
                {isUpdatingStock ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Save Stock'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete <strong>{product.name}</strong>? This
              action cannot be undone and will remove the product from the catalog.
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
                'Delete Product'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>() as { slug: string };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <ProductDetailContent slug={slug} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
