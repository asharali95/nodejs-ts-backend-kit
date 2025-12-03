import { z } from 'zod';

// Update profile validation schema (body)
export const updateProfileBodySchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  company: z.string().min(1, 'Company name is required').optional(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone number format').optional(),
  profilePicture: z.string().url('Invalid profile picture URL').optional(),
});

