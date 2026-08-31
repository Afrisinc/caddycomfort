import { useState } from 'react';
import { useRouter } from '@/router/compat';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Tag, Loader2 } from 'lucide-react';
import Image from '@/components/common/Image';
import Link from '@/components/common/Link';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { couponsApi } from '@/lib/api';
import { Coupon } from '@/types/api';
import { toast } from 'sonner';

interface AppliedCoupon {
  discount: number;
  coupon: Coupon;
}

const FREE_SHIPPING_THRESHOLD = 100000;
const STANDARD_SHIPPING = 5000;
const TAX_RATE = 0.18;

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount ?? 0;
  const isFreeShippingCoupon = appliedCoupon?.coupon.discountType === 'FREE_SHIPPING';
  const shipping =
    isFreeShippingCoupon || subtotal > FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const tax = (subtotal - discount) * TAX_RATE;
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;

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

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const discountLabel = appliedCoupon
    ? appliedCoupon.coupon.discountType === 'PERCENTAGE'
      ? `Discount (${appliedCoupon.coupon.discountValue}%)`
      : appliedCoupon.coupon.discountType === 'FIXED_AMOUNT'
        ? 'Discount'
        : null
    : null;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-md mx-auto">
              <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
              <h1 className="text-3xl font-serif mb-4">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Looks like you haven&apos;t added anything to your cart yet.
              </p>
              <Link href="/shop">
                <Button size="lg" className="bg-accent-rose hover:bg-accent-rose-dark">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <h1 className="text-4xl font-serif mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}-${item.color}`}
                  className="flex gap-4 bg-card border rounded-lg p-4"
                >
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-base font-semibold truncate">{item.name}</h3>
                        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                          <span>Size: {item.size}</span>
                          <span>•</span>
                          <span>Color: {item.color}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(item.id, item.size, item.color)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.size,
                              item.color,
                              Math.max(1, item.quantity - 1),
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.color, item.quantity + 1)
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold">
                        Rwf {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
                <Link href="/shop">
                  <Button variant="outline">Continue Shopping</Button>
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border rounded-lg p-6 sticky top-24">
                <h2 className="text-2xl font-serif mb-6">Order Summary</h2>

                {/* Coupon Code */}
                <div className="mb-6">
                  <label className="text-sm font-semibold mb-2 block">Coupon Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                      disabled={!!appliedCoupon || isApplyingCoupon}
                    />
                    <Button
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!!appliedCoupon || isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-500">
                        Coupon &quot;{appliedCoupon.coupon.code}&quot; applied!
                      </Badge>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-xs text-muted-foreground hover:text-destructive underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2">
                      Try code: <span className="font-mono font-semibold">WELCOME10</span>
                    </p>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rwf {subtotal.toLocaleString()}</span>
                  </div>
                  {discountLabel && discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{discountLabel}</span>
                      <span>-Rwf {discount.toLocaleString()}</span>
                    </div>
                  )}
                  {isFreeShippingCoupon && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Free shipping coupon</span>
                      <span>Applied</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Free
                        </Badge>
                      ) : (
                        `Rwf ${shipping.toLocaleString()}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span>Rwf {tax.toLocaleString()}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-semibold mb-6">
                  <span>Total</span>
                  <span>Rwf {total.toLocaleString()}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Add Rwf {(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString()} more for free
                    shipping
                  </p>
                )}

                <Link href="/checkout">
                  <Button size="lg" className="w-full bg-accent-rose hover:bg-accent-rose-dark">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
