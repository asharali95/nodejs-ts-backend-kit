import { z } from 'zod';

// Create invoice validation schema
export const createInvoiceBodySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']).default('USD'),
  description: z.string().min(1, 'Description is required'),
  subscriptionId: z.string().optional(),
  paymentProvider: z.string().default('stripe').optional(),
});

// Billing ID validation schema
export const billingIdParamsSchema = z.object({
  billingId: z.string().min(1, 'Billing ID is required'),
});

// Invoice number validation schema
export const invoiceNumberParamsSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
});

// Get billing history query schema
export const getBillingHistoryQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
});

