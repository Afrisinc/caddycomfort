import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GalleryHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/router/compat';
import Link from '@/components/common/Link';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { HeroBannerForm } from '@/components/admin/HeroBannerForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncData } from '@/hooks/useAsyncData';
import { categoriesApi, heroBannersApi, type HeroBannerPayload } from '@/lib/api';
import { heroBannerToFormValues, linkOptions } from '@/lib/heroBannerForm';
import type { Category, HeroBanner } from '@/types/api';

const NO_CATEGORIES: Category[] = [];
const NO_BANNER: HeroBanner | null = null;

function EditBanner() {
  const { id = '' } = useParams<{ id: string }>();
  const router = useRouter();
  const loadBanner = useCallback(() => heroBannersApi.getById(id), [id]);
  const banner = useAsyncData<HeroBanner | null>(loadBanner, NO_BANNER);
  const categories = useAsyncData(categoriesApi.getAll, NO_CATEGORIES);
  const choices = useMemo(() => linkOptions(categories.data), [categories.data]);
  const loading = banner.loading || categories.loading;

  const save = async (payload: HeroBannerPayload) => {
    try {
      await heroBannersApi.update(id, payload);
      toast.success('Slide saved');
    } catch (error: any) {
      toast.error(error.message || 'Could not save the slide');
      throw error;
    }
  };

  const renderBody = () => {
    if (loading) {
      return (
        <div className="max-w-3xl space-y-6" aria-hidden="true">
          {[260, 200, 220].map((height) => (
            <Skeleton key={height} className="w-full rounded-2xl" style={{ height }} />
          ))}
        </div>
      );
    }
    if (!banner.data) {
      return (
        <EmptyState
          icon={GalleryHorizontal}
          title="Slide not found"
          description="It may have been deleted."
          action={
            <Button asChild variant="outline">
              <Link href="/admin/banners">Back to banners</Link>
            </Button>
          }
        />
      );
    }
    return (
      <HeroBannerForm
        key={banner.data.id}
        mode="edit"
        initialValues={heroBannerToFormValues(banner.data, choices)}
        linkChoices={choices}
        onSubmit={save}
        onCancel={() => router.push('/admin/banners')}
      />
    );
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader title="Edit slide" description={banner.data?.title ?? 'Update this banner'} />
      <div className="px-4 py-8 sm:px-8">{renderBody()}</div>
    </div>
  );
}

export default function AdminBannerEditPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EditBanner />
      </AdminLayout>
    </ProtectedRoute>
  );
}
