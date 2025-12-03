import { IUser, User } from '../models';
import { BaseService } from './BaseService';
import { UserRepository } from '../repositories';
import { ActivityLogger } from '../utils';
import { redisCache } from '../cache';

/**
 * User Service
 * Business logic for user operations
 */
export class UserService extends BaseService<User, string> {
  private activityLogger?: ActivityLogger;

  constructor(
    private readonly userRepository: UserRepository,
    activityLogger?: ActivityLogger
  ) {
    super();
    this.activityLogger = activityLogger;
  }

  /**
   * Get user by ID (with caching)
   */
  async getById(id: string): Promise<User> {
    const cacheKey = `user:${id}`;

    return redisCache.getOrSet(
      cacheKey,
      async () => {
        const user = await this.userRepository.findById(id);
        this.throwIfNotFound(user, id, 'User');
        return user;
      },
      1800 // 30 minutes cache
    );
  }

  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /**
   * Get users by account ID
   */
  async getByAccountId(accountId: string): Promise<User[]> {
    return this.userRepository.findByAccountId(accountId);
  }

  /**
   * Create user
   */
  async create(data: Partial<IUser>): Promise<User> {
    return this.userRepository.create(data);
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<IUser>): Promise<User> {
    // Don't allow updating email through profile update (use separate endpoint)
    const { ...profileUpdates } = updates;
    
    const user = await this.userRepository.findById(userId);
    this.throwIfNotFound(user, userId, 'User');

    const updated = await this.userRepository.update(userId, {
      ...profileUpdates,
      updatedAt: new Date(),
    });

    // Log activity - track what changed
    if (this.activityLogger) {
      const changes: string[] = [];
      if (updates.firstName && updates.firstName !== user.firstName) changes.push('first name');
      if (updates.lastName && updates.lastName !== user.lastName) changes.push('last name');
      if (updates.company && updates.company !== user.company) changes.push('company');
      if (updates.phone && updates.phone !== user.phone) changes.push('phone');
      if (updates.profilePicture && updates.profilePicture !== user.profilePicture) changes.push('profile picture');

      if (changes.length > 0) {
        await this.activityLogger.logProfileUpdated(
          userId,
          user.accountId,
          changes
        );
      }
    }

    // Invalidate cache
    await redisCache.delete(`user:${userId}`);

    return updated;
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<IUser>): Promise<User> {
    return this.userRepository.update(id, updates);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}

