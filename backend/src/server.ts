import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { logger } from './config/logger';
import { requestLogger } from './middleware/logger.middleware';
import { errorHandler, notFound } from './middleware/error.middleware';
import routes from './routes';
import { initializePaymentReconciliationJob } from './jobs/payment-reconciliation.job';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';
// When the frontend runs as its own container/service, this API must stay a
// pure API and must not try to boot Next.js from a sibling directory.
const serveFrontend = process.env.SERVE_FRONTEND !== 'false';

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
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

// Serve Next.js frontend in production
if (isProduction && serveFrontend) {
  const frontendPath = path.join(__dirname, '../../frontend/.next/standalone');
  const frontendPublicPath = path.join(__dirname, '../../frontend/public');
  const frontendStaticPath = path.join(__dirname, '../../frontend/.next/static');
  
  // Serve static files
  app.use('/public', express.static(frontendPublicPath));
  app.use('/_next/static', express.static(frontendStaticPath));
  
  // Proxy all other requests to Next.js
  const { createServer } = require('http');
  const { parse } = require('url');
  const next = require('next');
  
  const nextApp = next({
    dev: false,
    dir: path.join(__dirname, '../../frontend'),
  });
  const handle = nextApp.getRequestHandler();
  
  nextApp.prepare().then(() => {
    app.get('*', (req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl);
    });
  });
} else {
  // API-only mode: unmatched routes are 404s, not frontend routes.
  app.use(notFound);
  app.use(errorHandler);
}

app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);

  initializePaymentReconciliationJob();
});
