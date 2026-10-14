import { Router } from 'express';
import {
  submitContactForm,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from '../controllers/contact.controller';
import { emailLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

router.post('/', emailLimiter, submitContactForm);
router.post('/newsletter/subscribe', emailLimiter, subscribeNewsletter);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);

export default router;
