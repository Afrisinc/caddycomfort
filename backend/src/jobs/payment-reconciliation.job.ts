import { CronJob } from 'cron';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { paymentClient } from '../utils/payment/payment-client';
import { PaymentService } from '../services/payment.service';

const STALE_AFTER_MINUTES = 60;
const CRON_SCHEDULE = '0 */5 * * * *';

let job: CronJob | null = null;
let isRunning = false;

export function initializePaymentReconciliationJob(): void {
  job = new CronJob(
    CRON_SCHEDULE,
    () => {
      runPaymentReconciliation().catch((error) => {
        logger.error({ err: error }, 'Payment reconciliation job failed');
      });
    },
    null,
    true,
    'UTC'
  );

  logger.info({ schedule: CRON_SCHEDULE }, 'Payment reconciliation job initialized');
}

export function stopPaymentReconciliationJob(): void {
  job?.stop();
  job = null;
}

export async function runPaymentReconciliation(): Promise<{ checked: number; confirmed: number; failed: number; staled: number }> {
  const stats = { checked: 0, confirmed: 0, failed: 0, staled: 0 };

  if (!paymentClient) {
    return stats;
  }

  if (isRunning) {
    logger.debug('Payment reconciliation already running, skipping this tick');
    return stats;
  }

  isRunning = true;

  try {
    const pendingOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PENDING',
        paymentIntentId: { not: null },
        paymentMethod: { in: ['CREDIT_CARD', 'DEBIT_CARD', 'MOBILE_MONEY'] },
      },
      select: { id: true, orderNumber: true, paymentStatus: true, paymentIntentId: true, status: true, createdAt: true },
    });

    if (pendingOrders.length === 0) {
      return stats;
    }

    logger.info({ count: pendingOrders.length }, 'Reconciling pending payments');

    const staleCutoff = Date.now() - STALE_AFTER_MINUTES * 60 * 1000;

    for (const order of pendingOrders) {
      stats.checked++;

      try {
        const result = await PaymentService.reconcileOrder(order);

        if (result.status === 'SUCCESSFUL') {
          stats.confirmed++;
        } else if (result.status === 'FAILED') {
          stats.failed++;
        } else if (order.createdAt.getTime() < staleCutoff) {
          await PaymentService.markStale(order);
          stats.staled++;
        }
      } catch (error) {
        logger.error({ err: error, orderId: order.id }, 'Failed to reconcile order payment');
      }
    }

    logger.info(stats, 'Payment reconciliation job completed');

    return stats;
  } finally {
    isRunning = false;
  }
}
