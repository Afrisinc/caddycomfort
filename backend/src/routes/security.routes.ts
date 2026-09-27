import { Router } from 'express';
import { getLoginAttemptStats, getLoginAttempts } from '../controllers/security.controller';
import { authenticateToken, requireSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateToken, requireSuperAdmin);
router.get('/login-attempts', getLoginAttempts);
router.get('/login-attempts/stats', getLoginAttemptStats);

export default router;
