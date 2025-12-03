export type AuthMethod = 'password' | 'oauth2' | 'saml' | 'sso';

export interface IUser {
  id: string;
  accountId: string; // Multi-tenant: user belongs to an account
  email: string;
  password: string;
  role: 'owner' | 'admin' | 'member';
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  profilePicture?: string;
  onboardingCompleted: boolean; // Track if onboarding is completed
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User implements IUser {
  id: string;
  accountId: string;
  email: string;
  password: string;
  role: 'owner' | 'admin' | 'member';
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  profilePicture?: string;
  onboardingCompleted: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  mfaEnabled?: boolean;
  mfaSecret?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IUser>) {
    this.id = data.id || '';
    this.accountId = data.accountId || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.role = data.role || 'member';
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.company = data.company;
    this.phone = data.phone;
    this.profilePicture = data.profilePicture;
    this.onboardingCompleted = data.onboardingCompleted ?? false;
    this.passwordResetToken = data.passwordResetToken;
    this.passwordResetExpires = data.passwordResetExpires;
    this.mfaEnabled = data.mfaEnabled ?? false;
    this.mfaSecret = data.mfaSecret;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Get full name
   */
  getFullName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`;
    }
    return this.firstName || this.lastName || this.email;
  }
}

