import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi, productsApi } from '@/lib/api';
import { EMPTY_PRODUCT_VALUES, type ProductPayload } from '@/lib/productForm';
import type { Category } from '@/types/api';

const NO_CATEGORIES: Category[] = [];

function AddProduct() {
  const router = useRouter();
  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);

  const create = async (payload: ProductPayload) => {
    try {
      const product = await productsApi.create(payload);
      toast.success(`${product.name} created`);
      router.push(`/admin/products/${product.slug}`);
    } catch (error: any) {
      toast.error(error.message || 'Could not create the product');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Add product" description="Create a new product in your catalog" />
      <div className="px-4 py-8 sm:px-8">
        <ProductForm
          mode="create"
          initialValues={EMPTY_PRODUCT_VALUES}
          categories={categories.data}
          onSubmit={create}
          onCancel={() => router.push('/admin/products')}
        />
      </div>
    </div>
  );
}

export default function AdminProductNewPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AddProduct />
      </AdminLayout>
    </ProtectedRoute>
  );
}
