import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  // Console log for better visibility in development
  console.error('\n🔴 ERROR OCCURRED:');
  console.error(`Method: ${req.method} ${req.url}`);
  console.error(`Status: ${statusCode}`);
  console.error(`Message: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
  }
  console.error('');

  logger.error({
    err,
    req: {
      method: req.method,
      url: req.url,
      body: req.body,
      query: req.query,
    },
  });

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
