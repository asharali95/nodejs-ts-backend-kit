import { Request, Response } from 'express';
import { OnboardingService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { OnboardingDTO } from '../dto';

/**
 * Onboarding Controller
 * Handles HTTP requests for onboarding operations
 */
export class OnboardingController extends BaseController {
  constructor(private readonly onboardingService: OnboardingService) {
    super();
  }

  /**
   * Submit onboarding survey
   */
  submit = catchAsync(async (req: Request, res: Response) => {
    // Use userId and accountId from token if available
    const userId = req.user?.userId || req.params.userId;
    const accountId = req.user?.accountId || req.body.accountId;
    const { userType, mainGoal, monthlyProjects, companyName } = req.body;

    const onboarding = await this.onboardingService.submitOnboarding(userId, accountId, {
      userType,
      mainGoal,
      monthlyProjects,
      companyName,
    });
    const onboardingDTO = OnboardingDTO.from(onboarding);

    return this.success(res, { onboarding: onboardingDTO }, 201);
  });

  /**
   * Get onboarding by user ID
   */
  getByUserId = catchAsync(async (req: Request, res: Response) => {
    // Use userId from token if available, otherwise from params
    const userId = req.user?.userId || req.params.userId;

    const onboarding = await this.onboardingService.getByUserId(userId);

    if (!onboarding) {
      return this.success(res, { onboarding: null, completed: false });
    }

    const onboardingDTO = OnboardingDTO.from(onboarding);
    return this.success(res, { onboarding: onboardingDTO, completed: true });
  });

  /**
   * Check onboarding status
   */
  checkStatus = catchAsync(async (req: Request, res: Response) => {
    const userId = req.params.userId;

    const hasCompleted = await this.onboardingService.hasCompletedOnboarding(userId);

    return this.success(res, { completed: hasCompleted });
  });
}

