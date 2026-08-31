import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from '@/router/compat';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  CouponForm,
  CouponFormValues,
  EMPTY_COUPON_FORM,
  isoToDatetimeLocal,
} from '@/components/admin/CouponForm';
import { couponsApi, CreateCouponData } from '@/lib/api/coupons';
import { toast } from 'sonner';

function CreateCouponContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get('duplicate');

  const [initialValues, setInitialValues] = useState<CouponFormValues>(EMPTY_COUPON_FORM);
  const [isLoadingSource, setIsLoadingSource] = useState(!!duplicateId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!duplicateId) return;
    couponsApi
      .getById(duplicateId)
      .then((coupon) => {
        setInitialValues({
          code: '',
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue:
            coupon.discountType === 'FREE_SHIPPING' ? '' : String(coupon.discountValue),
          maxDiscountAmount:
            coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
          minPurchaseAmount:
            coupon.minPurchaseAmount != null ? String(coupon.minPurchaseAmount) : '',
          usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
          perUserLimit: coupon.perUserLimit != null ? String(coupon.perUserLimit) : '',
          validFrom: isoToDatetimeLocal(coupon.validFrom),
          validUntil: isoToDatetimeLocal(coupon.validUntil),
          isActive: coupon.isActive,
        });
      })
      .catch((error: any) => {
        toast.error(error.message || 'Failed to load coupon to duplicate');
      })
      .finally(() => setIsLoadingSource(false));
  }, [duplicateId]);

  const handleSubmit = async (data: CreateCouponData) => {
    try {
      setIsSubmitting(true);
      await couponsApi.create(data);
      toast.success('Coupon created successfully!');
      router.push('/admin/coupons');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingSource) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
      </div>
    );
  }

  return (
    <CouponForm
      title={duplicateId ? 'Duplicate Coupon' : 'Create New Coupon'}
      description="Set up a discount coupon for your customers"
      initialValues={initialValues}
      submitLabel="Create Coupon"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}

export default function CreateCouponPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <Suspense fallback={null}>
          <CreateCouponContent />
        </Suspense>
      </AdminLayout>
    </ProtectedRoute>
  );
}
