import mongoose from 'mongoose';
import { z } from 'zod';

// Common parameter schemas
export const userIdParamsSchema = z.object({
  userId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid user ID'),
});

export const accountIdParamsSchema = z.object({
  accountId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), 'Invalid account ID'),
});

