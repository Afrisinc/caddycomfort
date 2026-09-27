import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { logger } from './config/logger';
import prisma from './config/database';
import { closeRedis } from './config/redis';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import routes from './routes';
import { initializePaymentReconciliationJob } from './jobs/payment-reconciliation.job';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 'loopback, linklocal, uniquelocal');

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  }),
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.get('cf-connecting-ip') || req.ip || ''),
  skip: (req) => req.path === '/health',
});

app.use('/api', limiter);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use(requestLogger);

// Root health check for Render
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api', routes);

// The frontend is served by its own container; unmatched routes here are
// plain 404s, not frontend routes.
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);

  initializePaymentReconciliationJob();
});

const shutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down`);
  server.close(async () => {
    await Promise.allSettled([closeRedis(), prisma.$disconnect()]);
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
