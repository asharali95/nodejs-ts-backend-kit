import { Job, Worker } from 'bullmq';
import { trialExpirationQueue, redisConnection } from '../queue.config';
import { SubscriptionService } from '../../services';
import { container } from '../../di';
import { AccountService } from '../../services';
import { ActivityLogger } from '../../utils';
import { PlanType } from '../../models';

interface TrialExpirationJobData {
  accountId: string;
  subscriptionId: string;
  trialEndDate: Date;
}

/**
 * Process trial expiration job
 * Downgrades account from pro to free plan when trial expires
 */
const processTrialExpiration = async (job: Job<TrialExpirationJobData>) => {
  const { accountId, subscriptionId, trialEndDate } = job.data;

  console.log(`Processing trial expiration for account ${accountId}, subscription ${subscriptionId}`);

  try {
    // Get services from DI container
    const subscriptionService = container.resolve<SubscriptionService>('SubscriptionService');
    const accountService = container.resolve<AccountService>('AccountService');
    const activityLogger = container.resolve<ActivityLogger>('ActivityLogger');

    // Check if trial has actually expired (in case job runs early)
    const now = new Date();
    const trialEnd = new Date(trialEndDate);

    if (now < trialEnd) {
      console.log(`Trial for account ${accountId} has not expired yet. Rescheduling...`);
      // Reschedule job for when trial actually expires
      const delay = trialEnd.getTime() - now.getTime();
      await trialExpirationQueue.add(
        'expire-trial',
        { accountId, subscriptionId, trialEndDate },
        { delay }
      );
      return { message: 'Trial not expired yet, rescheduled', accountId };
    }

    // Get current subscription
    const subscription = await subscriptionService.getByAccountId(accountId);

    if (!subscription) {
      throw new Error(`Subscription not found for account ${accountId}`);
    }

    // Check if subscription is still on trial
    if (subscription.status !== 'trialing' && subscription.status !== 'active') {
      console.log(`Subscription ${subscriptionId} is not in trialing/active state. Status: ${subscription.status}`);
      return { message: 'Subscription already processed', accountId, status: subscription.status };
    }

    // Check if trial has expired
    if (subscription.currentPeriodEnd > new Date()) {
      console.log(`Trial for account ${accountId} has not expired yet. Current period ends: ${subscription.currentPeriodEnd}`);
      return { message: 'Trial not expired yet', accountId };
    }

    // Downgrade to free plan
    console.log(`Downgrading account ${accountId} from ${subscription.planType} to free plan`);
    await subscriptionService.updatePlan(subscriptionId, 'free' as PlanType);

    // Update account trial status
    await accountService.endTrial(accountId);

    // Log activity
    if (activityLogger) {
      await activityLogger.logTrialExpired(accountId, accountId, subscription.planType);
    }

    console.log(`Successfully downgraded account ${accountId} to free plan`);

    return {
      success: true,
      message: 'Trial expired and account downgraded to free',
      accountId,
      subscriptionId,
    };
  } catch (error) {
    console.error(`Error processing trial expiration for account ${accountId}:`, error);
    throw error;
  }
};

/**
 * Create worker for trial expiration queue
 */
export const trialExpirationWorker = new Worker<TrialExpirationJobData>(
  'trial-expiration',
  processTrialExpiration,
  {
    connection: redisConnection,
    concurrency: 5, // Process up to 5 jobs concurrently
  }
);

// Worker event handlers
trialExpirationWorker.on('completed', (job: Job<TrialExpirationJobData>) => {
  console.log(`✅ Trial expiration job ${job.id} completed for account ${job.data.accountId}`);
});

trialExpirationWorker.on('failed', (job, error) => {
  if (job) {
    console.error(`❌ Trial expiration job ${job.id} failed for account ${job.data.accountId}:`, error);
  } else {
    console.error('❌ Trial expiration job failed (job not found):', error);
  }
});

trialExpirationWorker.on('error', (err: Error) => {
  console.error('❌ Trial expiration worker error:', err);
});

