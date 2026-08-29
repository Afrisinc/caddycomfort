import { Router } from 'express';
import { handlePaymentEvent } from '../controllers/payment-webhook.controller';

const router = Router();

router.post('/afrisinc-pay', handlePaymentEvent);

export default router;
