import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CategoryForm } from '@/components/admin/CategoryForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi } from '@/lib/api';
import { EMPTY_CATEGORY_VALUES, type CategoryPayload } from '@/lib/categoryForm';
import type { Category } from '@/types/api';

const NO_CATEGORIES: Category[] = [];

function AddCategory() {
  const router = useRouter();
  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);

  const create = async (payload: CategoryPayload) => {
    try {
      const category = await categoriesApi.create(payload);
      toast.success(`${category.name} created`);
      router.push('/admin/categories');
    } catch (error: any) {
      toast.error(error.message || 'Could not create the category');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Add category" description="Group products so customers can browse them" />
      <div className="px-4 py-8 sm:px-8">
        <CategoryForm
          mode="create"
          initialValues={EMPTY_CATEGORY_VALUES}
          categories={categories.data}
          onSubmit={create}
          onCancel={() => router.push('/admin/categories')}
        />
      </div>
    </div>
  );
}

export default function AdminCategoryNewPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AddCategory />
      </AdminLayout>
    </ProtectedRoute>
  );
}
