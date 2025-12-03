import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import compression from 'compression';
import {
  authRoutes,
  accountRoutes,
  dashboardRoutes,
  profileRoutes,
  activityRoutes,
  onboardingRoutes,
  subscriptionRoutes,
  billingRoutes,
} from './routes';
import { config } from './config';
import { setupDI } from './di';
import { AppError, ValidationError } from './errors';
import { swaggerSpec } from './config/swagger';
import { requestLogger, logger } from './utils';
import { apiRateLimiter } from './middlewares';

// Simple sanitization helpers to guard against basic XSS and query injection
const sanitizeString = (value: string): string =>
  value.replace(/</g, '&lt;').replace(/>/g, '&gt;');

const sanitizeObject = (value: any): any => {
  if (value == null) return value;
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map(sanitizeObject);
  if (typeof value === 'object') {
    const cleaned: any = {};
    Object.keys(value).forEach((key) => {
      // Remove keys that look like Mongo operators or could be used for query injection
      if (key.startsWith('$') || key.includes('.')) {
        return;
      }
      cleaned[key] = sanitizeObject(value[key]);
    });
    return cleaned;
  }
  return value;
};

const sanitizeRequest = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

// Setup Dependency Injection
setupDI();

const app: Application = express();

// CORS - Allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// Logging
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitization (XSS + basic query injection protection)
app.use(sanitizeRequest);

// Global rate limiting
app.use(apiRateLimiter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Server is running
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Swagger documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: `${config.APP_NAME} API Documentation`,
  })
);

// API Routes
const apiVersion = `/api/${config.API_VERSION}`;
app.use(`${apiVersion}/auth`, authRoutes);
app.use(`${apiVersion}/accounts`, accountRoutes);
app.use(`${apiVersion}/dashboard`, dashboardRoutes);
app.use(`${apiVersion}/profile`, profileRoutes);
app.use(`${apiVersion}/activities`, activityRoutes);
app.use(`${apiVersion}/onboarding`, onboardingRoutes);
app.use(`${apiVersion}/subscriptions`, subscriptionRoutes);
app.use(`${apiVersion}/billing`, billingRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response) => {
  // Handle known operational errors
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      message: err.message,
    };

    // Add validation errors if it's a ValidationError
    if (err instanceof ValidationError && err.errors.length > 0) {
      response.errors = err.errors;
    }

    // Add stack trace in development
    if (config.NODE_ENV === 'development') {
      response.stack = err.stack;
    }

    return res.status(err.statusCode).json(response);
  }

  // Handle unknown errors
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
  });

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
});

export default app;

