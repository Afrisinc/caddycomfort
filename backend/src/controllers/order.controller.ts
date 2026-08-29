import { Request, Response } from 'express';
import { OrderService } from '../services/order.service';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export class OrderController {
  /**
   * Create order from cart
   */
  static async createOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { shippingAddress, paymentMethod, notes } = req.body;

      if (!shippingAddress) {
        return res.status(400).json({ success: false, message: 'Shipping address is required' });
      }

      if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.country) {
        return res.status(400).json({
          success: false,
          message: 'Complete shipping address is required (street, city, state, postalCode, country)',
        });
      }

      if (!paymentMethod) {
        return res.status(400).json({ success: false, message: 'Payment method is required' });
      }

      const validPaymentMethods = ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'MOBILE_MONEY', 'CASH_ON_DELIVERY'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
      }

      const order = await OrderService.createOrder({
        userId,
        shippingAddress,
        paymentMethod,
        notes,
      });

      res.status(201).json({ success: true, message: 'Order created successfully', data: order });
    } catch (error: any) {
      if (error.message === 'Cart is empty') {
        return res.status(400).json({ success: false, message: error.message });
      }
      if (error.message.includes('not available') || error.message.includes('Insufficient stock')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get order by ID
   */
  static async getOrderById(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const userId = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
        ? undefined
        : req.user!.userId;

      const order = await OrderService.getOrderById(orderId, userId);
      res.json({ success: true, data: order });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(req: Request, res: Response) {
    try {
      const { orderNumber } = req.params;
      const userId = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
        ? undefined
        : req.user!.userId;

      const order = await OrderService.getOrderByNumber(orderNumber, userId);
      res.json({ success: true, data: order });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's orders
   */
  static async getUserOrders(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as OrderStatus | undefined;

      const result = await OrderService.getUserOrders(userId, page, limit, status);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all orders (admin)
   */
  static async getAllOrders(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as OrderStatus | undefined;
      const paymentStatus = req.query.paymentStatus as PaymentStatus | undefined;
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const result = await OrderService.getAllOrders(
        page,
        limit,
        status,
        paymentStatus,
        startDate,
        endDate
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update order status (admin)
   */
  static async updateOrderStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required' });
      }

      const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const order = await OrderService.updateOrderStatus(orderId, status);
      res.json({ success: true, message: 'Order status updated successfully', data: order });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Cannot update status')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update payment status (admin)
   */
  static async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;
      const { paymentStatus } = req.body;

      if (!paymentStatus) {
        return res.status(400).json({ success: false, message: 'Payment status is required' });
      }

      const validStatuses = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];
      if (!validStatuses.includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid payment status' });
      }

      const order = await OrderService.updatePaymentStatus(orderId, paymentStatus);
      res.json({ success: true, message: 'Payment status updated successfully', data: order });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Cancel order (user)
   */
  static async cancelOrder(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { orderId } = req.params;

      const order = await OrderService.cancelOrder(orderId, userId);
      res.json({ success: true, message: 'Order cancelled successfully', data: order });
    } catch (error: any) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message === 'Unauthorized') {
        return res.status(403).json({ success: false, message: error.message });
      }
      if (
        error.message.includes('already cancelled') ||
        error.message.includes('Cannot cancel')
      ) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get order statistics (admin)
   */
  static async getOrderStats(req: Request, res: Response) {
    try {
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

      const stats = await OrderService.getOrderStats(startDate, endDate);
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get recent orders (admin)
   */
  static async getRecentOrders(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const orders = await OrderService.getRecentOrders(limit);
      res.json({ success: true, data: { orders } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
