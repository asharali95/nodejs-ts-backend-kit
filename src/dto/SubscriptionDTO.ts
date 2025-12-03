import { Subscription } from '../models';

/**
 * Subscription Data Transfer Object
 */
export class SubscriptionDTO {
  id: string;
  accountId: string;
  planType: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: Date;
  features: any;
  paymentProvider: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(subscription: Subscription) {
    this.id = subscription.id;
    this.accountId = subscription.accountId;
    this.planType = subscription.planType;
    this.status = subscription.status;
    this.currentPeriodStart = subscription.currentPeriodStart;
    this.currentPeriodEnd = subscription.currentPeriodEnd;
    this.cancelAtPeriodEnd = subscription.cancelAtPeriodEnd;
    this.cancelledAt = subscription.cancelledAt;
    this.features = subscription.features;
    this.paymentProvider = subscription.paymentProvider;
    this.createdAt = subscription.createdAt;
    this.updatedAt = subscription.updatedAt;
  }

  static from(subscription: Subscription): SubscriptionDTO {
    return new SubscriptionDTO(subscription);
  }
}

