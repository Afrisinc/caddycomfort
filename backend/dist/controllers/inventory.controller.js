"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const inventory_service_1 = require("../services/inventory.service");
class InventoryController {
    /**
     * Get product inventory logs
     */
    static async getProductInventoryLogs(req, res) {
        try {
            const { productId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const type = req.query.type;
            const result = await inventory_service_1.InventoryService.getProductInventoryLogs(productId, page, limit, type);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get all inventory logs (admin)
     */
    static async getAllInventoryLogs(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 50;
            const type = req.query.type;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const result = await inventory_service_1.InventoryService.getAllInventoryLogs(page, limit, type, startDate, endDate);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Adjust stock quantity
     */
    static async adjustStock(req, res) {
        try {
            const { productId, quantity, type, reason } = req.body;
            if (!productId || quantity === undefined || !type || !reason) {
                return res.status(400).json({
                    error: 'Product ID, quantity, type, and reason are required'
                });
            }
            const validTypes = ['RESTOCK', 'SALE', 'RETURN', 'DAMAGED', 'ADJUSTMENT'];
            if (!validTypes.includes(type)) {
                return res.status(400).json({ error: 'Invalid inventory log type' });
            }
            const result = await inventory_service_1.InventoryService.adjustStock({
                productId,
                quantity,
                type,
                reason,
            });
            res.json(result);
        }
        catch (error) {
            if (error.message === 'Product not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('must be positive') ||
                error.message.includes('must be negative') ||
                error.message.includes('Insufficient stock')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Bulk stock adjustment
     */
    static async bulkAdjustStock(req, res) {
        try {
            const { adjustments } = req.body;
            if (!adjustments || !Array.isArray(adjustments)) {
                return res.status(400).json({ error: 'Adjustments array is required' });
            }
            if (adjustments.length === 0) {
                return res.status(400).json({ error: 'At least one adjustment is required' });
            }
            // Validate each adjustment
            for (const adj of adjustments) {
                if (!adj.productId || adj.quantity === undefined || !adj.type || !adj.reason) {
                    return res.status(400).json({
                        error: 'Each adjustment must have productId, quantity, type, and reason'
                    });
                }
            }
            const result = await inventory_service_1.InventoryService.bulkAdjustStock(adjustments);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get inventory alerts
     */
    static async getInventoryAlerts(req, res) {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
            const alerts = await inventory_service_1.InventoryService.getInventoryAlerts(threshold);
            res.json(alerts);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get inventory summary
     */
    static async getInventorySummary(req, res) {
        try {
            const summary = await inventory_service_1.InventoryService.getInventorySummary();
            res.json(summary);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get inventory valuation report
     */
    static async getInventoryValuation(req, res) {
        try {
            const valuation = await inventory_service_1.InventoryService.getInventoryValuation();
            res.json(valuation);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get inventory turnover report
     */
    static async getInventoryTurnover(req, res) {
        try {
            const days = parseInt(req.query.days) || 30;
            const turnover = await inventory_service_1.InventoryService.getInventoryTurnover(days);
            res.json(turnover);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get stock movement report
     */
    static async getStockMovement(req, res) {
        try {
            const productId = req.query.productId;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const movement = await inventory_service_1.InventoryService.getStockMovement(startDate, endDate, productId);
            res.json(movement);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Reconcile inventory
     */
    static async reconcileInventory(req, res) {
        try {
            const { actualCounts } = req.body;
            if (!actualCounts || !Array.isArray(actualCounts)) {
                return res.status(400).json({ error: 'Actual counts array is required' });
            }
            if (actualCounts.length === 0) {
                return res.status(400).json({ error: 'At least one count is required' });
            }
            // Validate each count
            for (const count of actualCounts) {
                if (!count.productId || count.actualCount === undefined) {
                    return res.status(400).json({
                        error: 'Each count must have productId and actualCount'
                    });
                }
            }
            const result = await inventory_service_1.InventoryService.reconcileInventory(actualCounts);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get restock recommendations
     */
    static async getRestockRecommendations(req, res) {
        try {
            const threshold = parseInt(req.query.threshold) || 10;
            const daysToAnalyze = parseInt(req.query.days) || 30;
            const recommendations = await inventory_service_1.InventoryService.getRestockRecommendations(threshold, daysToAnalyze);
            res.json(recommendations);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.InventoryController = InventoryController;
