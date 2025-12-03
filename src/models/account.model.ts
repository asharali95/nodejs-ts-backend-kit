export interface IAccount {
  id: string;
  name: string;
  subdomain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  isTrial: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Account implements IAccount {
  id: string;
  name: string;
  subdomain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  isTrial: boolean;
  trialStartDate?: Date;
  trialEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IAccount>) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.subdomain = data.subdomain;
    this.plan = data.plan || 'free';
    this.status = data.status || 'active';
    this.isTrial = data.isTrial ?? false;
    this.trialStartDate = data.trialStartDate;
    this.trialEndDate = data.trialEndDate;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Check if trial is active
   */
  isTrialActive(): boolean {
    if (!this.isTrial || !this.trialEndDate) {
      return false;
    }
    return new Date() < this.trialEndDate;
  }

  /**
   * Check if trial has expired
   */
  isTrialExpired(): boolean {
    if (!this.isTrial || !this.trialEndDate) {
      return false;
    }
    return new Date() >= this.trialEndDate;
  }

  /**
   * Get days remaining in trial
   */
  getTrialDaysRemaining(): number {
    if (!this.isTrial || !this.trialEndDate) {
      return 0;
    }
    const now = new Date();
    const end = this.trialEndDate;
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }
}

