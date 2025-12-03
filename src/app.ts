import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.error('Unexpected error:', err);

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

