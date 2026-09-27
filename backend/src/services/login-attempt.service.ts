import { LoginFailureReason, Prisma } from '@prisma/client';
import prisma from '../config/database';
import { logger } from '../config/logger';
import { pageMeta, skipOf, type PageQuery } from '../utils/pagination';

export type AttemptRange = '24h' | '7d' | '30d';
export type AttemptStatus = 'success' | 'failed';

export interface AttemptContext {
  ipAddress?: string;
  userAgent?: string;
}

export interface AttemptFilters {
  range: AttemptRange;
  status?: AttemptStatus;
  search?: string;
}

export const ATTEMPT_RANGES: AttemptRange[] = ['24h', '7d', '30d'];
export const RETENTION_DAYS = 90;
const FLAG_THRESHOLD = 5;
const RANGE_HOURS: Record<AttemptRange, number> = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };

function since(range: AttemptRange) {
  return new Date(Date.now() - RANGE_HOURS[range] * 60 * 60 * 1000);
}

function attemptWhere({ range, status, search }: AttemptFilters): Prisma.LoginAttemptWhereInput {
  return {
    createdAt: { gte: since(range) },
    ...(status && { success: status === 'success' }),
    ...(search && {
      OR: [
        { email: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search } },
      ],
    }),
  };
}

export class LoginAttemptService {
  static async record(
    email: string,
    outcome: { userId?: string; success: boolean; reason?: LoginFailureReason },
    context: AttemptContext,
  ) {
    try {
      await prisma.$transaction([
        prisma.loginAttempt.create({
          data: {
            email,
            userId: outcome.userId,
            success: outcome.success,
            reason: outcome.reason,
            ipAddress: context.ipAddress?.replace(/^::ffff:/, '').slice(0, 64),
            userAgent: context.userAgent?.slice(0, 512),
          },
        }),
        ...(outcome.success && outcome.userId
          ? [
              prisma.user.update({
                where: { id: outcome.userId },
                data: { lastLoginAt: new Date() },
              }),
            ]
          : []),
      ]);
    } catch (err) {
      logger.warn({ err }, 'Failed to record login attempt');
    }
  }

  static async list(filters: AttemptFilters, pageQuery: PageQuery) {
    const where = attemptWhere(filters);
    const [attempts, total] = await Promise.all([
      prisma.loginAttempt.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: skipOf(pageQuery),
        take: pageQuery.limit,
        include: {
          user: { select: { id: true, name: true, firstName: true, lastName: true, role: true } },
        },
      }),
      prisma.loginAttempt.count({ where }),
    ]);
    return { attempts, pagination: pageMeta(total, pageQuery) };
  }

  static async stats(range: AttemptRange) {
    const where = { createdAt: { gte: since(range) } };
    const failedWhere = { ...where, success: false };

    const [total, successful, accounts, failedByIp, failedByEmail] = await Promise.all([
      prisma.loginAttempt.count({ where }),
      prisma.loginAttempt.count({ where: { ...where, success: true } }),
      prisma.loginAttempt.groupBy({
        by: ['userId'],
        where: { ...where, success: true, userId: { not: null } },
      }),
      prisma.loginAttempt.groupBy({
        by: ['ipAddress'],
        where: { ...failedWhere, ipAddress: { not: null } },
        _count: { _all: true },
        _max: { createdAt: true },
        having: { ipAddress: { _count: { gte: FLAG_THRESHOLD } } },
        orderBy: { _count: { ipAddress: 'desc' } },
        take: 5,
      }),
      prisma.loginAttempt.groupBy({
        by: ['email'],
        where: failedWhere,
        _count: { _all: true },
        _max: { createdAt: true },
        having: { email: { _count: { gte: FLAG_THRESHOLD } } },
        orderBy: { _count: { email: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      range,
      total,
      successful,
      failed: total - successful,
      uniqueAccounts: accounts.length,
      flagThreshold: FLAG_THRESHOLD,
      flagged: [
        ...failedByIp.map((row) => ({
          kind: 'ip' as const,
          value: row.ipAddress!,
          failures: row._count._all,
          lastAttemptAt: row._max.createdAt,
        })),
        ...failedByEmail.map((row) => ({
          kind: 'email' as const,
          value: row.email,
          failures: row._count._all,
          lastAttemptAt: row._max.createdAt,
        })),
      ].sort((a, b) => b.failures - a.failures),
    };
  }

  static async prune(days = RETENTION_DAYS) {
    const { count } = await prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - days * 24 * 60 * 60 * 1000) } },
    });
    return count;
  }
}
