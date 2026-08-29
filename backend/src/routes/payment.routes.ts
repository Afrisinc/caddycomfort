import { Router } from 'express';
import { initiatePayment, getPaymentStatus } from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.post('/:orderId/initiate', initiatePayment);
router.get('/:orderId/status', getPaymentStatus);

export default router;
