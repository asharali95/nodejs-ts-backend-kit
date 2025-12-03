import { Account } from '../models';

/**
 * Account Data Transfer Object
 * Used for API responses to control what data is exposed
 */
export class AccountDTO {
  id: string;
  name: string;
  subdomain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  isTrial: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  trialDaysRemaining: number;
  isTrialActive: boolean;
  isTrialExpired: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(account: Account) {
    this.id = account.id;
    this.name = account.name;
    this.subdomain = account.subdomain;
    this.plan = account.plan;
    this.status = account.status;
    this.isTrial = account.isTrial;
    this.trialStartDate = account.trialStartDate;
    this.trialEndDate = account.trialEndDate;
    this.trialDaysRemaining = account.getTrialDaysRemaining();
    this.isTrialActive = account.isTrialActive();
    this.isTrialExpired = account.isTrialExpired();
    this.createdAt = account.createdAt;
    this.updatedAt = account.updatedAt;
  }

  /**
   * Create DTO from account model
   */
  static from(account: Account): AccountDTO {
    return new AccountDTO(account);
  }

  /**
   * Create DTOs from array of accounts
   */
  static fromArray(accounts: Account[]): AccountDTO[] {
    return accounts.map((account) => AccountDTO.from(account));
  }

  /**
   * Create minimal DTO (for lists)
   */
  static minimal(account: Account): Partial<AccountDTO> {
    return {
      id: account.id,
      name: account.name,
      subdomain: account.subdomain,
      plan: account.plan,
      status: account.status,
      isTrial: account.isTrial,
      trialDaysRemaining: account.getTrialDaysRemaining(),
      isTrialActive: account.isTrialActive(),
    };
  }
}

