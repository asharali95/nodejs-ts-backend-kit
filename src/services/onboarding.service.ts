import { Onboarding, IOnboarding } from '../models';
import { BaseService } from './BaseService';
import { OnboardingRepository } from '../repositories';
import { UserRepository } from '../repositories';
import { ConflictError, NotFoundError } from '../errors';
import { redisCache } from '../cache';

/**
 * Onboarding Service
 * Business logic for onboarding operations
 */
export class OnboardingService extends BaseService<Onboarding, string> {
  constructor(
    private readonly onboardingRepository: OnboardingRepository,
    private readonly userRepository: UserRepository
  ) {
    super();
  }

  /**
   * Submit onboarding survey
   */
  async submitOnboarding(
    userId: string,
    accountId: string,
    data: Partial<IOnboarding>
  ): Promise<Onboarding> {
    // Check if user already completed onboarding
    const existing = await this.onboardingRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError('Onboarding has already been completed');
    }

    // Verify user exists
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create onboarding
    const onboarding = await this.onboardingRepository.create({
      ...data,
      userId,
      accountId,
      completedAt: new Date(),
    });

    // Update user onboarding status
    await this.userRepository.update(userId, {
      onboardingCompleted: true,
      updatedAt: new Date(),
    });

    // Invalidate user cache
    await redisCache.delete(`user:${userId}`);
    await redisCache.delete(`onboarding:${userId}`);

    return onboarding;
  }

  /**
   * Get onboarding by ID
   */
  async getById(id: string): Promise<Onboarding> {
    const onboarding = await this.onboardingRepository.findById(id);
    this.throwIfNotFound(onboarding, id, 'Onboarding');
    return onboarding;
  }

  /**
   * Get onboarding by user ID (with caching)
   */
  async getByUserId(userId: string): Promise<Onboarding | null> {
    const cacheKey = `onboarding:${userId}`;

    return redisCache.getOrSet(
      cacheKey,
      async () => {
        return this.onboardingRepository.findByUserId(userId);
      },
      1800 // 30 minutes cache
    );
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const cacheKey = `onboarding:status:${userId}`;

    const cached = await redisCache.get<boolean>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    const hasCompleted = await this.onboardingRepository.hasCompletedOnboarding(userId);

    // Cache the result
    await redisCache.set(cacheKey, hasCompleted, 1800);

    return hasCompleted;
  }

  /**
   * Get all onboarding records
   */
  async getAll(): Promise<Onboarding[]> {
    return this.onboardingRepository.findAll();
  }

  /**
   * Create onboarding
   */
  async create(data: Partial<IOnboarding>): Promise<Onboarding> {
    return this.onboardingRepository.create(data);
  }

  /**
   * Update onboarding
   */
  async update(id: string, updates: Partial<IOnboarding>): Promise<Onboarding> {
    const onboarding = await this.onboardingRepository.update(id, updates);

    // Invalidate cache
    await redisCache.delete(`onboarding:${onboarding.userId}`);
    await redisCache.delete(`onboarding:status:${onboarding.userId}`);

    return onboarding;
  }

  /**
   * Delete onboarding
   */
  async delete(id: string): Promise<void> {
    const onboarding = await this.onboardingRepository.findById(id);
    this.throwIfNotFound(onboarding, id, 'Onboarding');

    await this.onboardingRepository.delete(id);

    // Update user onboarding status
    await this.userRepository.update(onboarding.userId, {
      onboardingCompleted: false,
      updatedAt: new Date(),
    });

    // Invalidate cache
    await redisCache.delete(`onboarding:${onboarding.userId}`);
    await redisCache.delete(`onboarding:status:${onboarding.userId}`);
    await redisCache.delete(`user:${onboarding.userId}`);
  }
}

