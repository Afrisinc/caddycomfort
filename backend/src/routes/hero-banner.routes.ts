import { Router } from 'express';
import {
  createHeroBanner,
  deleteHeroBanner,
  getActiveHeroBanners,
  getAllHeroBanners,
  getHeroBannerById,
  reorderHeroBanners,
  updateHeroBanner,
} from '../controllers/hero-banner.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getActiveHeroBanners);

router.get('/admin/all', authenticateToken, requireAdmin, getAllHeroBanners);
router.put('/admin/reorder', authenticateToken, requireAdmin, reorderHeroBanners);
router.get('/admin/:id', authenticateToken, requireAdmin, getHeroBannerById);
router.post('/', authenticateToken, requireAdmin, createHeroBanner);
router.put('/:id', authenticateToken, requireAdmin, updateHeroBanner);
router.delete('/:id', authenticateToken, requireAdmin, deleteHeroBanner);

export default router;
