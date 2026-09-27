import { Redis } from 'ioredis';
import { logger } from './logger';

export const REDIS_KEY_PREFIX = process.env.REDIS_KEY_PREFIX || 'caddycomfort:';

function createRedisClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn('REDIS_URL is not set; caching is disabled');
    return null;
  }

  const client = new Redis(url, {
    keyPrefix: REDIS_KEY_PREFIX,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    retryStrategy: (attempt) => Math.min(attempt * 500, 10000),
  });

  client.on('ready', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.warn({ err: err.message }, 'Redis error'));
  client.on('end', () => logger.warn('Redis connection closed'));

  client
    .connect()
    .catch((err) => logger.warn({ err: err.message }, 'Redis initial connection failed'));

  return client;
}

export const redis = createRedisClient();

export function isRedisReady(): boolean {
  return redis?.status === 'ready';
}

export async function closeRedis(): Promise<void> {
  if (redis) await redis.quit().catch(() => redis.disconnect());
}
