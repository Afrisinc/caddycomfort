import { useParams } from 'react-router-dom';
import { ExternalLink, FolderX } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi } from '@/lib/api';
import { categoryToFormValues, type CategoryPayload } from '@/lib/categoryForm';
import type { Category } from '@/types/api';

const NO_CATEGORIES: Category[] = [];

function EditCategory() {
  const { id = '' } = useParams<{ id: string }>();
  const router = useRouter();
  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);
  const category = categories.data.find((c) => c.id === id);
  const hasChildren = categories.data.some((c) => c.parentId === id);

  const save = async (payload: CategoryPayload) => {
    try {
      await categoriesApi.update(id, payload);
      toast.success('Category saved');
    } catch (error: any) {
      toast.error(error.message || 'Could not save the category');
      throw error;
    }
  };

  const renderBody = () => {
    if (categories.loading) {
      return (
        <div className="max-w-3xl space-y-6" aria-hidden="true">
          {[220, 120, 200].map((height) => (
            <Skeleton key={height} className="w-full rounded-2xl" style={{ height }} />
          ))}
        </div>
      );
    }
    if (!category) {
      return (
        <EmptyState
          icon={FolderX}
          title="Category not found"
          description="It may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link href="/admin/categories">Back to categories</Link>
            </Button>
          }
        />
      );
    }
    return (
      <CategoryForm
        key={category.id}
        mode="edit"
        initialValues={categoryToFormValues(category)}
        categories={categories.data}
        currentId={category.id}
        hasChildren={hasChildren}
        onSubmit={save}
        onCancel={() => router.push('/admin/categories')}
      />
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Edit category" description={category?.name ?? 'Update category details'}>
        {category && (
          <Button asChild variant="outline" className="gap-2">
            <Link
              href={`/shop?category=${category.slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              View in shop
            </Link>
          </Button>
        )}
      </AdminHeader>
      <div className="px-4 py-8 sm:px-8">{renderBody()}</div>
    </div>
  );
}

export default function AdminCategoryEditPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EditCategory />
      </AdminLayout>
    </ProtectedRoute>
  );
}
