import { isRedisReady, redis } from '../config/redis';
import { logger } from '../config/logger';

export const CACHE_TTL = {
  short: 60,
  medium: 300,
  long: 3600,
} as const;

export type CacheNamespace = 'products' | 'categories' | 'reviews';

const versionKey = (namespace: CacheNamespace) => `${namespace}:version`;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'undefined';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  const body = entries.map(([k, v]) => JSON.stringify(k) + ':' + stableStringify(v)).join(',');
  return '{' + body + '}';
}

async function namespaceVersion(namespace: CacheNamespace): Promise<string> {
  return (await redis!.get(versionKey(namespace))) ?? '0';
}

async function getOrSet<T>(
  namespace: CacheNamespace,
  keyParts: unknown,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  if (!isRedisReady()) return loader();

  let key: string | null = null;
  try {
    const version = await namespaceVersion(namespace);
    key = `${namespace}:v${version}:${stableStringify(keyParts)}`;
    const cached = await redis!.get(key);
    if (cached !== null) return JSON.parse(cached) as T;
  } catch (err) {
    logger.warn({ err, namespace }, 'Cache read failed');
  }

  const value = await loader();

  if (key && value !== undefined) {
    redis!
      .set(key, JSON.stringify(value), 'EX', ttlSeconds)
      .catch((err) => logger.warn({ err, namespace }, 'Cache write failed'));
  }

  return value;
}

async function invalidate(...namespaces: CacheNamespace[]): Promise<void> {
  if (!isRedisReady() || namespaces.length === 0) return;
  try {
    const pipeline = redis!.pipeline();
    namespaces.forEach((namespace) => pipeline.incr(versionKey(namespace)));
    await pipeline.exec();
  } catch (err) {
    logger.warn({ err, namespaces }, 'Cache invalidation failed');
  }
}

export const cache = { getOrSet, invalidate };
