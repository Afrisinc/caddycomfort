import prisma from '../config/database';

export class DashboardService {
  /**
   * Get overall dashboard statistics
   */
  static async getOverallStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      activeProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { total: true },
      }),
      prisma.order.count({
        where: {
          status: {
            in: ['PENDING', 'PROCESSING'],
          },
        },
      }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: {
          stockQuantity: { lte: 10, gt: 0 },
          isActive: true,
        },
      }),
    ]);

    return {
      users: {
        total: totalUsers,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue._sum.total || 0,
      },
    };
  }

  /**
   * Get sales analytics
   */
  static async getSalesAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'DELIVERED',
      },
      select: {
        total: true,
        subtotal: true,
        discount: true,
        tax: true,
        shippingCost: true,
        createdAt: true,
      },
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalDiscount = orders.reduce((sum, order) => sum + order.discount, 0);
    const totalTax = orders.reduce((sum, order) => sum + order.tax, 0);
    const totalShipping = orders.reduce((sum, order) => sum + order.shippingCost, 0);

    // Group by date
    const salesByDate = orders.reduce((acc, order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, sales: 0, orders: 0 };
      }
      acc[date].sales += order.total;
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, { date: string; sales: number; orders: number }>);

    return {
      period,
      summary: {
        totalSales,
        totalOrders,
        averageOrderValue,
        totalDiscount,
        totalTax,
        totalShipping,
      },
      chart: Object.values(salesByDate).sort((a, b) => a.date.localeCompare(b.date)),
    };
  }

  /**
   * Get top selling products
   */
  static async getTopProducts(limit = 10) {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: limit,
    });

    const productsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            imageUrl: true,
            images: true,
            stockQuantity: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          product,
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.productId,
        };
      })
    );

    return productsWithDetails.filter((item) => item.product !== null);
  }

  /**
   * Get recent orders
   */
  static async getRecentOrders(limit = 10) {
    return prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            name: true,
          },
        },
        items: {
          select: {
            productName: true,
            quantity: true,
            price: true,
          },
        },
      },
    });
  }

  /**
   * Get revenue by category
   */
  static async getRevenueByCategory() {
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'DELIVERED',
        },
      },
      select: {
        quantity: true,
        price: true,
        product: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const categoryRevenue = orderItems.reduce((acc, item) => {
      const categoryId = item.product.category.id;
      const categoryName = item.product.category.name;
      const revenue = item.quantity * item.price;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId,
          categoryName,
          revenue: 0,
          itemsSold: 0,
        };
      }

      acc[categoryId].revenue += revenue;
      acc[categoryId].itemsSold += item.quantity;

      return acc;
    }, {} as Record<string, { categoryId: string; categoryName: string; revenue: number; itemsSold: number }>);

    return Object.values(categoryRevenue).sort((a, b) => b.revenue - a.revenue);
  }

  /**
   * Get low stock alert
   */
  static async getLowStockAlert(threshold = 10) {
    return prisma.product.findMany({
      where: {
        stockQuantity: { lte: threshold, gt: 0 },
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        stockQuantity: true,
        imageUrl: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  /**
   * Get customer insights
   */
  static async getCustomerInsights() {
    const [
      totalCustomers,
      newCustomersThisMonth,
      topCustomers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        take: 10,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          _count: {
            select: { orders: true },
          },
        },
        orderBy: {
          orders: {
            _count: 'desc',
          },
        },
      }),
    ]);

    const topCustomersWithSpending = await Promise.all(
      topCustomers.map(async (customer) => {
        const totalSpent = await prisma.order.aggregate({
          where: {
            userId: customer.id,
            status: 'DELIVERED',
          },
          _sum: { total: true },
        });

        return {
          ...customer,
          totalSpent: totalSpent._sum.total || 0,
        };
      })
    );

    return {
      totalCustomers,
      newCustomersThisMonth,
      topCustomers: topCustomersWithSpending,
    };
  }
}
