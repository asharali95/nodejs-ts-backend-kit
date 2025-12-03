import { User, Account, AuthMethod } from '../models';
import { PlanType } from '../models/subscription.model';
import { AccountService } from './account.service';
import { SubscriptionService } from './subscription.service';
import { UserRepository } from '../repositories';
import { AccountRepository } from '../repositories';
import { UnauthorizedError, NotFoundError } from '../errors';
import { ActivityLogger } from '../utils';
import { generateToken } from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils';
import crypto from 'crypto';
import { EmailProviderFactory } from '../providers/EmailProviderFactory';
import { SmsProviderFactory } from '../providers/SmsProviderFactory';
import { config } from '../config';
import { MfaProviderFactory } from '../providers/MfaProviderFactory';
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

    // Hash password before storing
    const hashedPassword = await hashPassword(password);

    // Create user with accountId and role 'owner'
    const user = await this.userRepository.create({
      accountId: account.id,
      email,
      password: hashedPassword,
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
   * Login user with multiple authentication strategies.
   * Currently supports:
   *  - method: 'password' (email + password)
   * Hooks for future implementations:
   *  - method: 'oauth2' | 'saml' | 'sso'
   */
  async login(
    email: string | undefined,
    password: string | undefined,
    options?: {
      method?: AuthMethod;
      provider?: string;
      oauthCode?: string;
      samlResponse?: string;
      ssoToken?: string;
      mfaCode?: string;
    }
  ): Promise<{ user: User; account: Account; token: string }> {
    const method: AuthMethod = options?.method || 'password';

    switch (method) {
      case 'password':
        return this.loginWithPassword(email, password, options?.mfaCode);
      case 'oauth2':
        return this.loginWithOAuth2(options?.provider, options?.oauthCode);
      case 'saml':
        return this.loginWithSaml(options?.provider, options?.samlResponse);
      case 'sso':
        return this.loginWithSso(options?.provider, options?.ssoToken);
      default:
        throw new UnauthorizedError('Unsupported authentication method');
    }
  }

  /**
   * Email + password authentication with optional MFA hook.
   */
  private async loginWithPassword(
    email: string | undefined,
    password: string | undefined,
    mfaCode?: string
  ): Promise<{ user: User; account: Account; token: string }> {
    if (!email || !password) {
      throw new UnauthorizedError('Email and password are required');
    }

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // MFA verification (TOTP-based by default)
    if (user.mfaEnabled) {
      if (!user.mfaSecret) {
        throw new UnauthorizedError('MFA is misconfigured for this account');
      }
      if (!mfaCode) {
        throw new UnauthorizedError('MFA code required');
      }

      const mfaProvider = MfaProviderFactory.getProvider();
      const isMfaValid = await mfaProvider.verifyCode(user.mfaSecret, mfaCode);
      if (!isMfaValid) {
        throw new UnauthorizedError('Invalid MFA code');
      }
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
   * OAuth2 login placeholder.
   * Integrate with providers (e.g., Google, GitHub) here.
   */
  private async loginWithOAuth2(
    _provider: string | undefined,
    _oauthCode: string | undefined
  ): Promise<{ user: User; account: Account; token: string }> {
    throw new UnauthorizedError('OAuth2 login is not implemented yet');
  }

  /**
   * SAML login placeholder.
   */
  private async loginWithSaml(
    _provider: string | undefined,
    _samlResponse: string | undefined
  ): Promise<{ user: User; account: Account; token: string }> {
    throw new UnauthorizedError('SAML login is not implemented yet');
  }

  /**
   * SSO login placeholder (e.g., OpenID Connect, corporate SSO).
   */
  private async loginWithSso(
    _provider: string | undefined,
    _ssoToken: string | undefined
  ): Promise<{ user: User; account: Account; token: string }> {
    throw new UnauthorizedError('SSO login is not implemented yet');
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

  /**
   * Request password reset: generate a time-limited reset token.
   * In a real app, you would email this token to the user.
   */
  async requestPasswordReset(email: string): Promise<{ resetToken: string }> {
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      // Do not leak whether the email exists
      return { resetToken: '' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: tokenHash,
      passwordResetExpires: expires,
    });

    // Send email (and optionally SMS) with reset link/code
    const emailProvider = EmailProviderFactory.getProvider();
    const resetUrl = `https://app.example.com/reset-password?token=${rawToken}`;

    await emailProvider.sendEmail({
      to: user.email,
      subject: `${config.APP_NAME} - Password Reset`,
      text: `You requested a password reset. Use this token or open the link: ${rawToken}\n\n${resetUrl}`,
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password or use this token: <code>${rawToken}</code></p>`,
    });

    // Optional SMS hook if you later add phone numbers and a real SMS provider
    if (user.phone) {
      const smsProvider = SmsProviderFactory.getProvider();
      await smsProvider.sendSms({
        to: user.phone,
        body: `Reset your ${config.APP_NAME} password. Token: ${rawToken}`,
      });
    }

    return { resetToken: rawToken };
  }

  /**
   * Reset password using a previously issued reset token.
   * Returns a fresh auth token so the user is logged in immediately.
   */
  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ user: User; account: Account; token: string }> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userRepository.findByPasswordResetToken(tokenHash);
    if (!user) {
      throw new UnauthorizedError('Invalid or expired password reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
      updatedAt: new Date(),
    });

    const account = await this.accountRepository.findById(updatedUser.accountId);
    if (!account) {
      throw new NotFoundError('Account not found');
    }

    const jwt = generateToken({
      userId: updatedUser.id,
      accountId: account.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    return { user: updatedUser, account, token: jwt };
  }
}

