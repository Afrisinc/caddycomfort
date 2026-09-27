import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Banknote,
  CreditCard,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MapPin,
  ShoppingBag,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import Link from '@/components/common/Link';
import { EmptyState } from '@/components/common/EmptyState';
import { ReviewBlock } from '@/components/common/ReviewBlock';
import { Button } from '@/components/ui/button';
import { RadioCardGroup, type RadioCardOption } from '@/components/ui/radio-card-group';
import { Stepper } from '@/components/ui/stepper';
import { Heading } from '@/components/ui/typography';
import { OrderSummary, type SummaryLine } from '@/components/cart/OrderSummary';
import { OrderItemsList } from '@/components/checkout/OrderItemsList';
import { PaymentStatusPanel } from '@/components/checkout/PaymentStatusPanel';
import { MomoNumberField } from '@/components/checkout/MomoNumberField';
import { DepositBreakdown } from '@/components/checkout/DepositBreakdown';
import { ChipGroup } from '@/components/ui/option-group';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { usePayment } from '@/hooks/usePayment';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { addressesApi, cartApi, ordersApi } from '@/lib/api';
import { formatRwf } from '@/lib/pricing';
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_MAP,
  DEPOSIT_CHANNEL_LABELS,
  DEPOSIT_CHANNEL_MAP,
  calculateDeposit,
  type DepositChannel,
  calculateTotals,
  isValidRwandaPhone,
  normalizePhone,
  type CheckoutPaymentMethod,
  type ShippingDetails,
} from '@/lib/checkout';
import type { Address, Order } from '@/types/api';

type Step = 'shipping' | 'payment' | 'review';

