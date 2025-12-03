import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { catchAsync } from '../utils';

/**
 * Validates request data against a Zod schema
 * @param schema - Zod schema to validate against
 * @param source - Where to get the data from ('body' | 'query' | 'params')
 * @returns Express middleware function
 */
export const validate = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[source];
      const validated = await schema.parseAsync(data);
      req[source] = validated;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return next(error);
    }
  });
};

