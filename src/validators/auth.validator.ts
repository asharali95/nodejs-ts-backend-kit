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
  // Authentication method and optional provider (for OAuth2 / SSO)
  method: z.enum(['password', 'oauth2', 'saml', 'sso']).default('password').optional(),
  provider: z.string().optional(),
  // Credentials for password-based auth
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(1, 'Password is required').optional(),
  // Optional fields/hooks for other flows (placeholders for future use)
  oauthCode: z.string().optional(),
  samlResponse: z.string().optional(),
  ssoToken: z.string().optional(),
  mfaCode: z.string().optional(),
});

// Change password validation schema (body)
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

// Forgot password (request reset) schema
export const requestPasswordResetBodySchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Reset password schema
export const resetPasswordBodySchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
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

