"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("../services/order.service");
class OrderController {
    /**
     * Create order from cart
     */
    static async createOrder(req, res) {
        try {
            const userId = req.user.userId;
            const { shippingAddress, paymentMethod, notes } = req.body;
            if (!shippingAddress) {
                return res.status(400).json({ error: 'Shipping address is required' });
            }
            if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
                return res.status(400).json({ error: 'Complete shipping address is required (street, city, state, postalCode, country)' });
            }
            if (!paymentMethod) {
                return res.status(400).json({ error: 'Payment method is required' });
            }
            const validPaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH_ON_DELIVERY'];
            if (!validPaymentMethods.includes(paymentMethod)) {
                return res.status(400).json({ error: 'Invalid payment method' });
            }
            const order = await order_service_1.OrderService.createOrder({
                userId,
                shippingAddress,
                paymentMethod,
                notes,
            });
            res.status(201).json(order);
        }
        catch (error) {
            if (error.message === 'Cart is empty') {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('not available') || error.message.includes('Insufficient stock')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get order by ID
     */
    static async getOrderById(req, res) {
        try {
            const { orderId } = req.params;
            const userId = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN'
                ? undefined
                : req.user.userId;
            const order = await order_service_1.OrderService.getOrderById(orderId, userId);
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Unauthorized') {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get order by order number
     */
    static async getOrderByNumber(req, res) {
        try {
            const { orderNumber } = req.params;
            const userId = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN'
                ? undefined
                : req.user.userId;
            const order = await order_service_1.OrderService.getOrderByNumber(orderNumber, userId);
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Unauthorized') {
                return res.status(403).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get user's orders
     */
    static async getUserOrders(req, res) {
        try {
            const userId = req.user.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
            const result = await order_service_1.OrderService.getUserOrders(userId, page, limit, status);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get all orders (admin)
     */
    static async getAllOrders(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const status = req.query.status;
            const paymentStatus = req.query.paymentStatus;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const result = await order_service_1.OrderService.getAllOrders(page, limit, status, paymentStatus, startDate, endDate);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Update order status (admin)
     */
    static async updateOrderStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { status } = req.body;
            if (!status) {
                return res.status(400).json({ error: 'Status is required' });
            }
            const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }
            const order = await order_service_1.OrderService.updateOrderStatus(orderId, status);
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message.includes('Cannot update status')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Update payment status (admin)
     */
    static async updatePaymentStatus(req, res) {
        try {
            const { orderId } = req.params;
            const { paymentStatus } = req.body;
            if (!paymentStatus) {
                return res.status(400).json({ error: 'Payment status is required' });
            }
            const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
            if (!validStatuses.includes(paymentStatus)) {
                return res.status(400).json({ error: 'Invalid payment status' });
            }
            const order = await order_service_1.OrderService.updatePaymentStatus(orderId, paymentStatus);
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Cancel order (user)
     */
    static async cancelOrder(req, res) {
        try {
            const userId = req.user.userId;
            const { orderId } = req.params;
            const order = await order_service_1.OrderService.cancelOrder(orderId, userId);
            res.json(order);
        }
        catch (error) {
            if (error.message === 'Order not found') {
                return res.status(404).json({ error: error.message });
            }
            if (error.message === 'Unauthorized') {
                return res.status(403).json({ error: error.message });
            }
            if (error.message.includes('already cancelled') ||
                error.message.includes('Cannot cancel')) {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get order statistics (admin)
     */
    static async getOrderStats(req, res) {
        try {
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const stats = await order_service_1.OrderService.getOrderStats(startDate, endDate);
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * Get recent orders (admin)
     */
    static async getRecentOrders(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const orders = await order_service_1.OrderService.getRecentOrders(limit);
            res.json(orders);
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
exports.OrderController = OrderController;
