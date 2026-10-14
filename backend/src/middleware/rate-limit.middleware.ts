import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import { redis } from '../config/redis';
import { getClientIp } from '../utils/client-ip';
import { readPositiveIntEnv } from '../utils/env';
import { RedisRateLimitStore } from '../utils/redis-rate-limit-store';

const MINUTE = 60_000;
const UNLIMITED_API_PATHS = /^\/(health|webhooks)(\/|$)/;

type RateLimiterOptions = Pick<Options, 'windowMs' | 'limit'> &
  Partial<Pick<Options, 'skip' | 'skipSuccessfulRequests'>> & {
    name: string;
    message: string;
  };

export const createRateLimiter = ({ name, message, ...options }: RateLimiterOptions) =>
  rateLimit({
    ...options,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    passOnStoreError: true,
    keyGenerator: (req) => ipKeyGenerator(getClientIp(req)),
    message: { success: false, message },
    store: redis ? new RedisRateLimitStore(redis, `rate-limit:${name}:`) : undefined,
  });

export const apiLimiter = createRateLimiter({
  name: 'api',
  windowMs: readPositiveIntEnv('RATE_LIMIT_WINDOW_MS', 15 * MINUTE),
  limit: readPositiveIntEnv('RATE_LIMIT_MAX_REQUESTS', 300),
  message: 'Too many requests, please try again later.',
  skip: (req) => UNLIMITED_API_PATHS.test(req.path),
});

export const credentialLimiter = createRateLimiter({
  name: 'credentials',
  windowMs: 15 * MINUTE,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed attempts, please try again in 15 minutes.',
});

export const emailLimiter = createRateLimiter({
  name: 'email',
  windowMs: 60 * MINUTE,
  limit: 5,
  message: 'Too many requests, please try again in an hour.',
});
