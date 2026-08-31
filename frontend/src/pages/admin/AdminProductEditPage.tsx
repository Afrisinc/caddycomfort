import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import Image from '@/components/common/Image';
import {
  Save,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
import { productsApi, categoriesApi } from '@/lib/api';
import { Product, Category } from '@/types/api';
import { toast } from 'sonner';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number;
  comparePrice: number;
  sku: string;
  categoryId: string;
  images: string[];
  sizes: string;
  colors: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string;
}

function EditProductForm({ slug }: { slug: string }) {
  const router = useRouter();

  // ─── Loading & entity state ───────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    salePrice: 0,
    comparePrice: 0,
    sku: '',
    categoryId: '',
    images: [],
    sizes: '',
    colors: '',
    stockQuantity: 0,
    isActive: false,
    isFeatured: false,
    tags: '',
  });

  // ─── Image gallery preview state ──────────────────────────────────────────
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  // ─── Submit state ────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Fetch product & categories ──────────────────────────────────────────
  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [slug]);

  const fetchProduct = async () => {
    try {
      setIsLoadingProduct(true);
      let fetched: Product | null = null;
      try {
        fetched = await productsApi.getBySlug(slug);
      } catch {
        fetched = await productsApi.getById(slug);
      }
      if (!fetched?.id) throw new Error('Product not found');
      setProduct(fetched);
      // Populate form with existing data
      setFormData({
        name: fetched.name || '',
        slug: fetched.slug || '',
        description: fetched.description || '',
        price: fetched.price || 0,
        salePrice: fetched.salePrice || 0,
        comparePrice: (fetched.comparePrice ?? (fetched as any).compareAtPrice) || 0,
        sku: fetched.sku || '',
        categoryId: fetched.categoryId || '',
        images: fetched.images || [],
        sizes: (fetched.sizes || []).join(', '),
        colors: (fetched.colors || []).join(', '),
        stockQuantity: fetched.stockQuantity ?? (fetched as any).stock ?? 0,
        isActive: fetched.isActive ?? false,
        isFeatured: fetched.isFeatured ?? false,
        tags: (fetched.tags || []).join(', '),
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load product');
      router.push('/admin/products');
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoriesApi.getAll();
      const result = data as any;
      setCategories(
        Array.isArray(result.categories) ? result.categories : Array.isArray(result) ? result : [],
      );
    } catch {
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // ─── Auto-generate slug from name ────────────────────────────────────────
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    }));
  };

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setIsUploadingImages(true);
    const newImages: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      }
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...newImages] }));
      setActiveImageIndex(formData.images.length); // jump to first new image
      toast.success(`${newImages.length} image(s) added`);
    } catch {
      toast.error('Failed to process images');
    } finally {
      setIsUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: updated };
    });
    setActiveImageIndex((prev) => Math.max(0, prev >= index ? prev - 1 : prev));
  };

  // ─── Form submit ──────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    try {
      setIsSubmitting(true);

      const parsedSizes = formData.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedColors = formData.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const parsedTags = formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await productsApi.update(product.id, {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        salePrice:
          formData.salePrice && formData.salePrice > 0 ? Number(formData.salePrice) : undefined,
        comparePrice:
          formData.comparePrice && formData.comparePrice > 0
            ? Number(formData.comparePrice)
            : undefined,
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        images: formData.images,
        sizes: parsedSizes,
        colors: parsedColors,
        tags: parsedTags,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      });

      toast.success('Product updated successfully!');
      router.push(`/admin/products/${formData.slug || product.slug}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Loading skeleton ─────────────────────────────────────────────────────
  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-muted/30">
        <AdminHeader title="Edit Product" description="Loading product data...">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
        </AdminHeader>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-accent-rose" />
          <span className="ml-3 text-muted-foreground">Fetching product data…</span>
        </div>
      </div>
    );
  }

  const images = formData.images;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader
        title={`Edit: ${formData.name || product?.name || 'Product'}`}
        description={`Slug: ${formData.slug || product?.slug}`}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/admin/products/${product?.slug || slug}`)}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          className="bg-accent-rose hover:bg-accent-rose-dark"
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploadingImages}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </AdminHeader>

      <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-6 space-y-4">
        {/* Breadcrumb */}
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
              <BreadcrumbLink href={`/admin/products/${product?.slug || slug}`}>
                {product?.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Edit</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── Left: Main fields ───────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="e.g. Elegant Silk Dress"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    placeholder="elegant-silk-dress"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-generated from product name. Changing this will update the URL.
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail…"
                    rows={5}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    placeholder="e.g. DRS-001"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Regular Price (RWF) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.price || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                      }
                      required
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Standard selling price</p>
                  </div>
                  <div>
                    <Label htmlFor="salePrice">Sale Price (RWF)</Label>
                    <Input
                      id="salePrice"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.salePrice || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          salePrice: Number(e.target.value),
                        }))
                      }
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Promotional / discounted price
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="comparePrice">Compare at Price (RWF)</Label>
                    <Input
                      id="comparePrice"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={formData.comparePrice || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          comparePrice: Number(e.target.value),
                        }))
                      }
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Original strikethrough price
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory & Variants */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory & Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stockQuantity || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stockQuantity: Number(e.target.value),
                      }))
                    }
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="sizes">Sizes</Label>
                  <Input
                    id="sizes"
                    placeholder="S, M, L, XL, XXL"
                    value={formData.sizes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sizes: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate sizes with commas</p>
                </div>

                <div>
                  <Label htmlFor="colors">Colors</Label>
                  <Input
                    id="colors"
                    placeholder="Red, Blue, Black, White"
                    value={formData.colors}
                    onChange={(e) => setFormData((prev) => ({ ...prev, colors: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate colors with commas</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Right: Sidebar ──────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Status & Visibility */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Product Status</Label>
                  <Select
                    value={formData.isActive ? 'active' : 'draft'}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, isActive: value === 'active' }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Visible in Store)</SelectItem>
                      <SelectItem value="draft">Draft (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <Label>Featured Product</Label>
                    <p className="text-xs text-muted-foreground">
                      Show on homepage & featured sections
                    </p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isFeatured: checked }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category & Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, categoryId: value }))
                    }
                    disabled={isLoadingCategories || isSubmitting}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="e.g. summer, sale, new-arrival"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main preview with arrows */}
                {images.length > 0 && (
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-muted/60 border border-border/40 group/img">
                    <Image
                      src={images[activeImageIndex] || images[0]}
                      alt="Product preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((p) => (p === 0 ? images.length - 1 : p - 1))
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border/60 rounded-full p-1 shadow opacity-0 group-hover/img:opacity-100 transition-opacity"
                          aria-label="Previous"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveImageIndex((p) => (p === images.length - 1 ? 0 : p + 1))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-background/80 backdrop-blur-sm border border-border/60 rounded-full p-1 shadow opacity-0 group-hover/img:opacity-100 transition-opacity"
                          aria-label="Next"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        {/* Dot indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                          {images.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImageIndex(idx)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                activeImageIndex === idx ? 'bg-white scale-125' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Remove current image */}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(activeImageIndex)}
                      className="absolute top-2 right-2 z-20 bg-red-600 text-white rounded-full p-1.5 shadow opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute top-2 left-2 z-20 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  </div>
                )}

                {/* Thumbnail strip */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          activeImageIndex === idx
                            ? 'border-accent-rose ring-2 ring-accent-rose/20 scale-105'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Upload area */}
                {images.length < 5 && (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground mb-3">
                      {images.length > 0
                        ? `Add more images (${images.length}/5)`
                        : 'No images yet — upload product images'}
                    </p>
                    <label htmlFor="image-upload-edit">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploadingImages || isSubmitting}
                        asChild
                      >
                        <span className="cursor-pointer">
                          {isUploadingImages ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading…
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Images
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="image-upload-edit"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImages || isSubmitting}
                    />
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Recommended: 1200 × 1200 px · max 5 MB each · up to 5 images
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/60 -mx-4 sm:-mx-8 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 z-30">
          <p className="text-sm text-muted-foreground hidden sm:block">
            Changes will take effect immediately after saving.
          </p>
          <div className="flex items-center gap-3 ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/products/${product?.slug || slug}`)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent-rose hover:bg-accent-rose-dark"
              disabled={isSubmitting || isUploadingImages}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>() as { slug: string };

  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EditProductForm slug={slug} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
