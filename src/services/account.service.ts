import { IAccount, Account } from '../models';
import { BaseService } from './BaseService';
import { AccountRepository } from '../repositories';
import { redisCache } from '../cache';
import { config } from '../config';

/**
 * Account Service
 * Business logic for account operations
 */
export class AccountService extends BaseService<Account, string> {
  constructor(private readonly accountRepository: AccountRepository) {
    super();
  }

  /**
   * Create a new account with 14-day trial (MVP setup for lead extraction)
   */
  async createAccount(
    name: string,
    subdomain?: string,
    plan: 'free' | 'pro' | 'enterprise' = 'free',
    startTrial: boolean = true
  ): Promise<Account> {
    const now = new Date();
    const trialEndDate = startTrial
      ? new Date(now.getTime() + config.TRIAL_DAYS * 24 * 60 * 60 * 1000)
      : undefined;

    return this.accountRepository.create({
      name,
      subdomain,
      plan,
      status: 'active',
      isTrial: startTrial,
      trialStartDate: startTrial ? now : undefined,
      trialEndDate,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Get account by ID (with caching)
   */
  async getById(accountId: string): Promise<Account> {
    const cacheKey = `account:${accountId}`;

    return redisCache.getOrSet(
      cacheKey,
      async () => {
        const account = await this.accountRepository.findById(accountId);
        this.throwIfNotFound(account, accountId, 'Account');
        return account;
      },
      1800 // 30 minutes cache
    );
  }

  /**
   * Alias for getById (for backward compatibility)
   */
  async getAccountById(accountId: string): Promise<Account> {
    return this.getById(accountId);
  }

  /**
   * Get all accounts
   */
  async getAll(): Promise<Account[]> {
    return this.accountRepository.findAll();
  }

  /**
   * Get account by subdomain
   */
  async getAccountBySubdomain(subdomain: string): Promise<Account> {
    const account = await this.accountRepository.findBySubdomain(subdomain);
    this.throwIfNotFound(account, subdomain, 'Account');
    return account;
  }

  /**
   * Create account
   */
  async create(data: Partial<IAccount>): Promise<Account> {
    return this.accountRepository.create(data);
  }

  /**
   * Update account
   */
  async update(accountId: string, updates: Partial<IAccount>): Promise<Account> {
    const account = await this.accountRepository.update(accountId, updates);

    // Invalidate cache
    await redisCache.delete(`account:${accountId}`);

    return account;
  }

  /**
   * Alias for update (for backward compatibility)
   */
  async updateAccount(accountId: string, updates: Partial<IAccount>): Promise<Account> {
    return this.update(accountId, updates);
  }

  /**
   * Delete account
   */
  async delete(accountId: string): Promise<void> {
    await this.accountRepository.delete(accountId);

    // Invalidate cache
    await redisCache.delete(`account:${accountId}`);
  }

  /**
   * Alias for delete (for backward compatibility)
   */
  async deleteAccount(accountId: string): Promise<void> {
    return this.delete(accountId);
  }

  /**
   * Get trial status for an account
   * @param accountId - Account ID
   * @returns Promise with trial status information
   */
  async getTrialStatus(accountId: string): Promise<{
    isTrial: boolean;
    isActive: boolean;
    isExpired: boolean;
    daysRemaining: number;
    trialStartDate?: Date;
    trialEndDate?: Date;
  }> {
    const account = await this.getAccountById(accountId);
    return {
      isTrial: account.isTrial,
      isActive: account.isTrialActive(),
      isExpired: account.isTrialExpired(),
      daysRemaining: account.getTrialDaysRemaining(),
      trialStartDate: account.trialStartDate,
      trialEndDate: account.trialEndDate,
    };
  }

  /**
   * Convert trial to paid (end trial)
   * @param accountId - Account ID
   * @returns Promise<Account>
   */
  async endTrial(accountId: string): Promise<Account> {
    return this.updateAccount(accountId, {
      isTrial: false,
      updatedAt: new Date(),
    });
  }
}

