import { Request, Response } from 'express';
import { isRedisReady, redis } from '../config/redis';

function cacheStatus(): 'connected' | 'unavailable' | 'disabled' {
  if (!redis) return 'disabled';
  return isRedisReady() ? 'connected' : 'unavailable';
}

export const healthController = {
  check: async (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      cache: cacheStatus(),
    });
  },
};
