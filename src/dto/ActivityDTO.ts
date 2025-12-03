import { Activity } from '../models';

/**
 * Activity Data Transfer Object
 * Used for API responses to control what data is exposed
 */
export class ActivityDTO {
  id: string;
  userId: string;
  accountId: string;
  activityType: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;

  constructor(activity: Activity) {
    this.id = activity.id;
    this.userId = activity.userId;
    this.accountId = activity.accountId;
    this.activityType = activity.activityType;
    this.description = activity.description;
    this.metadata = activity.metadata;
    this.createdAt = activity.createdAt;
  }

  /**
   * Create DTO from activity model
   */
  static from(activity: Activity): ActivityDTO {
    return new ActivityDTO(activity);
  }

  /**
   * Create DTOs from array of activities
   */
  static fromArray(activities: Activity[]): ActivityDTO[] {
    return activities.map((activity) => ActivityDTO.from(activity));
  }
}

