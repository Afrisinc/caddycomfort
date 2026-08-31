import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// All dashboard routes require admin access

// Get overall statistics
router.get('/stats', authenticateToken, requireAdmin, DashboardController.getOverallStats);

// Get sales analytics
router.get('/sales', authenticateToken, requireAdmin, DashboardController.getSalesAnalytics);

// Get top selling products
router.get('/top-products', authenticateToken, requireAdmin, DashboardController.getTopProducts);

// Get recent orders
router.get('/recent-orders', authenticateToken, requireAdmin, DashboardController.getRecentOrders);

// Get revenue by category
router.get(
  '/revenue-by-category',
  authenticateToken,
  requireAdmin,
  DashboardController.getRevenueByCategory,
);

// Get low stock alert
router.get('/low-stock', authenticateToken, requireAdmin, DashboardController.getLowStockAlert);

// Get customer insights
router.get('/customers', authenticateToken, requireAdmin, DashboardController.getCustomerInsights);

export default router;
