import prisma from '../config/database';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { paymentClient } from '../utils/payment/payment-client';
import { logger } from '../config/logger';

interface InitiatePaymentInput {
  email?: string;
  phoneNumber?: string;
  customerName?: string;
}

export interface InitiatePaymentResult {
  method: 'CARD' | 'MOBILE_MONEY' | 'NONE';
  checkoutUrl?: string;
  paymentRef?: string;
  message: string;
}

export interface PaymentStatusResult {
  status: 'PENDING' | 'PROCESSING' | 'SUCCESSFUL' | 'FAILED';
  paymentStatus: string;
  orderStatus: string;
}

export class PaymentService {
  static async initiate(
    orderId: string,
    userId: string,
    input: InitiatePaymentInput,
  ): Promise<InitiatePaymentResult> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (order.paymentStatus === 'PAID') {
      throw new Error('Order is already paid');
    }

    if (order.paymentMethod === 'CASH_ON_DELIVERY') {
      return { method: 'NONE', message: 'Cash on delivery — no online payment required' };
    }

    if (
      order.paymentMethod !== 'CREDIT_CARD' &&
      order.paymentMethod !== 'DEBIT_CARD' &&
      order.paymentMethod !== 'MOBILE_MONEY'
    ) {
      throw new Error(`${order.paymentMethod} is not supported for online payment`);
    }

    if (!paymentClient) {
      throw new Error('Payment service is not configured');
    }

    const customerName =
      input.customerName ||
      [order.user.firstName, order.user.lastName].filter(Boolean).join(' ') ||
      undefined;
    const description = `Order ${order.orderNumber}`;

    if (order.paymentMethod === 'MOBILE_MONEY') {
      if (!input.phoneNumber) {
        throw new Error('Phone number is required for mobile money payment');
      }

      const mobile = await paymentClient.mobileCashin({
        orderId: order.orderNumber,
        amount: Math.round(order.total),
        phoneNumber: input.phoneNumber,
        customerName,
        description,
        metadata: { orderId: order.id },
      });

      await prisma.order.update({ where: { id: order.id }, data: { paymentIntentId: mobile.ref } });

      logger.info(
        { orderId: order.id, orderNumber: order.orderNumber, ref: mobile.ref },
        'Mobile money payment initiated',
      );

      return {
        method: 'MOBILE_MONEY',
        paymentRef: mobile.ref,
        message: 'Approve the payment on your phone to complete the transaction',
      };
    }

    const email = input.email || order.user.email;
    if (!email) {
      throw new Error('Email is required for card payment');
    }

    const card = await paymentClient.initiateCardPayment({
      orderId: order.orderNumber,
      amount: Math.round(order.total * 100),
      email,
      currency: 'RWF',
      customerName,
      description,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({ where: { id: order.id }, data: { paymentIntentId: card.ref } });

    logger.info(
      { orderId: order.id, orderNumber: order.orderNumber, ref: card.ref },
      'Card payment initiated',
    );

    return {
      method: 'CARD',
      checkoutUrl: card.checkoutUrl,
      paymentRef: card.ref,
      message: 'Complete the payment at the provided checkout URL',
    };
  }

  static async getStatus(orderId: string, userId: string): Promise<PaymentStatusResult> {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.reconcileOrder(order);
  }

  /**
   * Check the gateway status of a pending order's payment and update it accordingly.
   * Shared by the user-facing status poll and the background reconciliation job.
   */
  static async reconcileOrder(order: {
    id: string;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    paymentIntentId: string | null;
    status: OrderStatus;
  }): Promise<PaymentStatusResult> {
    if (order.paymentStatus === 'PAID') {
      return {
        status: 'SUCCESSFUL',
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
      };
    }

    if (!order.paymentIntentId) {
      throw new Error('Payment has not been initiated for this order');
    }

    if (!paymentClient) {
      throw new Error('Payment service is not configured');
    }

    const gatewayStatus = await paymentClient.getPaymentStatus(order.paymentIntentId);

    if (gatewayStatus.status === 'SUCCESSFUL') {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: order.status === 'PENDING' ? 'PROCESSING' : order.status,
        },
      });

      logger.info({ orderId: order.id, orderNumber: order.orderNumber }, 'Order payment confirmed');

      return {
        status: gatewayStatus.status,
        paymentStatus: updated.paymentStatus,
        orderStatus: updated.status,
      };
    }

    if (gatewayStatus.status === 'FAILED' && order.paymentStatus !== 'FAILED') {
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });

      return {
        status: gatewayStatus.status,
        paymentStatus: updated.paymentStatus,
        orderStatus: updated.status,
      };
    }

    return {
      status: gatewayStatus.status,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
    };
  }

  /**
   * Mark a payment as failed without consulting the gateway.
   * Used when a pending payment has been abandoned for too long.
   */
  static async markStale(order: { id: string; orderNumber: string }): Promise<void> {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });
    logger.warn(
      { orderId: order.id, orderNumber: order.orderNumber },
      'Order payment marked failed after timing out',
    );
  }
}
