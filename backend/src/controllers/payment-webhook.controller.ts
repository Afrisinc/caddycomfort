import { Request, Response } from 'express';
import { logger } from '../config/logger';
import { verifyAfrisincSignature } from '../utils/payment/webhook-signature';
import { PaymentWebhookService, WebhookEventPayload } from '../services/payment-webhook.service';

export const handlePaymentEvent = async (req: Request, res: Response): Promise<void> => {
  const webhookSecret = process.env.AFRISINC_PAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('AFRISINC_PAY_WEBHOOK_SECRET not configured');
    res.status(500).json({ error: 'Webhook secret not configured' });
    return;
  }

  const signature = req.headers['x-afrisinc-signature'] as string | undefined;
  const rawBody = JSON.stringify(req.body);

  const verification = verifyAfrisincSignature(webhookSecret, rawBody, signature);

  if (!verification.valid) {
    logger.warn({ error: verification.error }, 'Invalid payment webhook signature');
    res.status(401).json({ error: verification.error || 'Invalid signature' });
    return;
  }

  const payload = req.body as WebhookEventPayload;

  if (!payload.event || !payload.data) {
    logger.warn('Invalid payment webhook payload - missing event or data');
    res.status(400).json({ error: 'Invalid payload' });
    return;
  }

  const result = await PaymentWebhookService.processEvent(payload);

  if (!result.success) {
    logger.error({ event: payload.event, error: result.error }, 'Payment webhook processing failed');
    res.status(422).json({ error: result.error });
    return;
  }

  res.status(200).json({ ok: true, skipped: result.skipped });
};
