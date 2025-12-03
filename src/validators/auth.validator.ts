import { z } from 'zod';
import { updateProfileBodySchema } from './profile.validator';

// Register validation schema (body)
export const registerBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  accountName: z.string().min(1, 'Account name is required'),
  subdomain: z.string().regex(/^[a-z0-9-]+$/, 'Invalid subdomain format').optional(),
});

// Login validation schema (body)
export const loginBodySchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Change password validation schema (body)
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Note: updateProfileBodySchema moved to profile.validator.ts

// Legacy exports for backward compatibility
export const registerSchema = z.object({
  body: registerBodySchema,
});

export const loginSchema = z.object({
  body: loginBodySchema,
});

export const changePasswordSchema = z.object({
  body: changePasswordBodySchema,
});

export const updateProfileSchema = z.object({
  body: updateProfileBodySchema,
});

