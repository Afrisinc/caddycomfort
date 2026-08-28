import { UserRole } from '@prisma/client';
import prisma from '../config/database';

// A customer counts as a "VIP" once their lifetime spend crosses this
// threshold (RWF). Kept as a single constant so the business rule is easy
// to tune without hunting through the aggregation logic below.
const VIP_SPEND_THRESHOLD = 1_000_000;

// Orders in these statuses represent real revenue; cancelled/refunded
// orders never happened from a business standpoint and are excluded from
// spend and "last order" calculations.
const REVENUE_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

export type CustomerStatus = 'vip' | 'active' | 'inactive' | 'suspended';

interface CustomerOrderSummary {
  status: (typeof REVENUE_ORDER_STATUSES)[number] | 'CANCELLED' | 'REFUNDED';
  total: number;
  createdAt: Date;
}

function computeStatus(isActive: boolean, ordersCount: number, totalSpent: number): CustomerStatus {
  if (!isActive) return 'suspended';
  if (totalSpent >= VIP_SPEND_THRESHOLD) return 'vip';
  if (ordersCount > 0) return 'active';
  return 'inactive';
}

function summarizeOrders(orders: CustomerOrderSummary[]) {
  const revenueOrders = orders.filter((o) =>
    (REVENUE_ORDER_STATUSES as readonly string[]).includes(o.status)
  );

  const ordersCount = revenueOrders.length;
  const totalSpent = revenueOrders.reduce((sum, o) => sum + o.total, 0);
  const lastOrderAt = revenueOrders.reduce<Date | null>((latest, o) => {
    if (!latest || o.createdAt > latest) return o.createdAt;
    return latest;
  }, null);

  return { ordersCount, totalSpent, lastOrderAt };
}

export class CustomerService {
  /**
   * Admin: list customers (role = CUSTOMER) with real order aggregates and
   * a derived status, optionally filtered by search text and/or status.
   */
  static async getCustomers(filters?: { search?: string; status?: CustomerStatus | 'all' }) {
    const { search, status } = filters || {};

    const where: any = { role: UserRole.CUSTOMER };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        orders: {
          select: { status: true, total: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const customers = users.map((user) => {
      const { ordersCount, totalSpent, lastOrderAt } = summarizeOrders(user.orders as CustomerOrderSummary[]);
      const computedStatus = computeStatus(user.isActive, ordersCount, totalSpent);

      return {
        id: user.id,
        name: user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        isActive: user.isActive,
        joinedAt: user.createdAt,
        ordersCount,
        totalSpent,
        lastOrderAt,
        status: computedStatus,
      };
    });

    if (!status || status === 'all') return customers;
    return customers.filter((c) => c.status === status);
  }

  /**
   * Admin: aggregate stats for the customer dashboard cards.
   */
  static async getCustomerStats() {
    const users = await prisma.user.findMany({
      where: { role: UserRole.CUSTOMER },
      select: {
        isActive: true,
        orders: {
          select: { status: true, total: true, createdAt: true },
        },
      },
    });

    const totalCustomers = users.length;
    let activeCount = 0;
    let totalOrdersAcrossCustomers = 0;
    let totalRevenue = 0;
    let totalRevenueOrders = 0;

    for (const user of users) {
      const { ordersCount, totalSpent } = summarizeOrders(user.orders as CustomerOrderSummary[]);
      const computedStatus = computeStatus(user.isActive, ordersCount, totalSpent);
      if (computedStatus === 'active' || computedStatus === 'vip') activeCount++;
      totalOrdersAcrossCustomers += ordersCount;
      totalRevenue += totalSpent;
      totalRevenueOrders += ordersCount;
    }

    const avgOrdersPerCustomer = totalCustomers > 0 ? totalOrdersAcrossCustomers / totalCustomers : 0;
    const avgOrderValue = totalRevenueOrders > 0 ? totalRevenue / totalRevenueOrders : 0;

    return {
      totalCustomers,
      activeCount,
      avgOrdersPerCustomer,
      avgOrderValue,
    };
  }

  /**
   * Admin: single customer detail — profile, addresses, and full order history.
   */
  static async getCustomerById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isActive: true,
        isVerified: true,
        role: true,
        createdAt: true,
        addresses: true,
        orders: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            total: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new Error('Customer not found');
    }

    const { ordersCount, totalSpent, lastOrderAt } = summarizeOrders(user.orders as CustomerOrderSummary[]);
    const computedStatus = computeStatus(user.isActive, ordersCount, totalSpent);

    return {
      id: user.id,
      name: user.name || [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      isVerified: user.isVerified,
      joinedAt: user.createdAt,
      addresses: user.addresses,
      orders: user.orders,
      ordersCount,
      totalSpent,
      lastOrderAt,
      status: computedStatus,
    };
  }

  /**
   * Admin: suspend or reactivate a customer account.
   */
  static async setActiveStatus(id: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.role !== UserRole.CUSTOMER) {
      throw new Error('Customer not found');
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, isActive: true },
    });

    if (!isActive) {
      // Force sign-out everywhere: kill any live sessions immediately
      // rather than waiting for the short-lived access token to expire.
      await prisma.refreshToken.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    return updated;
  }
}
