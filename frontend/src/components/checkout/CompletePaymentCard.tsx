import { useEffect, useRef, useState } from 'react';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentStatusPanel } from '@/components/checkout/PaymentStatusPanel';
import { usePayment } from '@/hooks/usePayment';
import { formatRwf } from '@/lib/pricing';
import { isValidRwandaPhone, normalizePhone, onlineAmountDue, onlineChannel } from '@/lib/checkout';
import { MomoNumberField } from '@/components/checkout/MomoNumberField';
import type { Order } from '@/types/api';

interface CompletePaymentCardProps {
  readonly order: Order;
  readonly defaultPhone?: string;
  readonly onPaid: () => void;
}

export function CompletePaymentCard({
  order,
  defaultPhone = '',
  onPaid,
}: CompletePaymentCardProps) {
  const payment = usePayment();
  const isMomo = onlineChannel(order) === 'MOBILE_MONEY';
  const isDeposit = order.paymentMethod === 'CASH_ON_DELIVERY';
  const amountDue = onlineAmountDue(order);
  const [phone, setPhone] = useState(defaultPhone);
  const [phoneError, setPhoneError] = useState<string>();

  const notified = useRef(false);

  useEffect(() => {
    if (payment.phase !== 'paid' || notified.current) return;
    notified.current = true;
    onPaid();
  }, [payment.phase, onPaid]);

  const pay = () => {
    if (isMomo && !isValidRwandaPhone(phone)) {
      setPhoneError('Enter your MTN or Airtel number, e.g. 078 123 4567');
      return;
    }
    setPhoneError(undefined);
    payment.start(order.id, { phoneNumber: isMomo ? normalizePhone(phone) : undefined });
  };

  if (payment.phase !== 'idle' && payment.phase !== 'failed' && payment.phase !== 'timed-out') {
    return (
      <PaymentStatusPanel
        phase={payment.phase}
        orderNumber={order.orderNumber}
        amount={amountDue}
        balanceDue={isDeposit ? order.total - (order.depositAmount ?? 0) : undefined}
        phoneNumber={isMomo ? phone : undefined}
      />
    );
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 sm:p-6 dark:border-amber-900 dark:bg-amber-950/30">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="font-semibold">{isDeposit ? 'Deposit pending' : 'Payment pending'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {payment.phase === 'idle'
                ? `Complete your payment of ${formatRwf(amountDue)} to confirm this order.`
                : `${payment.error ?? 'We have not received your payment yet.'} You can try again below.`}
            </p>
          </div>
          {isMomo && (
            <MomoNumberField id="pay-phone" value={phone} onChange={setPhone} error={phoneError} />
          )}
          <Button onClick={pay} className="h-11 gap-2 bg-accent-rose hover:bg-accent-rose-dark">
            <Lock className="h-4 w-4" />
            Pay {formatRwf(amountDue)}
          </Button>
        </div>
      </div>
    </section>
  );
}
