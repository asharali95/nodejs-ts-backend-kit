import { Request, Response } from 'express';
import { DashboardService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';

/**
 * Dashboard Controller
 * Handles HTTP requests for dashboard analytics
 */
export class DashboardController extends BaseController {
  constructor(private readonly dashboardService: DashboardService) {
    super();
  }

  /**
   * Get dashboard analytics
   */
  getAnalytics = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;

    const analytics = await this.dashboardService.getDashboardAnalytics(accountId);

    return this.success(res, { analytics });
  });
}

