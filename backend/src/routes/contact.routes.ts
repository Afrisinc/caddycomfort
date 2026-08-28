import { Router } from 'express';
import {
  submitContactForm,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from '../controllers/contact.controller';

const router = Router();

router.post('/', submitContactForm);
router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);

export default router;
