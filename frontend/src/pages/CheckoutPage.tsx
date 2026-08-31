import { useRef, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Check,
  CreditCard,
  Truck,
  Lock,
  ChevronLeft,
  MapPin,
  Wallet,
  Loader2,
  Smartphone,
} from 'lucide-react';
import Image from '@/components/common/Image';
import Link from '@/components/common/Link';
import { useRouter } from '@/router/compat';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';
import { cartApi, ordersApi, paymentApi } from '@/lib/api';
import { PaymentMethod } from '@/types/api';

type Step = 'shipping' | 'payment' | 'review';
type UiPaymentMethod = 'card' | 'momo' | 'cod';

const PAYMENT_METHOD_MAP: Record<UiPaymentMethod, PaymentMethod> = {
  card: 'CREDIT_CARD',
  momo: 'MOBILE_MONEY',
  cod: 'CASH_ON_DELIVERY',
};

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 30;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [currentStep, setCurrentStep] = useState<Step>('shipping');
  const [saveInfo, setSaveInfo] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAwaitingMobileApproval, setIsAwaitingMobileApproval] = useState(false);
  const cancelPollRef = useRef(false);

  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<UiPaymentMethod>('card');
  const [momoNumber, setMomoNumber] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 100000 ? 0 : 5000;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const steps = [
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'review', label: 'Review', icon: Check },
  ];

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !shippingData.firstName ||
      !shippingData.lastName ||
      !shippingData.email ||
      !shippingData.phone ||
      !shippingData.address ||
      !shippingData.city
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCurrentStep('payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'momo' && !momoNumber) {
      toast.error('Please enter your Mobile Money number');
      return;
    }

    setCurrentStep('review');
  };

  const pollMobilePaymentStatus = async (orderId: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      if (cancelPollRef.current) return;

      await sleep(POLL_INTERVAL_MS);
      if (cancelPollRef.current) return;

      try {
        const status = await paymentApi.getStatus(orderId);

        if (status.status === 'SUCCESSFUL') {
          toast.success('Payment received! Order placed successfully.');
          router.push('/account/orders');
          return;
        }

        if (status.status === 'FAILED') {
          toast.error('Payment failed. You can retry from your orders page.');
          router.push('/account/orders');
          return;
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to check payment status');
        router.push('/account/orders');
        return;
      }
    }

    toast.info('Still waiting for approval. Check your orders page for the latest status.');
    router.push('/account/orders');
  };

  const handlePlaceOrder = async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      toast.error('Please log in to place your order');
      router.push('/login');
      return;
    }

    setIsPlacingOrder(true);

    try {
      await cartApi.mergeGuestCart(
        items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      );

      const order = await ordersApi.create({
        shippingAddress: {
          street: shippingData.address,
          city: shippingData.city,
          state: shippingData.province || shippingData.city,
          postalCode: shippingData.postalCode || '00000',
          country: 'Rwanda',
          firstName: shippingData.firstName,
          lastName: shippingData.lastName,
          email: shippingData.email,
          phone: shippingData.phone,
        },
        paymentMethod: PAYMENT_METHOD_MAP[paymentMethod],
      });

      clearCart();

      if (paymentMethod === 'cod') {
        toast.success('Order placed successfully!');
        router.push('/account/orders');
        return;
      }

      const result = await paymentApi.initiate(order.id, {
        email: shippingData.email,
        phoneNumber: paymentMethod === 'momo' ? momoNumber : undefined,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
      });

      if (result.method === 'CARD' && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }

      if (result.method === 'MOBILE_MONEY') {
        cancelPollRef.current = false;
        setIsAwaitingMobileApproval(true);
        await pollMobilePaymentStatus(order.id);
        return;
      }

      router.push('/account/orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsPlacingOrder(false);
      setIsAwaitingMobileApproval(false);
    }
  };

  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep);
  };

  if (isAwaitingMobileApproval) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="h-16 w-16 rounded-full bg-accent-rose-subtle flex items-center justify-center mx-auto mb-6">
              <Smartphone className="h-8 w-8 text-accent-rose animate-pulse" />
            </div>
            <h1 className="text-2xl font-serif mb-3">Approve the Payment</h1>
            <p className="text-muted-foreground mb-6">
              A payment request was sent to {momoNumber}. Approve it on your phone to complete the
              order.
            </p>
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-accent-rose" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-md mx-auto">
              <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
              <p className="text-muted-foreground mb-8">
                Add some items to your cart before checking out.
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
          <Link
            href="/cart"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Cart
          </Link>

          <h1 className="text-4xl font-serif mb-8">Checkout</h1>

          {/* Progress Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < getCurrentStepIndex();

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          isCompleted
                            ? 'bg-accent-rose border-accent-rose text-white'
                            : isActive
                              ? 'border-accent-rose text-accent-rose'
                              : 'border-muted-foreground/30 text-muted-foreground'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <StepIcon className="h-6 w-6" />
                        )}
                      </div>
                      <span
                        className={`text-sm mt-2 font-medium ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-4 ${
                          isCompleted ? 'bg-accent-rose' : 'bg-muted-foreground/30'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <form onSubmit={handleShippingSubmit} className="space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="h-5 w-5 text-accent-rose" />
                      <h2 className="text-2xl font-serif">Shipping Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          required
                          value={shippingData.firstName}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, firstName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          required
                          value={shippingData.lastName}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, lastName: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={shippingData.email}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, email: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          required
                          value={shippingData.phone}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, phone: e.target.value })
                          }
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          required
                          value={shippingData.address}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, address: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          required
                          value={shippingData.city}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Input
                          id="province"
                          value={shippingData.province}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, province: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={shippingData.postalCode}
                          onChange={(e) =>
                            setShippingData({ ...shippingData, postalCode: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value="Rwanda" disabled />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mt-6">
                      <Checkbox
                        id="saveInfo"
                        checked={saveInfo}
                        onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
                      />
                      <label
                        htmlFor="saveInfo"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Save this information for next time
                      </label>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent-rose hover:bg-accent-rose-dark"
                  >
                    Continue to Payment
                  </Button>
                </form>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <CreditCard className="h-5 w-5 text-accent-rose" />
                      <h2 className="text-2xl font-serif">Payment Method</h2>
                    </div>

                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value as UiPaymentMethod)}
                    >
                      <div className="space-y-4">
                        {/* Credit Card */}
                        <div className="flex items-start space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value="card" id="card" />
                          <div className="flex-1">
                            <Label htmlFor="card" className="font-semibold cursor-pointer">
                              Credit / Debit Card
                            </Label>
                            {paymentMethod === 'card' && (
                              <p className="text-sm text-muted-foreground mt-2">
                                You&apos;ll be redirected to a secure payment page to enter your
                                card details.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Mobile Money */}
                        <div className="flex items-start space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value="momo" id="momo" />
                          <div className="flex-1">
                            <Label htmlFor="momo" className="font-semibold cursor-pointer">
                              Mobile Money
                            </Label>
                            {paymentMethod === 'momo' && (
                              <div className="mt-4">
                                <Label htmlFor="momoNumber">Phone Number</Label>
                                <Input
                                  id="momoNumber"
                                  placeholder="078X XXX XXX"
                                  value={momoNumber}
                                  onChange={(e) => setMomoNumber(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Cash on Delivery */}
                        <div className="flex items-start space-x-3 border rounded-lg p-4">
                          <RadioGroupItem value="cod" id="cod" />
                          <div className="flex-1">
                            <Label htmlFor="cod" className="font-semibold cursor-pointer">
                              Cash on Delivery
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Pay with cash when your order is delivered
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="flex items-center gap-2 mt-6 p-4 bg-muted/50 rounded-lg">
                      <Lock className="h-4 w-4 text-accent-rose" />
                      <span className="text-sm text-muted-foreground">
                        Your payment information is secure and encrypted
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setCurrentStep('shipping')}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1 bg-accent-rose hover:bg-accent-rose-dark"
                    >
                      Review Order
                    </Button>
                  </div>
                </form>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div className="space-y-6">
                  {/* Shipping Details */}
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif">Shipping Address</h2>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep('shipping')}>
                        Edit
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">
                        {shippingData.firstName} {shippingData.lastName}
                      </p>
                      <p>{shippingData.address}</p>
                      <p>
                        {shippingData.city}
                        {shippingData.province && `, ${shippingData.province}`}
                        {shippingData.postalCode && ` ${shippingData.postalCode}`}
                      </p>
                      <p>{shippingData.email}</p>
                      <p>{shippingData.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif">Payment Method</h2>
                      <Button variant="ghost" size="sm" onClick={() => setCurrentStep('payment')}>
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm">
                      {paymentMethod === 'card' && 'Credit/Debit Card'}
                      {paymentMethod === 'momo' && `Mobile Money (${momoNumber})`}
                      {paymentMethod === 'cod' && 'Cash on Delivery'}
                    </p>
                  </div>

                  {/* Order Items */}
                  <div className="bg-card border rounded-lg p-6">
                    <h2 className="text-xl font-serif mb-4">Order Items</h2>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4">
                          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              Size: {item.size} • Color: {item.color}
                            </p>
                            <p className="text-sm font-medium mt-1">
                              Qty: {item.quantity} × Rwf {item.price.toLocaleString()}
                            </p>
                          </div>
                          <p className="font-semibold">
                            Rwf {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => setCurrentStep('payment')}
                      disabled={isPlacingOrder}
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 bg-accent-rose hover:bg-accent-rose-dark"
                      onClick={handlePlaceOrder}
                      disabled={isPlacingOrder}
                    >
                      {isPlacingOrder ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Place Order'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border rounded-lg p-6 sticky top-24">
                <h2 className="text-2xl font-serif mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>Rwf {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `Rwf ${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span>Rwf {tax.toLocaleString()}</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>Rwf {total.toLocaleString()}</span>
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
