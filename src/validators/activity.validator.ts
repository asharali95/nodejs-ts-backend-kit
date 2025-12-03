import { z } from 'zod';

// Get activities query schema
export const getActivitiesQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional()
    .default('20'),
  activityType: z
    .enum([
      'floor_plan_created',
      'floor_plan_updated',
      'floor_plan_deleted',
      'floor_plan_published',
      'profile_updated',
      'account_created',
      'account_updated',
      'user_registered',
      'user_logged_in',
      'trial_started',
      'trial_ended',
    ])
    .optional(),
});

