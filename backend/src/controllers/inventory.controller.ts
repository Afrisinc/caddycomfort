import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { InventoryLogType } from '@prisma/client';

export class InventoryController {
  /**
   * Get product inventory logs
   */
  static async getProductInventoryLogs(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as InventoryLogType | undefined;

      const result = await InventoryService.getProductInventoryLogs(
        productId,
        page,
        limit,
        type
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all inventory logs (admin)
   */
  static async getAllInventoryLogs(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const type = req.query.type as InventoryLogType | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const result = await InventoryService.getAllInventoryLogs(
        page,
        limit,
        type,
        startDate,
        endDate
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Adjust stock quantity
   */
  static async adjustStock(req: Request, res: Response) {
    try {
      const { productId, quantity, type, reason } = req.body;

      if (!productId || quantity === undefined || !type || !reason) {
        res.status(400).json({
          success: false,
          message: 'Product ID, quantity, type, and reason are required',
        });
        return;
      }

      const validTypes = ['RESTOCK', 'SALE', 'RETURN', 'DAMAGED', 'ADJUSTMENT'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ success: false, message: 'Invalid inventory log type' });
        return;
      }

      const result = await InventoryService.adjustStock({
        productId,
        quantity,
        type,
        reason,
      });

      res.json({ success: true, message: 'Stock adjusted successfully', data: result });
    } catch (error: any) {
      if (error.message === 'Product not found') {
        res.status(404).json({ success: false, message: error.message });
        return;
      }
      if (
        error.message.includes('must be positive') ||
        error.message.includes('must be negative') ||
        error.message.includes('Insufficient stock')
      ) {
        res.status(400).json({ success: false, message: error.message });
        return;
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Bulk stock adjustment
   */
  static async bulkAdjustStock(req: Request, res: Response) {
    try {
      const { adjustments } = req.body;

      if (!adjustments || !Array.isArray(adjustments)) {
        res.status(400).json({ success: false, message: 'Adjustments array is required' });
        return;
      }

      if (adjustments.length === 0) {
        res.status(400).json({ success: false, message: 'At least one adjustment is required' });
        return;
      }

      for (const adj of adjustments) {
        if (!adj.productId || adj.quantity === undefined || !adj.type || !adj.reason) {
          res.status(400).json({
            success: false,
            message: 'Each adjustment must have productId, quantity, type, and reason',
          });
          return;
        }
      }

      const result = await InventoryService.bulkAdjustStock(adjustments);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get inventory alerts
   */
  static async getInventoryAlerts(req: Request, res: Response) {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;
      const alerts = await InventoryService.getInventoryAlerts(threshold);
      res.json({ success: true, data: { alerts } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get inventory summary
   */
  static async getInventorySummary(req: Request, res: Response) {
    try {
      const summary = await InventoryService.getInventorySummary();
      res.json({ success: true, data: { summary } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get inventory valuation report
   */
  static async getInventoryValuation(req: Request, res: Response) {
    try {
      const valuation = await InventoryService.getInventoryValuation();
      res.json({ success: true, data: valuation });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get inventory turnover report
   */
  static async getInventoryTurnover(req: Request, res: Response) {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const turnover = await InventoryService.getInventoryTurnover(days);
      res.json({ success: true, data: turnover });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get stock movement report
   */
  static async getStockMovement(req: Request, res: Response) {
    try {
      const productId = req.query.productId as string | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const movement = await InventoryService.getStockMovement(
        startDate,
        endDate,
        productId
      );
      res.json({ success: true, data: movement });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Reconcile inventory
   */
  static async reconcileInventory(req: Request, res: Response) {
    try {
      const { actualCounts } = req.body;

      if (!actualCounts || !Array.isArray(actualCounts)) {
        res.status(400).json({ success: false, message: 'Actual counts array is required' });
        return;
      }

      if (actualCounts.length === 0) {
        res.status(400).json({ success: false, message: 'At least one count is required' });
        return;
      }

      for (const count of actualCounts) {
        if (!count.productId || count.actualCount === undefined) {
          res.status(400).json({
            success: false,
            message: 'Each count must have productId and actualCount',
          });
          return;
        }
      }

      const result = await InventoryService.reconcileInventory(actualCounts);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get restock recommendations
   */
  static async getRestockRecommendations(req: Request, res: Response) {
    try {
      const threshold = parseInt(req.query.threshold as string) || 10;
      const daysToAnalyze = parseInt(req.query.days as string) || 30;

      const recommendations = await InventoryService.getRestockRecommendations(
        threshold,
        daysToAnalyze
      );
      res.json({ success: true, data: { recommendations } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
