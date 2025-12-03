import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

/**
 * Global API rate limiter (IP-based).
 * Defaults: 100 requests / 15 minutes per IP.
 * Configurable via:
 *  - RATE_LIMIT_WINDOW_MS
 *  - RATE_LIMIT_MAX_REQUESTS
 */
export const apiRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

/**
 * Auth-specific rate limiter (stricter).
 * Example: 10 requests / 15 minutes per IP for login/register.
 */
export const authRateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: Math.max(10, Math.round(config.RATE_LIMIT_MAX_REQUESTS / 10)),
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: 'Too many auth attempts. Please try again later.',
    });
  },
});


