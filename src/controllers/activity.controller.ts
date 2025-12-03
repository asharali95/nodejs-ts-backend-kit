import { Request, Response } from 'express';
import { ActivityService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { ActivityDTO } from '../dto';

/**
 * Activity Controller
 * Handles HTTP requests for activity operations
 */
export class ActivityController extends BaseController {
  constructor(private readonly activityService: ActivityService) {
    super();
  }

  /**
   * Get recent activities for a user
   */
  getByUserId = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const activities = await this.activityService.getRecentByUserId(userId, limit);
    const activitiesDTO = ActivityDTO.fromArray(activities);

    return this.success(res, { activities: activitiesDTO });
  });

  /**
   * Get recent activities for an account
   */
  getByAccountId = catchAsync(async (req: Request, res: Response) => {
    const { accountId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    const activities = await this.activityService.getRecentByAccountId(accountId, limit);
    const activitiesDTO = ActivityDTO.fromArray(activities);

    return this.success(res, { activities: activitiesDTO });
  });

  /**
   * Get all recent activities (for current user/account - to be filtered by auth middleware)
   */
  getRecent = catchAsync(async (req: Request, res: Response) => {
    // Use userId and accountId from token if available, otherwise from query
    const accountId = req.user?.accountId || (req.query.accountId as string);
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

    // Get activities for the account (includes all users in the account)
    const activities = await this.activityService.getRecentByAccountId(accountId, limit);
    const activitiesDTO = ActivityDTO.fromArray(activities);

    return this.success(res, { activities: activitiesDTO });
  });
}

