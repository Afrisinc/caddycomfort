import { useState } from 'react';
import { useRouter } from '@/router/compat';
import { Save, X, Percent, DollarSign } from 'lucide-react';
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
import { AdminHeader } from '@/components/admin/AdminHeader';
import { CreateCouponData } from '@/lib/api/coupons';
import { toast } from 'sonner';

export interface CouponFormValues {
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: string;
  maxDiscountAmount: string;
  minPurchaseAmount: string;
  usageLimit: string;
  perUserLimit: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

export const EMPTY_COUPON_FORM: CouponFormValues = {
  code: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  maxDiscountAmount: '',
  minPurchaseAmount: '',
  usageLimit: '',
  perUserLimit: '',
  validFrom: '',
  validUntil: '',
  isActive: true,
};

/** Backend stores full ISO datetimes; <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm". */
export function isoToDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

interface CouponFormProps {
  title: string;
  description: string;
  initialValues: CouponFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (data: CreateCouponData) => Promise<void>;
}

export function CouponForm({
  title,
  description,
  initialValues,
  submitLabel,
  isSubmitting,
  onSubmit,
}: CouponFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<CouponFormValues>(initialValues);

  const set = <K extends keyof CouponFormValues>(key: K, value: CouponFormValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.code.trim()) {
      toast.error('Coupon code is required');
      return;
    }

    const discountValue = parseFloat(form.discountValue);
    if (
      form.discountType !== 'FREE_SHIPPING' &&
      (!form.discountValue || isNaN(discountValue) || discountValue <= 0)
    ) {
      toast.error('Enter a valid discount value');
      return;
    }
    if (form.discountType === 'PERCENTAGE' && discountValue > 100) {
      toast.error('Percentage discount cannot exceed 100%');
      return;
    }

    if (
      form.validFrom &&
      form.validUntil &&
      new Date(form.validFrom) >= new Date(form.validUntil)
    ) {
      toast.error('Start date must be before end date');
      return;
    }

    const data: CreateCouponData = {
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || undefined,
      discountType: form.discountType,
      // The backend requires discountValue > 0 even for FREE_SHIPPING (the
      // value itself is unused for that type, but must pass validation).
      discountValue: form.discountType === 'FREE_SHIPPING' ? 1 : discountValue,
      maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : undefined,
      minPurchaseAmount: form.minPurchaseAmount ? parseFloat(form.minPurchaseAmount) : undefined,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
      perUserLimit: form.perUserLimit ? parseInt(form.perUserLimit, 10) : undefined,
      validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
      validUntil: form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
      isActive: form.isActive,
    };

    await onSubmit(data);
  };

  const discountPreview =
    form.discountType === 'FREE_SHIPPING'
      ? 'Free shipping'
      : form.discountType === 'PERCENTAGE'
        ? `${form.discountValue || 0}%${form.maxDiscountAmount ? ` (max Rwf ${Number(form.maxDiscountAmount).toLocaleString()})` : ''}`
        : `Rwf ${Number(form.discountValue || 0).toLocaleString()}`;

  return (
    <form onSubmit={handleSubmit} className="min-h-screen bg-muted/30">
      <AdminHeader title={title} description={description}>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/coupons')}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-accent-rose hover:bg-accent-rose-dark"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </AdminHeader>

      <div className="px-4 sm:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="couponCode">Coupon Code *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="couponCode"
                        placeholder="e.g., SUMMER2024"
                        className="uppercase"
                        value={form.code}
                        onChange={(e) => set('code', e.target.value.toUpperCase())}
                        disabled={isSubmitting}
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => set('code', generateCode())}
                        disabled={isSubmitting}
                      >
                        Generate
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Customers will enter this code at checkout
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="e.g., Save 20% on all summer items"
                      rows={3}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Shown to customers when they apply the coupon
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Discount Value */}
              <Card>
                <CardHeader>
                  <CardTitle>Discount Value</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={form.discountType}
                      onValueChange={(v) =>
                        set('discountType', v as CouponFormValues['discountType'])
                      }
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="discountType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage Discount</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Fixed Amount Discount</SelectItem>
                        <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.discountType === 'PERCENTAGE' && (
                    <>
                      <div>
                        <Label htmlFor="percentValue">Discount Percentage *</Label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="percentValue"
                            type="number"
                            placeholder="10"
                            className="pl-10"
                            min="0"
                            max="100"
                            value={form.discountValue}
                            onChange={(e) => set('discountValue', e.target.value)}
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="maxDiscount">Maximum Discount Amount (RWF)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="maxDiscount"
                            type="number"
                            placeholder="50000"
                            className="pl-10"
                            value={form.maxDiscountAmount}
                            onChange={(e) => set('maxDiscountAmount', e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Optional: cap the maximum discount amount
                        </p>
                      </div>
                    </>
                  )}

                  {form.discountType === 'FIXED_AMOUNT' && (
                    <div>
                      <Label htmlFor="fixedValue">Discount Amount (RWF) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="fixedValue"
                          type="number"
                          placeholder="5000"
                          className="pl-10"
                          value={form.discountValue}
                          onChange={(e) => set('discountValue', e.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {form.discountType === 'FREE_SHIPPING' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-900">
                        Free shipping will be applied to all qualifying orders
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Usage Restrictions */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Restrictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="minPurchase">Minimum Purchase Amount (RWF)</Label>
                    <Input
                      id="minPurchase"
                      type="number"
                      placeholder="0"
                      value={form.minPurchaseAmount}
                      onChange={(e) => set('minPurchaseAmount', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum order value to use this coupon
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Limits */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Limits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="totalUsageLimit">Total Usage Limit</Label>
                    <Input
                      id="totalUsageLimit"
                      type="number"
                      placeholder="Unlimited"
                      value={form.usageLimit}
                      onChange={(e) => set('usageLimit', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum number of times this coupon can be used overall
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="perUserLimit">Per Customer Usage Limit</Label>
                    <Input
                      id="perUserLimit"
                      type="number"
                      placeholder="Unlimited"
                      value={form.perUserLimit}
                      onChange={(e) => set('perUserLimit', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum uses per customer (e.g. 1 for one-time-only)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Validity Period */}
              <Card>
                <CardHeader>
                  <CardTitle>Validity Period</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="startDate">Start Date &amp; Time</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={form.validFrom}
                      onChange={(e) => set('validFrom', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to start immediately
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date &amp; Time</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={form.validUntil}
                      onChange={(e) => set('validUntil', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty for no expiration
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Inactive coupons can&apos;t be redeemed
                      </p>
                    </div>
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(v) => set('isActive', v)}
                      disabled={isSubmitting}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="font-mono font-medium">{form.code || '—'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium">{discountPreview}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span
                      className={`font-medium ${form.isActive ? 'text-green-600' : 'text-muted-foreground'}`}
                    >
                      {form.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid:</span>
                    <span className="font-medium text-right">
                      {form.validFrom || form.validUntil
                        ? `${form.validFrom ? new Date(form.validFrom).toLocaleDateString() : 'now'} – ${
                            form.validUntil
                              ? new Date(form.validUntil).toLocaleDateString()
                              : 'no expiry'
                          }`
                        : 'Always'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
