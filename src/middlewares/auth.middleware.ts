import { Request, Response, NextFunction } from 'express';
import { verifyToken, JWTPayload } from '../utils/jwt';
import { UnauthorizedError } from '../errors';

/**
 * Extend Express Request to include user info from JWT
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and extracts user/account information
 */
export const authenticate = (req: Request, _: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    // Verify and decode token
    const decoded = verifyToken(token);

    // Attach user info to request object
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Token has expired') {
        return next(new UnauthorizedError('Token has expired'));
      }
      if (error.message === 'Invalid token') {
        return next(new UnauthorizedError('Invalid token'));
      }
      if (error.message === 'JWT_SECRET is not configured') {
        return next(new UnauthorizedError('Authentication not configured'));
      }
    }
    next(new UnauthorizedError('Authentication failed'));
  }
};

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't fail if missing
 */
export const optionalAuthenticate = (req: Request, _: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }
  next();
};

