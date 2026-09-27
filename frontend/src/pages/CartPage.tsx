import { useState } from 'react';
import { useRouter } from '@/router/compat';
import { ArrowRight, Heart, Lock, RotateCcw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { FeatureItem } from '@/components/ui/typography';
import { CartLineItem } from '@/components/cart/CartLineItem';
import { CouponForm } from '@/components/cart/CouponForm';
import { FreeShippingProgress } from '@/components/cart/FreeShippingProgress';
import { OrderSummary, type SummaryLine } from '@/components/cart/OrderSummary';
import { useCartStore, type CartItem } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { couponsApi } from '@/lib/api';
import { formatRwf } from '@/lib/pricing';
import { Coupon } from '@/types/api';

interface AppliedCoupon {
  discount: number;
  coupon: Coupon;
}

const FREE_SHIPPING_THRESHOLD = 100000;
const STANDARD_SHIPPING = 5000;
const TAX_RATE = 0.18;

export default function CartPage() {
  const router = useRouter();
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount ?? 0;
  const isFreeShippingCoupon = appliedCoupon?.coupon.discountType === 'FREE_SHIPPING';
  const shipping =
    isFreeShippingCoupon || subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipping + tax;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = async (code: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to apply a coupon');
      router.push('/login');
      return;
    }

    try {
      setIsApplyingCoupon(true);
      const result = await couponsApi.validate(code, subtotal);
      if (!result.valid || !result.coupon) {
        toast.error(result.message || 'Invalid coupon code');
        return;
      }
      setAppliedCoupon({ discount: result.discount ?? 0, coupon: result.coupon });
      toast.success(`Coupon "${result.coupon.code}" applied!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to validate coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.id, item.size, item.color);
    toast(`${item.name} removed`, { action: { label: 'Undo', onClick: () => addItem(item) } });
  };

  const handleClear = () => {
    const snapshot = [...items];
    clearCart();
    toast('Cart cleared', {
      action: { label: 'Undo', onClick: () => snapshot.forEach((item) => addItem(item)) },
    });
  };

  const discountLabel = () => {
    if (appliedCoupon?.coupon.discountType === 'PERCENTAGE') {
      return `Discount (${appliedCoupon.coupon.discountValue}%)`;
    }
    if (appliedCoupon?.coupon.discountType === 'FIXED_AMOUNT') return 'Discount';
    return null;
  };

  const lines: SummaryLine[] = [
    {
      id: 'subtotal',
      label: `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`,
      value: formatRwf(subtotal),
    },
    ...(discountLabel() && discount > 0
      ? [
          {
            id: 'discount',
            label: discountLabel(),
            value: `−${formatRwf(discount)}`,
            tone: 'positive' as const,
          },
        ]
      : []),
    {
      id: 'shipping',
      label: 'Shipping',
      value: shipping === 0 ? 'Free' : formatRwf(shipping),
      tone: shipping === 0 ? ('positive' as const) : ('default' as const),
    },
    { id: 'tax', label: 'Tax (18%)', value: formatRwf(tax) },
  ];

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-20">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-24">
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Looks like you haven't added anything yet. Explore the collection and find something you love."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                    <Link href="/shop">Start shopping</Link>
                  </Button>
                  {isAuthenticated && (
                    <Button asChild variant="outline" className="gap-2">
                      <Link href="/account/wishlist">
                        <Heart className="h-4 w-4" />
                        View wishlist
                      </Link>
                    </Button>
                  )}
                </div>
              }
            />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-background pt-20 pb-24 lg:pb-0">
        <PageHeader
          title="Your cart"
          description={`${itemCount} ${itemCount === 1 ? 'item' : 'items'} ready for checkout`}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: 'Cart' },
          ]}
        />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
            <section aria-label="Cart items">
              <FreeShippingProgress
                subtotal={subtotal}
                threshold={FREE_SHIPPING_THRESHOLD}
                unlocked={shipping === 0}
                className="mb-8"
              />

              <ul className="divide-y">
                {items.map((item) => (
                  <CartLineItem
                    key={`${item.id}-${item.size}-${item.color}`}
                    item={item}
                    onQuantityChange={(quantity) =>
                      updateQuantity(item.id, item.size, item.color, quantity)
                    }
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-accent-rose"
                >
                  <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
                  Continue shopping
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground"
                >
                  Clear cart
                </Button>
              </div>
            </section>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <OrderSummary
                lines={lines}
                total={total}
                footer={
                  <div className="space-y-5">
                    <Button
                      asChild
                      size="lg"
                      className="h-12 w-full gap-2 bg-accent-rose text-[15px] hover:bg-accent-rose-dark"
                    >
                      <Link href="/checkout">
                        <Lock className="h-4 w-4" />
                        Checkout
                      </Link>
                    </Button>
                    <div className="grid gap-3 border-t pt-5">
                      <FeatureItem
                        icon={Lock}
                        title="Secure checkout"
                        description="Protected payment"
                      />
                      <FeatureItem
                        icon={RotateCcw}
                        title="Easy returns"
                        description="30-day return policy"
                      />
                    </div>
                  </div>
                }
              >
                <CouponForm
                  appliedCode={appliedCoupon?.coupon.code}
                  isApplying={isApplyingCoupon}
                  hint={appliedCoupon ? undefined : 'Try code: WELCOME10'}
                  onApply={handleApplyCoupon}
                  onRemove={() => setAppliedCoupon(null)}
                />
              </OrderSummary>
            </aside>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-semibold tabular-nums">{formatRwf(total)}</p>
            </div>
            <Button asChild className="h-11 gap-2 bg-accent-rose px-6 hover:bg-accent-rose-dark">
              <Link href="/checkout">
                <Lock className="h-4 w-4" />
                Checkout
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
