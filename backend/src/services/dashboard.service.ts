import { OrderStatus, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { CACHE_TTL, cache } from '../utils/cache';
import { LOW_STOCK_THRESHOLD } from './product.service';

export type SalesPeriod = 'week' | 'month' | 'year';

const DAY_MS = 24 * 60 * 60 * 1000;
const OPEN_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'SHIPPED'];
const LIVE_ORDER: Prisma.OrderWhereInput = { status: { notIn: ['CANCELLED', 'REFUNDED'] } };

interface SalesBucket {
  date: string;
  sales: number;
  orders: number;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date) {
  return `${date.toISOString().slice(0, 7)}-01`;
}

function periodBuckets(period: SalesPeriod, now: Date) {
  if (period === 'year') {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
    const keys = Array.from({ length: 12 }, (_, i) =>
      monthKey(new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))),
    );
    return { start, keys, keyOf: monthKey };
  }
  const days = period === 'week' ? 7 : 30;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const start = new Date(today - (days - 1) * DAY_MS);
  const keys = Array.from({ length: days }, (_, i) =>
    dayKey(new Date(start.getTime() + i * DAY_MS)),
  );
  return { start, keys, keyOf: dayKey };
}

export class DashboardService {
  static async getOverallStats() {
    return cache.getOrSet('orders', ['dashboard-stats'], CACHE_TTL.short, () => this.loadStats());
  }

  private static async loadStats() {
    const [
      totalUsers,
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      collected,
      cashToCollect,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({
        where: { isActive: true, stockQuantity: { gt: 0, lte: LOW_STOCK_THRESHOLD } },
      }),
      prisma.product.count({ where: { isActive: true, stockQuantity: 0 } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING'] } } }),
      prisma.order.count({ where: { status: 'DELIVERED' } }),
      prisma.order.aggregate({ where: LIVE_ORDER, _sum: { amountPaid: true } }),
      prisma.order.findMany({
        where: { paymentMethod: 'CASH_ON_DELIVERY', status: { in: OPEN_STATUSES } },
        select: { total: true, amountPaid: true },
      }),
    ]);

    return {
      users: { total: totalUsers },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
      orders: { total: totalOrders, pending: pendingOrders, completed: completedOrders },
      revenue: {
        total: collected._sum.amountPaid || 0,
        cashToCollect: cashToCollect.reduce(
          (sum, order) => sum + Math.max(0, order.total - order.amountPaid),
          0,
        ),
      },
    };
  }

  static async getSalesAnalytics(period: SalesPeriod = 'month') {
    return cache.getOrSet('orders', ['sales', period, dayKey(new Date())], CACHE_TTL.short, () =>
      this.loadSales(period),
    );
  }

  private static async loadSales(period: SalesPeriod) {
    const { start, keys, keyOf } = periodBuckets(period, new Date());

    const orders = await prisma.order.findMany({
      where: { ...LIVE_ORDER, createdAt: { gte: start } },
      select: {
        total: true,
        discount: true,
        tax: true,
        shippingCost: true,
        amountPaid: true,
        createdAt: true,
      },
    });

    const buckets = new Map<string, SalesBucket>(
      keys.map((date) => [date, { date, sales: 0, orders: 0 }]),
    );
    const sum = (pick: (order: (typeof orders)[number]) => number) =>
      orders.reduce((total, order) => total + pick(order), 0);

    for (const order of orders) {
      const bucket = buckets.get(keyOf(order.createdAt));
      if (!bucket) continue;
      bucket.sales += order.total;
      bucket.orders += 1;
    }

    const totalSales = sum((o) => o.total);

    return {
      period,
      granularity: period === 'year' ? 'month' : 'day',
      summary: {
        totalSales,
        totalOrders: orders.length,
        averageOrderValue: orders.length ? totalSales / orders.length : 0,
        totalCollected: sum((o) => o.amountPaid),
        totalDiscount: sum((o) => o.discount),
        totalTax: sum((o) => o.tax),
        totalShipping: sum((o) => o.shippingCost),
      },
      chart: [...buckets.values()],
    };
  }

  static async getTopProducts(limit = 10) {
    return cache.getOrSet('orders', ['top-products', limit], CACHE_TTL.medium, () =>
      this.loadTopProducts(limit),
    );
  }

  private static async loadTopProducts(limit: number) {
    const items = await prisma.orderItem.findMany({
      where: { order: LIVE_ORDER },
      select: { productId: true, orderId: true, quantity: true, price: true },
    });

    const totals = new Map<string, { sold: number; revenue: number; orders: Set<string> }>();
    for (const item of items) {
      const entry = totals.get(item.productId) ?? { sold: 0, revenue: 0, orders: new Set() };
      entry.sold += item.quantity;
      entry.revenue += item.quantity * item.price;
      entry.orders.add(item.orderId);
      totals.set(item.productId, entry);
    }

    const ranked = [...totals.entries()]
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, limit);
    const products = ranked.length
      ? await prisma.product.findMany({
          where: { id: { in: ranked.map(([id]) => id) } },
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            salePrice: true,
            imageUrl: true,
            images: true,
            stockQuantity: true,
            category: { select: { name: true } },
          },
        })
      : [];
    const productById = new Map(products.map((p) => [p.id, p]));

