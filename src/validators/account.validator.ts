import { z } from 'zod';
import { accountIdParamsSchema } from './common.validator';

// Create account validation schema (body)
export const createAccountBodySchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  subdomain: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens')
    .min(3, 'Subdomain must be at least 3 characters')
    .max(63, 'Subdomain must be at most 63 characters')
    .optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
});

// Update account validation schema (body)
export const updateAccountBodySchema = z.object({
  name: z.string().min(1).optional(),
  subdomain: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'Subdomain must contain only lowercase letters, numbers, and hyphens')
    .min(3)
    .max(63)
    .optional(),
  plan: z.enum(['free', 'pro', 'enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'cancelled']).optional(),
});

// Note: accountIdParamsSchema moved to common.validator.ts

// Legacy exports for backward compatibility
export const createAccountSchema = z.object({
  body: createAccountBodySchema,
});

export const updateAccountSchema = z.object({
  body: updateAccountBodySchema,
  params: accountIdParamsSchema,
});

export const getAccountByIdSchema = z.object({
  params: accountIdParamsSchema,
});

