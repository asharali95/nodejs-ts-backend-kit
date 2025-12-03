import { z } from 'zod';

// Submit onboarding validation schema (body)
export const submitOnboardingBodySchema = z.object({
  userType: z.enum(['individual', 'architect', 'real_estate_company', 'other'], {
    errorMap: () => ({ message: 'Invalid user type' }),
  }),
  mainGoal: z.enum(['personal_project', 'business_use', 'client_work', 'education_learning'], {
    errorMap: () => ({ message: 'Invalid main goal' }),
  }),
  monthlyProjects: z.enum(['1-5', '6-15', '16-30', '30+'], {
    errorMap: () => ({ message: 'Invalid monthly projects count' }),
  }),
  companyName: z.string().min(1, 'Company name is required').max(200).optional(),
});