const STEPS = [
  { id: 'shipping', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

function Page({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-24 pb-20 md:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, clearCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();
  const payment = usePayment();

  const [shipping, setShipping] = useState<ShippingDetails | null>(null);
  const [method, setMethod] = useState<CheckoutPaymentMethod>('card');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoError, setMomoError] = useState<string>();
  const [depositChannel, setDepositChannel] = useState<DepositChannel>('momo');
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isPlacing, setIsPlacing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const requested = (searchParams.get('step') as Step) || 'shipping';
  const step: Step = !shipping ? 'shipping' : requested;

  const goTo = (next: Step) => {
    setSearchParams(next === 'shipping' ? {} : { step: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    addressesApi
      .getAll()
      .then(setSavedAddresses)
      .catch(() => {});
  }, [isAuthenticated]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totals = calculateTotals(subtotal);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isCod = method === 'cod';
  const usesMomo = method === 'momo' || (isCod && depositChannel === 'momo');
  const deposit = calculateDeposit(totals.total);
  const balance = totals.total - deposit;

  const initialShipping = useMemo<ShippingDetails>(
    () =>
      shipping ?? {
        firstName: user?.firstName ?? '',
        lastName: user?.lastName ?? '',
        email: user?.email ?? '',
        phone: user?.phone ?? '',
        address: '',
        city: '',
        province: '',
        postalCode: '',
      },
    [shipping, user],
  );

  const handleShippingSubmit = (details: ShippingDetails, saveAddress: boolean) => {
    setShipping(details);
    if (!momoNumber) setMomoNumber(details.phone);
    if (saveAddress) {
      addressesApi
        .create({
          fullName: `${details.firstName} ${details.lastName}`.trim(),
          phone: normalizePhone(details.phone),
          addressLine1: details.address,
          addressLine2: null,
          city: details.city,
          state: details.province || details.city,
          postalCode: details.postalCode || '00000',
          country: 'Rwanda',
          isDefault: savedAddresses.length === 0,
        })
        .then((created) => setSavedAddresses((list) => [...list, created]))
        .catch(() => toast.error('We could not save the address, but you can still continue.'));
    }
    goTo('payment');
  };

  const handlePaymentContinue = () => {
    if (usesMomo && !isValidRwandaPhone(momoNumber)) {
      setMomoError('Enter your MTN or Airtel number, e.g. 078 123 4567');
      document.getElementById('momo-number')?.focus();
      return;
    }
    setMomoError(undefined);
    goTo('review');
  };

  const startPayment = (placed: Order) =>
    payment.start(placed.id, {
      email: shipping?.email,
      phoneNumber: usesMomo ? normalizePhone(momoNumber) : undefined,
      customerName: `${shipping?.firstName ?? ''} ${shipping?.lastName ?? ''}`.trim(),
    });

  const handlePlaceOrder = async () => {
    if (!shipping) return;
    setIsPlacing(true);
    try {
      await cartApi.mergeGuestCart(
        items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
      );
      const placed = await ordersApi.create({
        shippingAddress: {
          street: shipping.address,
          city: shipping.city,
          state: shipping.province || shipping.city,
          postalCode: shipping.postalCode || '00000',
          country: 'Rwanda',
          firstName: shipping.firstName,
          lastName: shipping.lastName,
          email: shipping.email,
          phone: normalizePhone(shipping.phone),
        },
        paymentMethod: PAYMENT_METHOD_MAP[method],
        depositMethod: isCod ? DEPOSIT_CHANNEL_MAP[depositChannel] : undefined,
      });
      clearCart();
      setOrder(placed);

      await startPayment(placed);
    } catch (error: any) {
      toast.error(error.message || 'We could not place your order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (order && payment.phase !== 'idle') {
    const viewOrder = () => {
      payment.stopWaiting();
      navigate(`/account/orders/${order.id}`);
    };
    const canRetry = payment.phase === 'failed' || payment.phase === 'timed-out';
    return (
      <Page>
        <PaymentStatusPanel
          phase={payment.phase}
          orderNumber={order.orderNumber}
          amount={
            order.paymentMethod === 'CASH_ON_DELIVERY' ? (order.depositAmount ?? 0) : order.total
          }
          balanceDue={
            order.paymentMethod === 'CASH_ON_DELIVERY'
              ? order.total - (order.depositAmount ?? 0)
              : undefined
          }
          phoneNumber={usesMomo ? momoNumber : undefined}
          error={payment.error}
          actions={
            payment.phase === 'redirecting' || payment.phase === 'starting' ? null : (
              <>
                {canRetry && (
                  <Button
                    onClick={() => startPayment(order)}
                    className="bg-accent-rose hover:bg-accent-rose-dark"
                  >
                    Try payment again
                  </Button>
                )}
                <Button variant={canRetry ? 'outline' : 'default'} onClick={viewOrder}>
                  {payment.phase === 'awaiting-approval'
                    ? 'I’ll check later — view order'
                    : 'View order'}
                </Button>
                {payment.phase === 'paid' && (
                  <Button asChild variant="outline">
                    <Link href="/shop">Continue shopping</Link>
                  </Button>
                )}
              </>
            )
          }
        />
      </Page>
    );
  }

  if (!isAuthenticated) {
    return (
      <Page>
        <EmptyState
          icon={LogIn}
          title="Sign in to check out"
          description="Your cart is saved. Sign in or create an account to complete your order and track its delivery."
          action={
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
                <Link href="/login?redirect=/checkout">Sign in to continue</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cart">Back to cart</Link>
              </Button>
            </div>
          }
        />
      </Page>
    );
  }

  if (items.length === 0) {
    return (
      <Page>
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some items to your cart before checking out."
          action={
            <Button asChild className="bg-accent-rose hover:bg-accent-rose-dark">
              <Link href="/shop">Continue shopping</Link>
            </Button>
          }
        />
      </Page>
    );
  }

  const paymentOptions: RadioCardOption<CheckoutPaymentMethod>[] = [
    {
      value: 'card',
      title: PAYMENT_METHOD_LABELS.card,
      description: 'Pay on our payment partner’s secure page.',
      icon: CreditCard,
    },
    {
      value: 'momo',
      title: PAYMENT_METHOD_LABELS.momo,
      description: 'Approve the payment on your phone with your PIN.',
      icon: Smartphone,
      content: (
        <MomoNumberField
          id="momo-number"
          value={momoNumber}
          onChange={(value) => {
            setMomoNumber(value);
            if (momoError) setMomoError(undefined);
          }}
          error={momoError}
        />
      ),
    },
    {
      value: 'cod',
      title: PAYMENT_METHOD_LABELS.cod,
      description:
        'Pay half now by Mobile Money or card, and the rest in cash when your order arrives.',
      icon: Banknote,
      content: (
        <div className="space-y-5">
          <DepositBreakdown deposit={deposit} balance={balance} />
          <ChipGroup
            label="Pay the deposit with"
            value={DEPOSIT_CHANNEL_LABELS[depositChannel]}
            onValueChange={(label) =>
              setDepositChannel(label === DEPOSIT_CHANNEL_LABELS.card ? 'card' : 'momo')
            }
            options={[DEPOSIT_CHANNEL_LABELS.momo, DEPOSIT_CHANNEL_LABELS.card]}
          />
          {depositChannel === 'momo' && (
            <MomoNumberField
              id="momo-number"
              value={momoNumber}
              onChange={(value) => {
                setMomoNumber(value);
                if (momoError) setMomoError(undefined);
              }}
              error={momoError}
            />
          )}
        </div>
      ),
    },
  ];

  const summaryLines: SummaryLine[] = [
    {
      id: 'subtotal',
      label: `Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`,
      value: formatRwf(totals.subtotal),
    },
    {
      id: 'shipping',
      label: 'Shipping',
      value: totals.shipping === 0 ? 'Free' : formatRwf(totals.shipping),
      tone: totals.shipping === 0 ? 'positive' : 'default',
    },
    { id: 'tax', label: 'Tax (18%)', value: formatRwf(totals.tax) },
  ];

  return (
    <Page>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/cart"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to cart
          </Link>
          <Heading as="h1" size="lg" className="mt-2">
            Checkout
          </Heading>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="h-4 w-4 text-emerald-600" />
          Secure checkout
        </p>
      </div>

      <Stepper
        steps={STEPS}
        current={step}
        onStepClick={(id) => goTo(id as Step)}
        className="mb-10 max-w-xl"
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div>
          {step === 'shipping' && (
            <section aria-labelledby="step-title">
              <Heading as="h2" size="sm" id="step-title" className="mb-5">
                Where should we deliver?
              </Heading>
              <ShippingForm
                initial={initialShipping}
                savedAddresses={savedAddresses}
                onSubmit={handleShippingSubmit}
              />
            </section>
          )}

          {step === 'payment' && (
            <section aria-labelledby="step-title" className="space-y-6">
              <Heading as="h2" size="sm" id="step-title">
                How would you like to pay?
              </Heading>
              <RadioCardGroup
                label="Payment method"
                value={method}
                onValueChange={setMethod}
                options={paymentOptions}
              />
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:flex-1"
                  onClick={() => goTo('shipping')}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="h-12 bg-accent-rose hover:bg-accent-rose-dark sm:flex-1"
                  onClick={handlePaymentContinue}
                >
                  Review order
                </Button>
              </div>
            </section>
          )}

          {step === 'review' && shipping && (
            <section aria-labelledby="step-title" className="space-y-4">
              <Heading as="h2" size="sm" id="step-title" className="mb-1">
                Review and place your order
              </Heading>
              <div className="grid gap-4 sm:grid-cols-2">
                <ReviewBlock title="Delivery address" icon={MapPin} onEdit={() => goTo('shipping')}>
                  <p className="font-medium text-foreground">
                    {shipping.firstName} {shipping.lastName}
                  </p>
                  <p>{shipping.address}</p>
                  <p>{[shipping.city, shipping.province].filter(Boolean).join(', ')}, Rwanda</p>
                </ReviewBlock>
                <ReviewBlock title="Contact" icon={Mail} onEdit={() => goTo('shipping')}>
                  <p>{shipping.email}</p>
                  <p>{shipping.phone}</p>
                </ReviewBlock>
              </div>
              <ReviewBlock title="Payment" icon={Wallet} onEdit={() => goTo('payment')}>
                <p className="font-medium text-foreground">
                  {PAYMENT_METHOD_LABELS[method]}
                  {usesMomo && ` · ${momoNumber}`}
                </p>
                <p>
                  {method === 'card' &&
                    'After placing your order you will be taken to a secure page to pay.'}
                  {method === 'momo' &&
                    'After placing your order you will receive a request on your phone.'}
                  {isCod &&
                    `You pay ${formatRwf(deposit)} now by ${DEPOSIT_CHANNEL_LABELS[depositChannel]} and ${formatRwf(balance)} in cash when your order arrives. Nothing is owed after delivery.`}
                </p>
              </ReviewBlock>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-12 sm:flex-1"
                  onClick={() => goTo('payment')}
                  disabled={isPlacing}
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  className="h-12 gap-2 bg-accent-rose hover:bg-accent-rose-dark sm:flex-1"
                  onClick={handlePlaceOrder}
                  disabled={isPlacing}
                >
                  {isPlacing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {isPlacing && 'Placing order…'}
                  {!isPlacing && (isCod ? 'Place order & pay deposit' : 'Place order & pay')}
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary
            lines={summaryLines}
            total={totals.total}
            footer={isCod ? <DepositBreakdown deposit={deposit} balance={balance} /> : undefined}
          >
            <OrderItemsList items={items} />
          </OrderSummary>
        </aside>
      </div>
    </Page>
  );
}
