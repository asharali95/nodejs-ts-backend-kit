import { Queue, QueueOptions } from 'bullmq';
import { config } from '../config';

/**
 * Redis connection configuration for BullMQ
 */
export const redisConnection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  ...(config.REDIS_URL && { url: config.REDIS_URL }),
};

/**
 * Default queue options
 */
export const defaultQueueOptions: QueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
    },
  },
};

/**
 * Trial Expiration Queue
 * Handles jobs for expiring trials and downgrading to free plan
 */
export const trialExpirationQueue = new Queue('trial-expiration', defaultQueueOptions);