    return ranked
      .filter(([id]) => productById.has(id))
      .map(([id, entry]) => ({
        product: productById.get(id)!,
        totalSold: entry.sold,
        revenue: entry.revenue,
        orderCount: entry.orders.size,
      }));
  }

  static async getRecentOrders(limit = 10) {
    return cache.getOrSet('orders', ['recent', limit], CACHE_TTL.short, () =>
      prisma.order.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true, name: true },
          },
          items: { select: { productName: true, quantity: true, price: true } },
        },
      }),
    );
  }

  static async getRevenueByCategory() {
    return cache.getOrSet('orders', ['revenue-by-category'], CACHE_TTL.medium, () =>
      this.loadRevenueByCategory(),
    );
  }

  private static async loadRevenueByCategory() {
    const orderItems = await prisma.orderItem.findMany({
      where: { order: LIVE_ORDER },
      select: {
        quantity: true,
        price: true,
        product: { select: { category: { select: { id: true, name: true } } } },
      },
    });

    const byCategory = new Map<
      string,
      { categoryId: string; categoryName: string; revenue: number; itemsSold: number }
    >();
    for (const item of orderItems) {
      const { id, name } = item.product.category;
      const entry = byCategory.get(id) ?? {
        categoryId: id,
        categoryName: name,
        revenue: 0,
        itemsSold: 0,
      };
      entry.revenue += item.quantity * item.price;
      entry.itemsSold += item.quantity;
      byCategory.set(id, entry);
    }

    return [...byCategory.values()].sort((a, b) => b.revenue - a.revenue);
  }

  static async getLowStockAlert(threshold = LOW_STOCK_THRESHOLD) {
    return cache.getOrSet('products', ['low-stock-alert', threshold], CACHE_TTL.short, () =>
      prisma.product.findMany({
        where: { isActive: true, stockQuantity: { lte: threshold } },
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          stockQuantity: true,
          imageUrl: true,
          images: true,
          category: { select: { name: true } },
        },
        orderBy: [{ stockQuantity: 'asc' }, { name: 'asc' }],
      }),
    );
  }

  static async getCustomerInsights() {
    return cache.getOrSet('customers', ['insights'], CACHE_TTL.short, () =>
      this.loadCustomerInsights(),
    );
  }

  private static async loadCustomerInsights() {
    const now = new Date();
    const [totalCustomers, newCustomersThisMonth, topCustomers] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
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
          _count: { select: { orders: true } },
        },
        orderBy: { orders: { _count: 'desc' } },
      }),
    ]);

    const spendByCustomer = topCustomers.length
      ? await prisma.order.groupBy({
          by: ['userId'],
          where: { ...LIVE_ORDER, userId: { in: topCustomers.map((c) => c.id) } },
          _sum: { total: true },
        })
      : [];
    const spentById = new Map(spendByCustomer.map((s) => [s.userId, s._sum.total || 0]));

    return {
      totalCustomers,
      newCustomersThisMonth,
      topCustomers: topCustomers.map((customer) => ({
        ...customer,
        totalSpent: spentById.get(customer.id) || 0,
      })),
    };
  }
}
