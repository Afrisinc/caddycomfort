import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  /**
   * Get overall statistics
   */
  static async getOverallStats(req: Request, res: Response) {
    try {
      const stats = await DashboardService.getOverallStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching statistics',
      });
    }
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(req: Request, res: Response) {
    try {
      const { period = 'month' } = req.query;
      const validPeriods = ['week', 'month', 'year'];

      if (!validPeriods.includes(period as string)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid period. Must be week, month, or year' });
      }

      const analytics = await DashboardService.getSalesAnalytics(
        period as 'week' | 'month' | 'year',
      );
      res.json({ success: true, data: analytics });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching sales analytics',
      });
    }
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(req: Request, res: Response) {
    try {
      const { limit = '10' } = req.query;
      const products = await DashboardService.getTopProducts(parseInt(limit as string));
      res.json({ success: true, data: { products } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching top products',
      });
    }
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(req: Request, res: Response) {
    try {
      const { limit = '10' } = req.query;
      const orders = await DashboardService.getRecentOrders(parseInt(limit as string));
      res.json({ success: true, data: { orders } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching recent orders',
      });
    }
  }

  /**
   * Get revenue by category
   */
  static async getRevenueByCategory(req: Request, res: Response) {
    try {
      const revenue = await DashboardService.getRevenueByCategory();
      res.json({ success: true, data: { revenue } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching revenue by category',
      });
    }
  }

  /**
   * Get low stock alert
   */
  static async getLowStockAlert(req: Request, res: Response) {
    try {
      const { threshold = '10' } = req.query;
      const products = await DashboardService.getLowStockAlert(parseInt(threshold as string));
      res.json({ success: true, data: { products } });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching low stock alert',
      });
    }
  }

  /**
   * Get customer insights
   */
  static async getCustomerInsights(req: Request, res: Response) {
    try {
      const insights = await DashboardService.getCustomerInsights();
      res.json({ success: true, data: insights });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error fetching customer insights',
      });
    }
  }
}
