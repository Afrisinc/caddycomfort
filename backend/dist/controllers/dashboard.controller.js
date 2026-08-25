"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
class DashboardController {
    /**
     * Get overall statistics
     */
    static async getOverallStats(req, res) {
        try {
            const stats = await dashboard_service_1.DashboardService.getOverallStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching statistics',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get sales analytics
     */
    static async getSalesAnalytics(req, res) {
        try {
            const { period = 'month' } = req.query;
            const validPeriods = ['week', 'month', 'year'];
            if (!validPeriods.includes(period)) {
                return res.status(400).json({ message: 'Invalid period. Must be week, month, or year' });
            }
            const analytics = await dashboard_service_1.DashboardService.getSalesAnalytics(period);
            res.json(analytics);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching sales analytics',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get top selling products
     */
    static async getTopProducts(req, res) {
        try {
            const { limit = '10' } = req.query;
            const products = await dashboard_service_1.DashboardService.getTopProducts(parseInt(limit));
            res.json(products);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching top products',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get recent orders
     */
    static async getRecentOrders(req, res) {
        try {
            const { limit = '10' } = req.query;
            const orders = await dashboard_service_1.DashboardService.getRecentOrders(parseInt(limit));
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching recent orders',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get revenue by category
     */
    static async getRevenueByCategory(req, res) {
        try {
            const revenue = await dashboard_service_1.DashboardService.getRevenueByCategory();
            res.json(revenue);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching revenue by category',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get low stock alert
     */
    static async getLowStockAlert(req, res) {
        try {
            const { threshold = '10' } = req.query;
            const products = await dashboard_service_1.DashboardService.getLowStockAlert(parseInt(threshold));
            res.json(products);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching low stock alert',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * Get customer insights
     */
    static async getCustomerInsights(req, res) {
        try {
            const insights = await dashboard_service_1.DashboardService.getCustomerInsights();
            res.json(insights);
        }
        catch (error) {
            res.status(500).json({
                message: 'Error fetching customer insights',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.DashboardController = DashboardController;
