import { useMemo } from 'react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { HeroBannerForm } from '@/components/admin/HeroBannerForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi, heroBannersApi, type HeroBannerPayload } from '@/lib/api';
import { EMPTY_HERO_VALUES, linkOptions } from '@/lib/heroBannerForm';
import type { Category } from '@/types/api';

const NO_CATEGORIES: Category[] = [];

function AddBanner() {
  const router = useRouter();
  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);
  const choices = useMemo(() => linkOptions(categories.data), [categories.data]);

  const create = async (payload: HeroBannerPayload) => {
    try {
      await heroBannersApi.create(payload);
      toast.success('Slide added');
      router.push('/admin/banners');
    } catch (error: any) {
      toast.error(error.message || 'Could not add the slide');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Add slide" description="Create a new banner for the home page" />
      <div className="px-4 py-8 sm:px-8">
        <HeroBannerForm
          mode="create"
          initialValues={EMPTY_HERO_VALUES}
          linkChoices={choices}
          onSubmit={create}
          onCancel={() => router.push('/admin/banners')}
        />
      </div>
    </div>
  );
}

export default function AdminBannerNewPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <AddBanner />
      </AdminLayout>
    </ProtectedRoute>
  );
}
