import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', SettingsController.get);
router.patch('/', authenticateToken, requireAdmin, SettingsController.update);

export default router;
