import prisma from '../config/database';
import { Prisma, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreateOrderInput {
  userId: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface OrderWithDetails {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
    size: string | null;
    color: string | null;
  }>;
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: any;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OrderService {
  /**
   * Create order from cart
   */
  static async createOrder(input: CreateOrderInput): Promise<OrderWithDetails> {
    const { userId, shippingAddress, paymentMethod, notes } = input;

    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        coupon: true,
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    // Validate cart items
    for (const item of cart.items) {
      if (!item.product.isActive) {
        throw new Error(`Product ${item.product.name} is no longer available`);
      }

      if (item.product.stockQuantity < item.quantity) {
        throw new Error(
          `Insufficient stock for ${item.product.name}. Only ${item.product.stockQuantity} available`
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const price = item.product.salePrice || item.product.price;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;

      return {
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        price,
        size: item.size,
        color: item.color,
      };
    });

    // Calculate discount
    let discount = 0;
    let couponId = null;
    if (cart.coupon) {
      couponId = cart.coupon.id;
      if (cart.coupon.discountType === 'PERCENTAGE') {
        discount = (subtotal * cart.coupon.discountValue) / 100;
        if (cart.coupon.maxDiscountAmount) {
          discount = Math.min(discount, cart.coupon.maxDiscountAmount);
        }
      } else if (cart.coupon.discountType === 'FIXED_AMOUNT') {
        discount = cart.coupon.discountValue;
      }
    }

    // Calculate shipping (simplified - could be based on weight, location, etc.)
    const shippingCost = cart.coupon?.discountType === 'FREE_SHIPPING' ? 0 : 10;

    // Calculate tax (simplified - 10% tax rate)
    const tax = (subtotal - discount) * 0.1;

    const total = subtotal - discount + shippingCost + tax;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          subtotal,
          discount,
          shippingCost,
          tax,
          total,
          couponId,
          paymentMethod,
          paymentStatus: 'PENDING',
          shippingAddress: shippingAddress as Prisma.JsonObject,
          notes,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: {
              decrement: item.quantity,
            },
          },
        });

        // Create inventory log
        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            type: 'SALE',
            quantity: -item.quantity,
            reason: `Order ${orderNumber}`,
          },
        });
      }

      // Record coupon usage
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            couponId,
            userId,
            orderId: newOrder.id,
          },
        });

        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { couponId: null },
      });

      return newOrder;
    });

    return this.formatOrderResponse(order);
  }

  /**
   * Get order by ID
   */
  static async getOrderById(orderId: string, userId?: string): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Check authorization if userId provided
    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Get order by order number
   */
  static async getOrderByNumber(
    orderNumber: string,
    userId?: string
  ): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.formatOrderResponse(order);
  }

  /**
   * Get user orders
   */
  static async getUserOrders(
    userId: string,
    page = 1,
    limit = 10,
    status?: OrderStatus
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          coupon: {
            select: {
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => this.formatOrderResponse(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all orders (admin)
   */
  static async getAllOrders(
    page = 1,
    limit = 20,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus,
    startDate?: Date,
    endDate?: Date
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          coupon: {
            select: {
              code: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => this.formatOrderResponse(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new Error(`Cannot update status from ${order.status}`);
    }

    // If cancelling, restore stock
    if (status === 'CANCELLED') {
      await prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                increment: item.quantity,
              },
            },
          });

          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              type: 'RETURN',
              quantity: item.quantity,
              reason: `Order ${order.orderNumber} cancelled`,
            },
          });
        }
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
    });

    return this.formatOrderResponse(updatedOrder);
  }

  /**
   * Cancel order (user)
   */
  static async cancelOrder(orderId: string, userId: string): Promise<OrderWithDetails> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (order.status === 'CANCELLED') {
      throw new Error('Order is already cancelled');
    }

    if (order.status === 'DELIVERED') {
      throw new Error('Cannot cancel delivered order');
    }

    if (order.status === 'SHIPPED') {
      throw new Error('Cannot cancel shipped order. Please contact support.');
    }

    return this.updateOrderStatus(orderId, 'CANCELLED');
  }

  /**
   * Get order statistics (admin)
   */
  static async getOrderStats(startDate?: Date, endDate?: Date) {
    const where: Prisma.OrderWhereInput = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [
      totalOrders,
      statusCounts,
      paymentStatusCounts,
      totalRevenue,
      averageOrderValue,
    ] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: true,
      }),
      prisma.order.groupBy({
        by: ['paymentStatus'],
        where,
        _count: true,
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          ...where,
          status: { not: 'CANCELLED' },
        },
        _avg: { total: true },
      }),
    ]);

    return {
      totalOrders,
      byStatus: statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byPaymentStatus: paymentStatusCounts.reduce(
        (acc, item) => {
          acc[item.paymentStatus] = item._count;
          return acc;
        },
        {} as Record<string, number>
      ),
      totalRevenue: totalRevenue._sum.total || 0,
      averageOrderValue: averageOrderValue._avg.total || 0,
    };
  }

  /**
   * Get recent orders (admin)
   */
  static async getRecentOrders(limit = 10) {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        coupon: {
          select: {
            code: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return orders.map((order) => this.formatOrderResponse(order));
  }

  /**
   * Generate unique order number
   */
  private static async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    const prefix = `ORD${year}${month}${day}`;

    // Get count of orders today
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `${prefix}-${sequence}`;
  }

  /**
   * Format order response
   */
  private static formatOrderResponse(order: any): OrderWithDetails {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId,
      status: order.status,
      items: order.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        size: item.size,
        color: item.color,
      })),
      subtotal: order.subtotal,
      discount: order.discount,
      shippingCost: order.shippingCost,
      tax: order.tax,
      total: order.total,
      couponCode: order.coupon?.code || null,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
