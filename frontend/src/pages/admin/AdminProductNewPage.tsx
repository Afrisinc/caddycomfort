import React, { useState, useEffect } from 'react';
import { useRouter } from '@/router/compat';
import Image from '@/components/common/Image';
import { Save, X, Upload, Plus, Trash2, Image as ImageIcon, Loader2 } from 'lucide-react';
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
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { productsApi, categoriesApi } from '@/lib/api';
import { Category } from '@/types/api';
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
  sizes: string[];
  colors: string[];
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
}

function AddProduct() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

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
    sizes: [],
    colors: [],
    stockQuantity: 0,
    isActive: false,
    isFeatured: false,
    tags: [],
  });

  const [variants, setVariants] = useState([{ id: 1, size: '', color: '', stock: 0, sku: '' }]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoriesApi.getAll();
      const result = data as any;
      setCategories(
        Array.isArray(result.categories) ? result.categories : Array.isArray(result) ? result : [],
      );
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, ''),
    });
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file count (max 5 images)
    if (imagePreviews.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setIsUploadingImages(true);
    const newImages: string[] = [];
    const newPreviews: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not a valid image`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Convert to base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newImages.push(base64);
        newPreviews.push(base64);
      }

      setFormData({ ...formData, images: [...formData.images, ...newImages] });
      setImagePreviews([...imagePreviews, ...newPreviews]);
      toast.success(`${newImages.length} image(s) uploaded`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a product name');
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

      // Use sizes and colors from formData (comma-separated inputs)
      const productData = {
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
        sku: formData.sku.trim() || `PRD-${Date.now()}`, // Generate SKU if empty
        categoryId: formData.categoryId,
        images: formData.images,
        sizes: formData.sizes,
        colors: formData.colors,
        stockQuantity: Number(formData.stockQuantity),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        tags: formData.tags,
      };

      await productsApi.create(productData);

      toast.success('Product created successfully!');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { id: Date.now(), size: '', color: '', stock: 0, sku: '' }]);
  };

  const removeVariant = (id: number) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Add New Product" description="Create a new product in your catalog">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/products')}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          className="bg-accent-rose hover:bg-accent-rose-dark"
          onClick={handleSubmit}
          disabled={isSubmitting || isUploadingImages}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Product
            </>
          )}
        </Button>
      </AdminHeader>

      <form onSubmit={handleSubmit} className="px-4 sm:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Elegant Silk Dress"
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
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Auto-generated from product name
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product in detail..."
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* SKU and Barcode fields - Hidden for now */}
                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                      id="sku" 
                      placeholder="e.g., DRS-001"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input 
                      id="barcode" 
                      placeholder="Optional"
                      disabled={isSubmitting}
                    />
                  </div>
                </div> */}
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
                      placeholder="0"
                      value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
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
                      placeholder="0"
                      value={formData.salePrice || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, salePrice: Number(e.target.value) })
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
                      placeholder="0"
                      value={formData.comparePrice || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, comparePrice: Number(e.target.value) })
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

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      placeholder="0"
                      value={formData.stockQuantity || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                      }
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input id="lowStock" type="number" placeholder="5" disabled={isSubmitting} />
                  </div>
                </div>

                {/* <div className="flex items-center justify-between">
                  <div>
                    <Label>Track Inventory</Label>
                    <p className="text-sm text-muted-foreground">Monitor stock levels</p>
                  </div>
                  <Switch defaultChecked disabled={isSubmitting} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Continue selling when out of stock</Label>
                    <p className="text-sm text-muted-foreground">Allow backorders</p>
                  </div>
                  <Switch disabled={isSubmitting} />
                </div> */}

                <div>
                  <Label htmlFor="sizes">Sizes</Label>
                  <Input
                    id="sizes"
                    placeholder="Separate sizes with commas (e.g., S, M, L, XL)"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sizes: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter((s) => s),
                      })
                    }
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter sizes separated by commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="colors">Colors</Label>
                  <Input
                    id="colors"
                    placeholder="Separate colors with commas (e.g., Red, Blue, Green)"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        colors: e.target.value
                          .split(',')
                          .map((c) => c.trim())
                          .filter((c) => c),
                      })
                    }
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter colors separated by commas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Product Variants - Hidden for now */}
            {/* <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Product Variants</CardTitle>
                  <Button variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Variant
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {variants.map((variant, index) => (
                  <div key={variant.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Variant {index + 1}</h4>
                      {variants.length > 1 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeVariant(variant.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Size</Label>
                        <Input placeholder="e.g., M, L, XL" />
                      </div>
                      <div>
                        <Label>Color</Label>
                        <Input placeholder="e.g., Red, Blue" />
                      </div>
                      <div>
                        <Label>Stock</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <div>
                        <Label>SKU</Label>
                        <Input placeholder="Variant SKU" />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card> */}

            {/* Shipping - Hidden for now */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input 
                      id="weight" 
                      type="number"
                      step="0.01"
                      placeholder="0.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">Length (cm)</Label>
                    <Input 
                      id="length" 
                      type="number"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="width">Width (cm)</Label>
                    <Input 
                      id="width" 
                      type="number"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input 
                    id="height" 
                    type="number"
                    placeholder="0"
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Product Status</Label>
                  <Select
                    value={formData.isActive ? 'active' : 'draft'}
                    onValueChange={(value) =>
                      setFormData({ ...formData, isActive: value === 'active' })
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Featured Product</Label>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                    disabled={isSubmitting}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Organization */}
            <Card>
              <CardHeader>
                <CardTitle>Organization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                    disabled={isLoadingCategories || isSubmitting}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="collection">Collection</Label>
                  <Select disabled={isSubmitting}>
                    <SelectTrigger id="collection">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer">Summer 2024</SelectItem>
                      <SelectItem value="winter">Winter 2024</SelectItem>
                      <SelectItem value="new">New Arrivals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Separate tags with commas"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter((t) => t),
                      })
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input id="vendor" placeholder="Brand or supplier name" disabled={isSubmitting} />
                </div>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border-2 border-border"
                      >
                        <Image
                          src={preview}
                          alt={`Product ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={() => handleRemoveImage(index)}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                {imagePreviews.length < 5 && (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground mb-4">
                      {imagePreviews.length > 0
                        ? `Add more images (${imagePreviews.length}/5)`
                        : 'Upload product images'}
                    </p>
                    <div className="flex justify-center">
                      <label htmlFor="image-upload">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploadingImages || isSubmitting}
                          asChild
                        >
                          <span>
                            {isUploadingImages ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
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
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploadingImages || isSubmitting}
                      />
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Recommended: 1200 x 1200 pixels, max 5MB each, up to 5 images
                </p>
              </CardContent>
            </Card>

            {/* SEO - Hidden for now */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Search Engine Optimization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input 
                    id="metaTitle" 
                    placeholder="Product title for SEO"
                  />
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea 
                    id="metaDescription" 
                    placeholder="Brief description for search engines"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="urlHandle">URL Handle</Label>
                  <Input 
                    id="urlHandle" 
                    placeholder="product-url-slug"
                  />
                </div>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AddProduct />
      </AdminLayout>
    </ProtectedRoute>
  );
}
