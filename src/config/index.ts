import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().regex(/^\d+$/).transform(Number).default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_TTL: z.string().regex(/^\d+$/).transform(Number).default('3600'), // Default 1 hour
  JWT_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  API_VERSION: z.string().default('v1'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_ID_FREE: z.string().optional(),
  STRIPE_PRICE_ID_PRO: z.string().optional(),
  STRIPE_PRICE_ID_ENTERPRISE: z.string().optional(),
  // Template configuration
  APP_NAME: z.string().default('SaaS Backend Template'),
  TRIAL_DAYS: z.string().regex(/^\d+$/).transform(Number).default('14'),
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^\d+$/).transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^\d+$/).transform(Number).default('100'),
  // Notification providers (placeholders for real implementations)
  EMAIL_FROM_ADDRESS: z.string().email().default('no-reply@example.com'),
  EMAIL_PROVIDER: z.string().default('noop'),
  SMS_PROVIDER: z.string().default('noop'),
});

// Validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

// Export validated config
export const config = parseEnv();

// Type for the config
export type Config = z.infer<typeof envSchema>;

