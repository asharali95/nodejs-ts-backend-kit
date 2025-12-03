import { Subscription, ISubscription } from '../models';
import { PlanType } from '../models/subscription.model';
import { BaseService } from './BaseService';
import { SubscriptionRepository } from '../repositories';
import { ConflictError } from '../errors';
import { PaymentProviderFactory } from '../payment-providers';
import { redisCache } from '../cache';

/**
 * Subscription Service
 * Business logic for subscription operations
 */
export class SubscriptionService extends BaseService<Subscription, string> {
  constructor(public readonly subscriptionRepository: SubscriptionRepository) {
    super();
  }

  /**
   * Create subscription for an account
   */
  async createSubscription(
    accountId: string,
    planType: PlanType,
    paymentProvider: string = 'stripe',
    skipProvider: boolean = false // For trial subscriptions, skip payment provider
  ): Promise<Subscription> {
    // Check if account already has a subscription
    const existing = await this.subscriptionRepository.findByAccountId(accountId);
    if (existing) {
      throw new ConflictError('Account already has a subscription');
    }

    let providerResult: {
      subscriptionId: string;
      customerId: string;
      status: string;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
    } | null = null;

    // Only create with payment provider if not skipping (for trials, we create locally)
    if (!skipProvider) {
      try {
        // Get payment provider
        const provider = PaymentProviderFactory.getProvider(paymentProvider);

        // Create subscription with payment provider
        providerResult = await provider.createSubscription(accountId, planType);
      } catch (error) {
        console.warn('Payment provider subscription creation failed, creating local subscription:', error);
        // Continue with local subscription creation
      }
    }

    // Create subscription in database
    const now = new Date();
    const subscription = await this.subscriptionRepository.create({
      accountId,
      planType,
      status: providerResult ? (providerResult.status as any) : 'trialing',
      currentPeriodStart: providerResult?.currentPeriodStart || now,
      currentPeriodEnd: providerResult?.currentPeriodEnd || now,
      cancelAtPeriodEnd: false,
      paymentProvider: skipProvider ? 'local' : paymentProvider,
      providerSubscriptionId: providerResult?.subscriptionId,
      features: new Subscription({ planType }).features,
    });

    // Invalidate cache
    await redisCache.delete(`subscription:${accountId}`);

    return subscription;
  }

  /**
   * Get subscription by account ID (with caching)
   */
  async getByAccountId(accountId: string): Promise<Subscription | null> {
    const cacheKey = `subscription:${accountId}`;

    return redisCache.getOrSet(
      cacheKey,
      async () => {
        return this.subscriptionRepository.findByAccountId(accountId);
      },
      1800 // 30 minutes cache
    );
  }

  /**
   * Get subscription by ID
   */
  async getById(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findById(id);
    this.throwIfNotFound(subscription, id, 'Subscription');
    return subscription;
  }

  /**
   * Get all subscriptions
   */
  async getAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll();
  }

  /**
   * Create subscription (generic method)
   */
  async create(data: Partial<ISubscription>): Promise<Subscription> {
    return this.subscriptionRepository.create(data);
  }

  /**
   * Update subscription (generic method)
   */
  async update(id: string, updates: Partial<ISubscription>): Promise<Subscription> {
    // Validate subscription exists
    await this.getById(id);
    const updated = await this.subscriptionRepository.update(id, updates);
    
    // Invalidate cache
    await redisCache.delete(`subscription:${updated.accountId}`);
    
    return updated;
  }

  /**
   * Delete subscription
   */
  async delete(id: string): Promise<void> {
    const subscription = await this.getById(id);
    await this.subscriptionRepository.delete(id);
    
    // Invalidate cache
    await redisCache.delete(`subscription:${subscription.accountId}`);
  }

  /**
   * Update subscription plan
   */
  async updatePlan(
    subscriptionId: string,
    newPlanType: PlanType
  ): Promise<Subscription> {
    const subscription = await this.getById(subscriptionId);

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(subscription.paymentProvider);

    // Update subscription with payment provider
    if (subscription.providerSubscriptionId) {
      const providerResult = await provider.updateSubscription(
        subscription.providerSubscriptionId,
        newPlanType
      );

      // Update subscription in database
      const updated = await this.subscriptionRepository.update(subscriptionId, {
        planType: newPlanType,
        status: providerResult.status as any,
        currentPeriodStart: providerResult.currentPeriodStart,
        currentPeriodEnd: providerResult.currentPeriodEnd,
        features: new Subscription({ planType: newPlanType }).features,
      });

      // Invalidate cache
      await redisCache.delete(`subscription:${updated.accountId}`);

      return updated;
    }

    // If no provider subscription ID, just update locally
    const updated = await this.subscriptionRepository.update(subscriptionId, {
      planType: newPlanType,
      features: new Subscription({ planType: newPlanType }).features,
    });

    await redisCache.delete(`subscription:${updated.accountId}`);

    return updated;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    const subscription = await this.getById(subscriptionId);

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(subscription.paymentProvider);

    // Cancel subscription with payment provider
    if (subscription.providerSubscriptionId) {
      const providerResult = await provider.cancelSubscription(
        subscription.providerSubscriptionId,
        cancelAtPeriodEnd
      );

      // Update subscription in database
      const updated = await this.subscriptionRepository.update(subscriptionId, {
        status: providerResult.status as any,
        cancelAtPeriodEnd: providerResult.cancelAtPeriodEnd,
        cancelledAt: providerResult.cancelledAt,
      });

      await redisCache.delete(`subscription:${updated.accountId}`);

      return updated;
    }

    // If no provider subscription ID, just update locally
    const updated = await this.subscriptionRepository.update(subscriptionId, {
      status: 'cancelled',
      cancelAtPeriodEnd,
      cancelledAt: new Date(),
    });

    await redisCache.delete(`subscription:${updated.accountId}`);

    return updated;
  }

  /**
   * Resume cancelled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await this.getById(subscriptionId);

    if (!subscription.cancelAtPeriodEnd) {
      throw new ConflictError('Subscription is not cancelled');
    }

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(subscription.paymentProvider);

    // Resume subscription with payment provider
    if (subscription.providerSubscriptionId) {
      const providerResult = await provider.resumeSubscription(
        subscription.providerSubscriptionId
      );

      // Update subscription in database
      const updated = await this.subscriptionRepository.update(subscriptionId, {
        status: providerResult.status as any,
        cancelAtPeriodEnd: providerResult.cancelAtPeriodEnd,
        cancelledAt: undefined,
      });

      await redisCache.delete(`subscription:${updated.accountId}`);

      return updated;
    }

    // If no provider subscription ID, just update locally
    const updated = await this.subscriptionRepository.update(subscriptionId, {
      status: 'active',
      cancelAtPeriodEnd: false,
      cancelledAt: undefined,
    });

    await redisCache.delete(`subscription:${updated.accountId}`);

    return updated;
  }

  /**
   * Get current plan features
   */
  async getCurrentPlanFeatures(accountId: string): Promise<{
    planType: PlanType;
    features: any;
    status: string;
  } | null> {
    const subscription = await this.getByAccountId(accountId);
    if (!subscription) {
      return null;
    }

    return {
      planType: subscription.planType,
      features: subscription.features,
      status: subscription.status,
    };
  }
}

