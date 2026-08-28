'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/types/api';
import { toast } from 'sonner';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  parentId: string;
  image: string;
}

// A category can't be its own parent, nor can any of its descendants —
// otherwise the tree would contain a cycle. The backend also enforces this,
// but filtering them out of the picker avoids a round-trip error.
function getExcludedParentIds(categories: Category[], selfId: string): Set<string> {
  const excluded = new Set<string>([selfId]);
  const queue = [selfId];

  while (queue.length) {
    const currentId = queue.shift()!;
    categories.forEach((category) => {
      if (category.parentId === currentId && !excluded.has(category.id)) {
        excluded.add(category.id);
        queue.push(category.id);
      }
    });
  }

  return excluded;
}

function EditCategoryForm({ id }: { id: string }) {
  const router = useRouter();
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    parentId: 'none',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchCategory();
    fetchCategories();
  }, [id]);

  const fetchCategory = async () => {
    try {
      setIsLoadingCategory(true);
      const category = await categoriesApi.getById(id);
      setCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId || 'none',
        image: category.image || '',
      });
      setImagePreview(category.image || '');
    } catch (error: any) {
      toast.error(error.message || 'Failed to load category');
      router.push('/admin/categories');
    } finally {
      setIsLoadingCategory(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const data = await categoriesApi.getAll();
      const result = data as any;
      setCategories(Array.isArray(result.categories) ? result.categories : Array.isArray(result) ? result : []);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load parent categories');
      setCategories([]);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setImagePreview(base64);
      setFormData({ ...formData, image: base64 });
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' });
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('Please enter a category slug');
      return;
    }

    try {
      setIsSubmitting(true);

      const categoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || undefined,
        parentId: formData.parentId === 'none' ? null : formData.parentId,
        image: formData.image || '',
      };

      await categoriesApi.update(id, categoryData as any);

      toast.success('Category updated successfully!');
      router.push('/admin/categories');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleted = () => {
    router.push('/admin/categories');
  };

  if (isLoadingCategory) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
      </div>
    );
  }

  const excludedParentIds = getExcludedParentIds(categories, id);
  const selectableParents = categories.filter((c) => !excludedParentIds.has(c.id));

  const childCount = category?.children?.length ?? 0;
  const productCount = category?._count?.products ?? 0;
  const blockedDeleteReason =
    childCount > 0 && productCount > 0
      ? `This category has ${childCount} subcategor${childCount === 1 ? 'y' : 'ies'} and ${productCount} product${productCount === 1 ? '' : 's'}`
      : childCount > 0
      ? `This category has ${childCount} subcategor${childCount === 1 ? 'y' : 'ies'}`
      : productCount > 0
      ? `This category has ${productCount} product${productCount === 1 ? '' : 's'}`
      : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader
        title="Edit Category"
        description="Update this category's details"
      >
        <Button
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Women's Clothing"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  The name is how it appears on your site
                </p>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="womens-clothing"
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  The slug is the URL-friendly version of the name
                </p>
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Category</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                  disabled={isLoadingCategories || isSubmitting}
                >
                  <SelectTrigger id="parent">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>
                    {selectableParents.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Create a hierarchy by selecting a parent category
                </p>
              </div>

              {/* Category Image - Only for parent categories */}
              {formData.parentId === 'none' && (
                <div className="space-y-2">
                  <Label htmlFor="image">Category Image</Label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border-2 border-border">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={handleRemoveImage}
                          disabled={isSubmitting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed rounded-lg p-8 text-center">
                        <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload category image
                        </p>
                        <div className="flex justify-center">
                          <label htmlFor="image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={isUploadingImage || isSubmitting}
                              asChild
                            >
                              <span>
                                {isUploadingImage ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Choose Image
                                  </>
                                )}
                              </span>
                            </Button>
                          </label>
                          <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={isUploadingImage || isSubmitting}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 800 x 600 pixels, max 5MB (only for parent categories)
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this category..."
                  rows={4}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  Optional description to help customers understand this category
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent-rose hover:bg-accent-rose-dark"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardContent className="p-6 flex items-center justify-between gap-4">
            <div>
              <p className="font-medium">Delete this category</p>
              <p className="text-sm text-muted-foreground">
                Permanently remove this category. This cannot be undone.
                {blockedDeleteReason && (
                  <span className="block mt-1 text-red-600">
                    {blockedDeleteReason} — remove those first before deleting.
                  </span>
                )}
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isSubmitting || !!blockedDeleteReason}
              title={blockedDeleteReason ?? undefined}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Category"
        description={
          <>Are you sure you want to delete &quot;{formData.name}&quot;? This action cannot be undone.</>
        }
        warning={blockedDeleteReason && `${blockedDeleteReason} — remove those first before deleting.`}
        successMessage="Category deleted successfully"
        errorMessage="Failed to delete category"
        onConfirm={() => categoriesApi.delete(id)}
        onSuccess={handleDeleted}
      />
    </div>
  );
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EditCategoryForm id={id} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
