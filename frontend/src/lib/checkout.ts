import type { Order, PaymentMethod } from '@/types/api';
import { isValidEmail } from '@/lib/forms';
import type { StoreSettings } from '@/lib/storeSettings';

export interface OrderTotals {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateTotals(
  subtotal: number,
  settings: Pick<StoreSettings, 'standardShippingFee' | 'freeShippingThreshold' | 'taxRate'>,
  { discount = 0, freeShipping = false }: { discount?: number; freeShipping?: boolean } = {},
): OrderTotals {
  const shipping =
    freeShipping || subtotal > settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
  const tax = (subtotal - discount) * (settings.taxRate / 100);
  return { subtotal, discount, shipping, tax, total: subtotal - discount + shipping + tax };
}

export type CheckoutPaymentMethod = 'card' | 'momo' | 'cod';

export const PAYMENT_METHOD_MAP: Record<CheckoutPaymentMethod, PaymentMethod> = {
  card: 'CREDIT_CARD',
  momo: 'MOBILE_MONEY',
  cod: 'CASH_ON_DELIVERY',
};

export const PAYMENT_METHOD_LABELS: Record<CheckoutPaymentMethod, string> = {
  card: 'Credit / debit card',
  momo: 'Mobile Money',
  cod: 'Cash on delivery',
};

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '');
}

export function isValidRwandaPhone(value: string): boolean {
  return /^(\+?250|0)7[2389]\d{7}$/.test(normalizePhone(value));
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export type ShippingErrors = Partial<Record<keyof ShippingDetails, string>>;

export function validateShipping(details: ShippingDetails): ShippingErrors {
  const errors: ShippingErrors = {};
  if (!details.firstName.trim()) errors.firstName = 'Please enter your first name';
  if (!details.lastName.trim()) errors.lastName = 'Please enter your last name';
  if (!details.email.trim()) errors.email = 'Please enter your email';
  else if (!isValidEmail(details.email)) errors.email = 'Please enter a valid email address';
  if (!details.phone.trim()) errors.phone = 'Please enter your phone number';
  else if (!isValidRwandaPhone(details.phone))
    errors.phone = 'Enter a Rwandan number, e.g. 078 123 4567';
  if (!details.address.trim()) errors.address = 'Please enter your street address';
  if (!details.city.trim()) errors.city = 'Please enter your city';
  return errors;
}

export function formatVariant(item: { size?: string; color?: string }): string {
  return [item.size && `Size ${item.size}`, item.color].filter(Boolean).join(' · ');
}

export type DepositChannel = 'momo' | 'card';

export const DEPOSIT_CHANNEL_MAP: Record<DepositChannel, PaymentMethod> = {
  momo: 'MOBILE_MONEY',
  card: 'CREDIT_CARD',
};

export const DEPOSIT_CHANNEL_LABELS: Record<DepositChannel, string> = {
  momo: 'Mobile Money',
  card: 'Card',
};

export function calculateDeposit(total: number, depositPercent: number): number {
  return Math.round((total * depositPercent) / 100);
}

export function codLabel(depositPercent: number): string {
  return depositPercent > 0
    ? `${PAYMENT_METHOD_LABELS.cod} (${depositPercent}% deposit)`
    : PAYMENT_METHOD_LABELS.cod;
}

const ONLINE_METHODS = new Set<PaymentMethod>(['CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_MONEY']);
const CLOSED_STATUSES = new Set(['CANCELLED', 'REFUNDED']);

export function onlineChannel(order: Order): PaymentMethod | null {
  return order.paymentMethod === 'CASH_ON_DELIVERY'
    ? (order.depositMethod ?? null)
    : order.paymentMethod;
}

export function onlineAmountDue(order: Order): number {
  const target =
    order.paymentMethod === 'CASH_ON_DELIVERY' ? (order.depositAmount ?? 0) : order.total;
  return Math.max(0, target - (order.amountPaid ?? 0));
}

export function needsOnlinePayment(order: Order): boolean {
  const channel = onlineChannel(order);
  return (
    !!channel &&
    ONLINE_METHODS.has(channel) &&
    order.paymentStatus !== 'PAID' &&
    order.paymentStatus !== 'PARTIALLY_PAID' &&
    !CLOSED_STATUSES.has(order.status) &&
    onlineAmountDue(order) > 0
  );
}
