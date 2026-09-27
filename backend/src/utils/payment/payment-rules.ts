import type { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export const DEPOSIT_METHODS: PaymentMethod[] = ['MOBILE_MONEY', 'CREDIT_CARD'];

export const ONLINE_METHODS: PaymentMethod[] = ['CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_MONEY'];

interface PayableOrder {
  paymentMethod: PaymentMethod;
  depositMethod: PaymentMethod | null;
  depositAmount: number;
  amountPaid: number;
  total: number;
  status: OrderStatus;
}

export function calculateDeposit(total: number, depositPercent: number): number {
  return Math.round((total * depositPercent) / 100);
}

export function isCashOnDelivery(order: Pick<PayableOrder, 'paymentMethod'>): boolean {
  return order.paymentMethod === 'CASH_ON_DELIVERY';
}

export function isOnlinePaymentSettled(status: PaymentStatus): boolean {
  return status === 'PAID' || status === 'PARTIALLY_PAID';
}

export function onlineAmountDue(order: PayableOrder): number {
  const target = isCashOnDelivery(order) ? order.depositAmount : order.total;
  return Math.max(0, target - order.amountPaid);
}

export function onlineChannel(order: PayableOrder): PaymentMethod | null {
  return isCashOnDelivery(order) ? order.depositMethod : order.paymentMethod;
}

export function successfulPaymentUpdate(order: PayableOrder) {
  const deposit = isCashOnDelivery(order);
  return {
    paymentStatus: (deposit ? 'PARTIALLY_PAID' : 'PAID') as PaymentStatus,
    amountPaid: deposit ? order.depositAmount : order.total,
    status: (order.status === 'PENDING' ? 'PROCESSING' : order.status) as OrderStatus,
  };
}
