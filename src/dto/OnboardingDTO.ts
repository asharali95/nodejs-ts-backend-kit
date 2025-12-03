import { Onboarding } from '../models';

/**
 * Onboarding Data Transfer Object
 * Used for API responses to control what data is exposed
 */
export class OnboardingDTO {
  id: string;
  userId: string;
  accountId: string;
  userType: string;
  mainGoal: string;
  monthlyProjects: string;
  companyName?: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(onboarding: Onboarding) {
    this.id = onboarding.id;
    this.userId = onboarding.userId;
    this.accountId = onboarding.accountId;
    this.userType = onboarding.userType;
    this.mainGoal = onboarding.mainGoal;
    this.monthlyProjects = onboarding.monthlyProjects;
    this.companyName = onboarding.companyName;
    this.completedAt = onboarding.completedAt;
    this.createdAt = onboarding.createdAt;
    this.updatedAt = onboarding.updatedAt;
  }

  /**
   * Create DTO from onboarding model
   */
  static from(onboarding: Onboarding): OnboardingDTO {
    return new OnboardingDTO(onboarding);
  }
}

