import { ActivityService } from '../services';
import { ActivityType } from '../models';

/**
 * Activity Logger Utility
 * Helper functions for logging activities
 */
export class ActivityLogger {
  constructor(private readonly activityService: ActivityService) {}

  /**
   * Log an activity
   */
  async log(
    userId: string,
    accountId: string,
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await this.activityService.createActivity(
        userId,
        accountId,
        activityType,
        description,
        metadata
      );
    } catch (error) {
      // Log error but don't throw - activity logging shouldn't break main flow
      console.error('Failed to log activity:', error);
    }
  }

  /**
   * Log floor plan created
   */
  async logFloorPlanCreated(
    userId: string,
    accountId: string,
    floorPlanId: string,
    floorPlanTitle: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'floor_plan_created',
      `Created floor plan "${floorPlanTitle}"`,
      { floorPlanId, floorPlanTitle }
    );
  }

  /**
   * Log floor plan updated
   */
  async logFloorPlanUpdated(
    userId: string,
    accountId: string,
    floorPlanId: string,
    floorPlanTitle: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'floor_plan_updated',
      `Updated floor plan "${floorPlanTitle}"`,
      { floorPlanId, floorPlanTitle }
    );
  }

  /**
   * Log floor plan deleted
   */
  async logFloorPlanDeleted(
    userId: string,
    accountId: string,
    floorPlanId: string,
    floorPlanTitle: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'floor_plan_deleted',
      `Deleted floor plan "${floorPlanTitle}"`,
      { floorPlanId, floorPlanTitle }
    );
  }

  /**
   * Log floor plan published
   */
  async logFloorPlanPublished(
    userId: string,
    accountId: string,
    floorPlanId: string,
    floorPlanTitle: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'floor_plan_published',
      `Published floor plan "${floorPlanTitle}"`,
      { floorPlanId, floorPlanTitle }
    );
  }

  /**
   * Log profile updated
   */
  async logProfileUpdated(
    userId: string,
    accountId: string,
    changes: string[]
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'profile_updated',
      `Updated profile: ${changes.join(', ')}`,
      { changes }
    );
  }

  /**
   * Log user registered
   */
  async logUserRegistered(
    userId: string,
    accountId: string,
    email: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'user_registered',
      `User registered: ${email}`,
      { email }
    );
  }

  /**
   * Log user logged in
   */
  async logUserLoggedIn(
    userId: string,
    accountId: string,
    email: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'user_logged_in',
      `User logged in: ${email}`,
      { email }
    );
  }

  /**
   * Log account created
   */
  async logAccountCreated(
    userId: string,
    accountId: string,
    accountName: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'account_created',
      `Account created: ${accountName}`,
      { accountName }
    );
  }

  /**
   * Log trial started
   */
  async logTrialStarted(
    userId: string,
    accountId: string,
    accountName: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'trial_started',
      `Trial started for account: ${accountName}`,
      { accountName }
    );
  }

  /**
   * Log trial expired
   */
  async logTrialExpired(
    userId: string,
    accountId: string,
    previousPlan: string
  ): Promise<void> {
    await this.log(
      userId,
      accountId,
      'trial_expired',
      `Trial expired, downgraded from ${previousPlan} to free plan`,
      { previousPlan, newPlan: 'free' }
    );
  }
}

