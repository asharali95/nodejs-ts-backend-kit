import { z } from 'zod';

// Create subscription validation schema
export const createSubscriptionBodySchema = z.object({
  planType: z.enum(['free', 'pro', 'enterprise'], {
    errorMap: () => ({ message: 'Invalid plan type' }),
  }),
  paymentProvider: z.string().default('stripe').optional(),
});

// Update subscription plan validation schema
export const updateSubscriptionPlanBodySchema = z.object({
  planType: z.enum(['free', 'pro', 'enterprise'], {
    errorMap: () => ({ message: 'Invalid plan type' }),
  }),
});

// Subscription ID validation schema
export const subscriptionIdParamsSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID is required'),
});

// Cancel subscription validation schema
export const cancelSubscriptionBodySchema = z.object({
  cancelAtPeriodEnd: z.boolean().default(true).optional(),
});

