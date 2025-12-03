import { Request, Response } from 'express';
import { SubscriptionService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { SubscriptionDTO } from '../dto';

/**
 * Subscription Controller
 * Handles HTTP requests for subscription operations
 */
export class SubscriptionController extends BaseController {
  constructor(private readonly subscriptionService: SubscriptionService) {
    super();
  }

  /**
   * Create subscription
   */
  create = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;
    const { planType, paymentProvider } = req.body;

    const subscription = await this.subscriptionService.createSubscription(
      accountId,
      planType,
      paymentProvider
    );
    const subscriptionDTO = SubscriptionDTO.from(subscription);

    return this.success(res, { subscription: subscriptionDTO }, 201);
  });

  /**
   * Get subscription by account ID
   */
  getByAccountId = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;

    const subscription = await this.subscriptionService.getByAccountId(accountId);

    if (!subscription) {
      return this.success(res, { subscription: null });
    }

    const subscriptionDTO = SubscriptionDTO.from(subscription);
    return this.success(res, { subscription: subscriptionDTO });
  });

  /**
   * Get current plan features
   */
  getCurrentPlan = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;

    const planFeatures = await this.subscriptionService.getCurrentPlanFeatures(accountId);

    return this.success(res, { plan: planFeatures });
  });

  /**
   * Update subscription plan
   */
  updatePlan = catchAsync(async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const { planType } = req.body;

    const subscription = await this.subscriptionService.updatePlan(subscriptionId, planType);
    const subscriptionDTO = SubscriptionDTO.from(subscription);

    return this.success(res, { subscription: subscriptionDTO });
  });

  /**
   * Cancel subscription
   */
  cancel = catchAsync(async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;
    const { cancelAtPeriodEnd } = req.body;

    const subscription = await this.subscriptionService.cancelSubscription(
      subscriptionId,
      cancelAtPeriodEnd ?? true
    );
    const subscriptionDTO = SubscriptionDTO.from(subscription);

    return this.success(res, { subscription: subscriptionDTO });
  });

  /**
   * Resume subscription
   */
  resume = catchAsync(async (req: Request, res: Response) => {
    const { subscriptionId } = req.params;

    const subscription = await this.subscriptionService.resumeSubscription(subscriptionId);
    const subscriptionDTO = SubscriptionDTO.from(subscription);

    return this.success(res, { subscription: subscriptionDTO });
  });
}

