import { trialExpirationQueue } from '../queue.config';

/**
 * Schedule trial expiration job
 * Creates a delayed job that will execute when the trial expires
 */
export const scheduleTrialExpiration = async (
  accountId: string,
  subscriptionId: string,
  trialEndDate: Date
): Promise<void> => {
  const now = new Date();
  const trialEnd = new Date(trialEndDate);
  const delay = Math.max(0, trialEnd.getTime() - now.getTime()); // Delay in milliseconds

  if (delay <= 0) {
    console.warn(`Trial for account ${accountId} has already expired. Processing immediately.`);
  }

  await trialExpirationQueue.add(
    'expire-trial',
    {
      accountId,
      subscriptionId,
      trialEndDate,
    },
    {
      delay,
      jobId: `trial-expiration-${accountId}`, // Unique job ID per account
      removeOnComplete: true,
      removeOnFail: false,
    }
  );

  console.log(
    `📅 Scheduled trial expiration job for account ${accountId} (subscription ${subscriptionId}) at ${trialEnd.toISOString()}`
  );
};

/**
 * Cancel trial expiration job (if trial is ended early or subscription is cancelled)
 */
export const cancelTrialExpiration = async (accountId: string): Promise<void> => {
  const job = await trialExpirationQueue.getJob(`trial-expiration-${accountId}`);

  if (job) {
    await job.remove();
    console.log(`🗑️  Cancelled trial expiration job for account ${accountId}`);
  }
};

