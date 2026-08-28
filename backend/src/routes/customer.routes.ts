import { Router } from 'express';
import {
  getAllCustomers,
  getCustomerStats,
  getCustomerById,
  updateCustomerStatus,
} from '../controllers/customer.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, requireAdmin, getAllCustomers);
router.get('/stats', authenticateToken, requireAdmin, getCustomerStats);
router.get('/:id', authenticateToken, requireAdmin, getCustomerById);
router.patch('/:id/status', authenticateToken, requireAdmin, updateCustomerStatus);

export default router;
