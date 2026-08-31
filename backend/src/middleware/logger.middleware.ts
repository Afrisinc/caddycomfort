import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log incoming request
  const requestInfo: any = {
    method: req.method,
    url: req.url,
    ip: req.ip,
  };

  // Log request body for POST, PUT, PATCH requests (but hide sensitive data)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const sanitizedBody = { ...req.body };
    // Hide sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
    if (sanitizedBody.token) sanitizedBody.token = '[HIDDEN]';
    requestInfo.body = sanitizedBody;
  }

  // Log query parameters
  if (Object.keys(req.query).length > 0) {
    requestInfo.query = req.query;
  }

  console.log(
    `\n🔵 ${req.method} ${req.url}`,
    req.query ? `Query: ${JSON.stringify(req.query)}` : '',
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '🔴' : res.statusCode >= 400 ? '🟠' : '🟢';

    console.log(`${statusColor} ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms\n`);

    logger.info({
      ...requestInfo,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};
