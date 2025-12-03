export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'expired';
export type PlanType = 'free' | 'pro' | 'enterprise';

export interface PlanFeatures {
  // Generic feature set for the template; customize per project
  itemsPerMonth: number;
  exportOptions: string[]; // e.g., ['pdf', 'png', 'svg']
  prioritySupport: boolean;
  [key: string]: any; // Allow additional features
}

export interface ISubscription {
  id: string;
  accountId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  features: PlanFeatures;
  paymentProvider: string; // 'stripe', 'paypal', etc.
  providerSubscriptionId?: string; // External provider subscription ID
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription implements ISubscription {
  id: string;
  accountId: string;
  planType: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  features: PlanFeatures;
  paymentProvider: string;
  providerSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<ISubscription>) {
    this.id = data.id || '';
    this.accountId = data.accountId || '';
    this.planType = data.planType || 'free';
    this.status = data.status || 'active';
    this.currentPeriodStart = data.currentPeriodStart || new Date();
    this.currentPeriodEnd = data.currentPeriodEnd || new Date();
    this.cancelAtPeriodEnd = data.cancelAtPeriodEnd ?? false;
    this.cancelledAt = data.cancelledAt;
    this.features = data.features || this.getDefaultFeatures(data.planType || 'free');
    this.paymentProvider = data.paymentProvider || 'stripe';
    this.providerSubscriptionId = data.providerSubscriptionId;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Get default features based on plan type
   */
  private getDefaultFeatures(planType: PlanType): PlanFeatures {
    const features: Record<PlanType, PlanFeatures> = {
      free: {
        itemsPerMonth: 5,
        exportOptions: ['pdf'],
        prioritySupport: false,
      },
      pro: {
        itemsPerMonth: 50,
        exportOptions: ['pdf', 'png', 'svg'],
        prioritySupport: true,
      },
      enterprise: {
        itemsPerMonth: -1, // Unlimited
        exportOptions: ['pdf', 'png', 'svg'],
        prioritySupport: true,
      },
    };
    return features[planType];
  }

  /**
   * Check if subscription is active
   */
  isActive(): boolean {
    return this.status === 'active' || this.status === 'trialing';
  }

  /**
   * Check if subscription has expired
   */
  isExpired(): boolean {
    return this.status === 'expired' || (this.currentPeriodEnd < new Date() && this.status !== 'active');
  }
}

