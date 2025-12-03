export type ActivityType =
  | 'floor_plan_created'
  | 'floor_plan_updated'
  | 'floor_plan_deleted'
  | 'floor_plan_published'
  | 'profile_updated'
  | 'account_created'
  | 'account_updated'
  | 'user_registered'
  | 'user_logged_in'
  | 'trial_started'
  | 'trial_ended'
  | 'trial_expired';

export interface IActivity {
  id: string;
  userId: string;
  accountId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>; // Additional data about the activity
  createdAt: Date;
}

export class Activity implements IActivity {
  id: string;
  userId: string;
  accountId: string;
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;

  constructor(data: Partial<IActivity>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.accountId = data.accountId || '';
    this.activityType = data.activityType || 'user_logged_in';
    this.description = data.description || '';
    this.metadata = data.metadata;
    this.createdAt = data.createdAt || new Date();
  }
}

