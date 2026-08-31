import prisma from '../config/database';
import { logger } from '../config/logger';

export interface WebhookEventPayload {
  event: string;
  timestamp: string;
  data: {
    paymentId?: string;
    ref?: string;
    orderId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface WebhookProcessResult {
  success: boolean;
  skipped?: boolean;
  error?: string;
}

export class PaymentWebhookService {
  static async processEvent(payload: WebhookEventPayload): Promise<WebhookProcessResult> {
    const { event, data } = payload;

    logger.debug({ event }, 'Processing payment webhook event');

    switch (event) {
      case 'card.payment_succeeded':
      case 'mobile.payment_succeeded':
        return this.handlePaymentSucceeded(data);

      case 'card.payment_failed':
      case 'mobile.payment_failed':
        return this.handlePaymentFailed(data);

      default:
        logger.debug({ event }, 'Skipping unhandled payment webhook event');
        return { success: true, skipped: true };
    }
  }

  private static async findOrder(data: WebhookEventPayload['data']) {
    const orderId = data.metadata?.orderId as string | undefined;
    const ref = data.ref || data.paymentId;

    if (orderId) {
      return prisma.order.findUnique({ where: { id: orderId } });
    }

    if (ref) {
      return prisma.order.findFirst({ where: { paymentIntentId: ref } });
    }

    return null;
  }

  private static async handlePaymentSucceeded(
    data: WebhookEventPayload['data'],
  ): Promise<WebhookProcessResult> {
    const order = await this.findOrder(data);

    if (!order) {
      logger.warn(
        { ref: data.ref || data.paymentId },
        'Payment succeeded webhook: order not found',
      );
      return { success: false, error: 'Order not found' };
    }

    if (order.paymentStatus === 'PAID') {
      return { success: true, skipped: true };
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PAID',
        status: order.status === 'PENDING' ? 'PROCESSING' : order.status,
      },
    });

    logger.info(
      { orderId: order.id, orderNumber: order.orderNumber },
      'Order payment confirmed via webhook',
    );

    return { success: true };
  }

  private static async handlePaymentFailed(
    data: WebhookEventPayload['data'],
  ): Promise<WebhookProcessResult> {
    const order = await this.findOrder(data);

    if (!order) {
      logger.warn({ ref: data.ref || data.paymentId }, 'Payment failed webhook: order not found');
      return { success: false, error: 'Order not found' };
    }

    if (order.paymentStatus === 'PAID') {
      return { success: true, skipped: true };
    }

    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: 'FAILED' } });

    logger.warn(
      { orderId: order.id, orderNumber: order.orderNumber },
      'Order payment failed via webhook',
    );

    return { success: true };
  }
}
