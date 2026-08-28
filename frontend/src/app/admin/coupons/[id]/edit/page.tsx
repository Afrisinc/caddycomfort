'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CouponForm, CouponFormValues, EMPTY_COUPON_FORM, isoToDatetimeLocal } from '@/components/admin/CouponForm';
import { couponsApi, CreateCouponData } from '@/lib/api/coupons';
import { toast } from 'sonner';

interface EditCouponPageProps {
  params: Promise<{ id: string }>;
}

function EditCouponForm({ id }: { id: string }) {
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<CouponFormValues>(EMPTY_COUPON_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    couponsApi
      .getById(id)
      .then((coupon) => {
        setInitialValues({
          code: coupon.code,
          description: coupon.description || '',
          discountType: coupon.discountType,
          discountValue: coupon.discountType === 'FREE_SHIPPING' ? '' : String(coupon.discountValue),
          maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : '',
          minPurchaseAmount: coupon.minPurchaseAmount != null ? String(coupon.minPurchaseAmount) : '',
          usageLimit: coupon.usageLimit != null ? String(coupon.usageLimit) : '',
          perUserLimit: coupon.perUserLimit != null ? String(coupon.perUserLimit) : '',
          validFrom: isoToDatetimeLocal(coupon.validFrom),
          validUntil: isoToDatetimeLocal(coupon.validUntil),
          isActive: coupon.isActive,
        });
      })
      .catch((error: any) => {
        toast.error(error.message || 'Failed to load coupon');
        router.push('/admin/coupons');
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleSubmit = async (data: CreateCouponData) => {
    try {
      setIsSubmitting(true);
      await couponsApi.update(id, data);
      toast.success('Coupon updated successfully!');
      router.push('/admin/coupons');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-rose" />
      </div>
    );
  }

  return (
    <CouponForm
      title="Edit Coupon"
      description="Update this coupon's details"
      initialValues={initialValues}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
}

export default function EditCouponPage({ params }: EditCouponPageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute requireAdmin>
      <AdminLayout>
        <EditCouponForm id={id} />
      </AdminLayout>
    </ProtectedRoute>
  );
}
