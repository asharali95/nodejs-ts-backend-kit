export type UserType = 'individual' | 'architect' | 'real_estate_company' | 'other';
export type MainGoal = 'personal_project' | 'business_use' | 'client_work' | 'education_learning';
export type ProjectCount = '1-5' | '6-15' | '16-30' | '30+';

export interface IOnboarding {
  id: string;
  userId: string;
  accountId: string;
  userType: UserType;
  mainGoal: MainGoal;
  monthlyProjects: ProjectCount;
  companyName?: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Onboarding implements IOnboarding {
  id: string;
  userId: string;
  accountId: string;
  userType: UserType;
  mainGoal: MainGoal;
  monthlyProjects: ProjectCount;
  companyName?: string;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IOnboarding>) {
    this.id = data.id || '';
    this.userId = data.userId || '';
    this.accountId = data.accountId || '';
    this.userType = data.userType || 'individual';
    this.mainGoal = data.mainGoal || 'personal_project';
    this.monthlyProjects = data.monthlyProjects || '1-5';
    this.companyName = data.companyName;
    this.completedAt = data.completedAt || new Date();
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

