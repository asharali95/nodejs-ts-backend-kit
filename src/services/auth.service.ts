import { User, Account } from '../models';
import { PlanType } from '../models/subscription.model';
import { AccountService } from './account.service';
import { SubscriptionService } from './subscription.service';
import { UserRepository } from '../repositories';
import { AccountRepository } from '../repositories';
import { UnauthorizedError, NotFoundError } from '../errors';
import { ActivityLogger } from '../utils';
import { generateToken } from '../utils/jwt';
import { scheduleTrialExpiration } from '../queue';

/**
 * Auth Service
 * Handles authentication and authorization logic
 */
export class AuthService {
  private activityLogger?: ActivityLogger;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository,
    private readonly accountService: AccountService,
    private readonly subscriptionService?: SubscriptionService,
    activityLogger?: ActivityLogger
  ) {
    this.activityLogger = activityLogger;
  }

  /**
   * Register a new user and create their account (multi-tenant)
   */
  async register(
    email: string,
    password: string,
    accountName: string,
    subdomain?: string,
    firstName?: string,
    lastName?: string
  ): Promise<{ user: User; account: Account; token: string }> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Create account with 14-day trial (MVP)
    const account = await this.accountService.createAccount(
      accountName,
      subdomain,
      'free',
      true // Start trial automatically
    );

    // Create user with accountId and role 'owner'
    const user = await this.userRepository.create({
      accountId: account.id,
      email,
      password, // TODO: Hash password in production
      role: 'owner',
      firstName,
      lastName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Create PRO subscription with trial status for 14 days
    let subscription = null;
    if (this.subscriptionService && account.isTrial && account.trialEndDate) {
      try {
        // Create subscription with 'pro' plan and 'trialing' status
        // Skip payment provider for trial subscriptions (create locally)
        subscription = await this.subscriptionService.createSubscription(
          account.id,
          'pro' as PlanType,
          'stripe', // Default to stripe, can be made configurable
          true // Skip payment provider for trial
        );

        // Update subscription to trialing status and set trial period
        if (subscription) {
          const now = new Date();
          await this.subscriptionService.subscriptionRepository.update(subscription.id, {
            status: 'trialing',
            currentPeriodStart: now,
            currentPeriodEnd: account.trialEndDate,
          });

          // Schedule job to downgrade to free plan when trial expires
          await scheduleTrialExpiration(
            account.id,
            subscription.id,
            account.trialEndDate
          );
        }
      } catch (error) {
        console.error('Error creating trial subscription:', error);
        // Continue even if subscription creation fails (graceful degradation)
      }
    }

    // Log activities
    if (this.activityLogger) {
      await this.activityLogger.logAccountCreated(user.id, account.id, account.name);
      await this.activityLogger.logUserRegistered(user.id, account.id, email);
      if (account.isTrial) {
        await this.activityLogger.logTrialStarted(user.id, account.id, account.name);
      }
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      accountId: account.id,
      email: user.email,
      role: user.role,
    });

    return { user, account, token };
  }

  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; account: Account; token: string }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password (TODO: Implement proper password hashing/verification)
    if (user.password !== password) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Get account
    const account = await this.accountRepository.findById(user.accountId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    // Log activity
    if (this.activityLogger) {
      await this.activityLogger.logUserLoggedIn(user.id, account.id, email);
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      accountId: account.id,
      email: user.email,
      role: user.role,
    });

    return { user, account, token };
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError(`User with email ${email} not found`);
    }
    return user;
  }
}

