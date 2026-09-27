import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, PackageX } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi, productsApi } from '@/lib/api';
import { productToFormValues, type ProductPayload } from '@/lib/productForm';
import type { Category, Product } from '@/types/api';

const NO_CATEGORIES: Category[] = [];

async function findProduct(handle: string): Promise<Product> {
  try {
    return await productsApi.getBySlug(handle);
  } catch {
    return productsApi.getById(handle);
  }
}

function FormSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]" aria-hidden="true">
      <div className="space-y-6">
        {[260, 180, 160].map((height) => (
          <Skeleton key={height} className="w-full rounded-2xl" style={{ height }} />
        ))}
      </div>
      <div className="space-y-6">
        {[140, 200, 240].map((height) => (
          <Skeleton key={height} className="w-full rounded-2xl" style={{ height }} />
        ))}
      </div>
    </div>
  );
}

function EditProduct() {
  const { slug = '' } = useParams<{ slug: string }>();
  const router = useRouter();
  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);
  const [product, setProduct] = useState<Product | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    findProduct(slug)
      .then((found) => {
        if (cancelled) return;
        setProduct(found);
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('missing'));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const save = async (payload: ProductPayload) => {
    if (!product) return;
    try {
      const updated = await productsApi.update(product.id, payload);
      toast.success('Product saved');
      if (updated.slug && updated.slug !== slug) {
        router.replace(`/admin/products/${updated.slug}/edit`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Could not save the product');
      throw error;
    }
  };

  const renderBody = () => {
    if (status === 'loading') return <FormSkeleton />;
    if (status === 'missing' || !product) {
      return (
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="It may have been deleted or its address changed."
          action={
            <Button asChild variant="outline">
              <Link href="/admin/products">Back to products</Link>
            </Button>
          }
        />
      );
    }
    return (
      <ProductForm
        key={product.id}
        mode="edit"
        initialValues={productToFormValues(product)}
        categories={categories.data}
        onSubmit={save}
        onCancel={() => router.push(`/admin/products/${product.slug}`)}
      />
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Edit product" description={product?.name ?? 'Update product details'}>
        {product && (
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/shop/${product.id}`} target="_blank" rel="noopener noreferrer">
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

export default function AdminProductEditPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EditProduct />
      </AdminLayout>
    </ProtectedRoute>
  );
}
