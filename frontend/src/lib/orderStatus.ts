import type { OrderStatus, PaymentMethod, PaymentStatus } from '@/types/api';

export interface StatusStyle {
  label: string;
  className: string;
}

export const ORDER_STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  },
  SHIPPED: {
    label: 'Shipped',
    className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
  },
  DELIVERED: {
    label: 'Delivered',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  CANCELLED: { label: 'Cancelled', className: 'bg-muted text-muted-foreground' },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  },
};

export const PAYMENT_STATUS_STYLES: Record<PaymentStatus, StatusStyle> = {
  PENDING: {
    label: 'Unpaid',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
  },
  PARTIALLY_PAID: {
    label: 'Deposit paid',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
  },
  REFUNDED: { label: 'Refunded', className: 'bg-muted text-muted-foreground' },
};

export const PAYMENT_METHOD_NAMES: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Card',
  DEBIT_CARD: 'Card',
  PAYPAL: 'PayPal',
  BANK_TRANSFER: 'Bank transfer',
  MOBILE_MONEY: 'Mobile Money',
  CASH_ON_DELIVERY: 'Cash on delivery',
};

export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

export const ADMIN_PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'PARTIALLY_PAID',
  'PAID',
  'FAILED',
  'REFUNDED',
];
