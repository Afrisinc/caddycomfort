import { cn } from '@/lib/utils';
import { ORDER_STATUS_STYLES, PAYMENT_STATUS_STYLES } from '@/lib/orderStatus';
import type { OrderStatus, PaymentStatus } from '@/types/api';

const base =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap';

export function OrderStatusBadge({
  status,
  className,
}: Readonly<{ status: OrderStatus; className?: string }>) {
  const style = ORDER_STATUS_STYLES[status] ?? ORDER_STATUS_STYLES.PENDING;
  return <span className={cn(base, style.className, className)}>{style.label}</span>;
}

export function PaymentStatusBadge({
  status,
  className,
}: Readonly<{ status: PaymentStatus; className?: string }>) {
  const style = PAYMENT_STATUS_STYLES[status] ?? PAYMENT_STATUS_STYLES.PENDING;
  return <span className={cn(base, style.className, className)}>{style.label}</span>;
}
