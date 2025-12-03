import { Activity, IActivity, ActivityType } from '../models';
import { BaseService } from './BaseService';
import { ActivityRepository } from '../repositories';

/**
 * Activity Service
 * Business logic for activity tracking and retrieval
 */
export class ActivityService extends BaseService<Activity, string> {
  constructor(private readonly activityRepository: ActivityRepository) {
    super();
  }

  /**
   * Create a new activity
   */
  async createActivity(
    userId: string,
    accountId: string,
    activityType: ActivityType,
    description: string,
    metadata?: Record<string, any>
  ): Promise<Activity> {
    return this.activityRepository.create({
      userId,
      accountId,
      activityType,
      description,
      metadata,
      createdAt: new Date(),
    });
  }

  /**
   * Get activity by ID
   */
  async getById(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findById(id);
    this.throwIfNotFound(activity, id, 'Activity');
    return activity;
  }

  /**
   * Get all activities
   */
  async getAll(): Promise<Activity[]> {
    return this.activityRepository.findAll();
  }

  /**
   * Create activity
   */
  async create(data: Partial<IActivity>): Promise<Activity> {
    return this.activityRepository.create(data);
  }

  /**
   * Update activity (rarely used, activities are typically immutable)
   */
  async update(id: string, updates: Partial<IActivity>): Promise<Activity> {
    return this.activityRepository.update(id, updates);
  }

  /**
   * Delete activity
   */
  async delete(id: string): Promise<void> {
    return this.activityRepository.delete(id);
  }

  /**
   * Get recent activities for a user
   */
  async getRecentByUserId(userId: string, limit: number = 20): Promise<Activity[]> {
    return this.activityRepository.getRecentByUserId(userId, limit);
  }

  /**
   * Get recent activities for an account
   */
  async getRecentByAccountId(accountId: string, limit: number = 20): Promise<Activity[]> {
    return this.activityRepository.getRecentByAccountId(accountId, limit);
  }

  /**
   * Get activities by type
   */
  async getByActivityType(
    activityType: ActivityType,
    limit: number = 50
  ): Promise<Activity[]> {
    return this.activityRepository.findByActivityType(activityType, limit);
  }
}

