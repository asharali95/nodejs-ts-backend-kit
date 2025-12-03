import { container } from './Container';
import { AccountRepository } from '../repositories';
import { UserRepository } from '../repositories';
import { ActivityRepository } from '../repositories';
import { OnboardingRepository } from '../repositories';
import { SubscriptionRepository } from '../repositories';
import { BillingRepository } from '../repositories';
import { AccountService, BillingService } from '../services';
import { AuthService } from '../services';
import { DashboardService } from '../services';
import { UserService } from '../services';
import { ActivityService } from '../services';
import { OnboardingService } from '../services';
import { SubscriptionService } from '../services';
import { AccountController, BillingController, SubscriptionController } from '../controllers';
import { AuthController } from '../controllers';
import { DashboardController } from '../controllers';
import { ProfileController } from '../controllers';
import { ActivityController } from '../controllers';
import { OnboardingController } from '../controllers';
import { ActivityLogger } from '../utils';

/**
 * Setup Dependency Injection Container
 * Registers all services and controllers with their dependencies
 */
export function setupDI(): void {
  // Register Repositories (singletons)
  container.register('AccountRepository', () => new AccountRepository(), true);
  container.register('UserRepository', () => new UserRepository(), true);
  container.register('ActivityRepository', () => new ActivityRepository(), true);
  container.register('OnboardingRepository', () => new OnboardingRepository(), true);
  container.register('SubscriptionRepository', () => new SubscriptionRepository(), true);
  container.register('BillingRepository', () => new BillingRepository(), true);

  // Register Services (singletons with dependencies)
  container.register(
    'AccountService',
    () => {
      const accountRepository = container.resolve<AccountRepository>('AccountRepository');
      return new AccountService(accountRepository);
    },
    true
  );

  container.register(
    'AuthService',
    () => {
      const userRepository = container.resolve<UserRepository>('UserRepository');
      const accountRepository = container.resolve<AccountRepository>('AccountRepository');
      const accountService = container.resolve<AccountService>('AccountService');
      const subscriptionService = container.resolve<SubscriptionService>('SubscriptionService');
      const activityLogger = container.resolve<ActivityLogger>('ActivityLogger');
      return new AuthService(userRepository, accountRepository, accountService, subscriptionService, activityLogger);
    },
    true
  );

  // Register Controllers (new instance per request, but we'll use factories)
  container.register(
    'AccountController',
    () => {
      const accountService = container.resolve<AccountService>('AccountService');
      return new AccountController(accountService);
    },
    false
  );

  container.register(
    'AuthController',
    () => {
      const authService = container.resolve<AuthService>('AuthService');
      return new AuthController(authService);
    },
    false
  );

  container.register(
    'ActivityService',
    () => {
      const activityRepository = container.resolve<ActivityRepository>('ActivityRepository');
      return new ActivityService(activityRepository);
    },
    true
  );

  container.register(
    'ActivityLogger',
    () => {
      const activityService = container.resolve<ActivityService>('ActivityService');
      return new ActivityLogger(activityService);
    },
    true
  );

  container.register(
    'UserService',
    () => {
      const userRepository = container.resolve<UserRepository>('UserRepository');
      const activityLogger = container.resolve<ActivityLogger>('ActivityLogger');
      return new UserService(userRepository, activityLogger);
    },
    true
  );

  container.register(
    'DashboardService',
    () => {
      const userRepository = container.resolve<UserRepository>('UserRepository');
      const accountRepository = container.resolve<AccountRepository>('AccountRepository');
      return new DashboardService(userRepository, accountRepository);
    },
    true
  );

  container.register(
    'DashboardController',
    () => {
      const dashboardService = container.resolve<DashboardService>('DashboardService');
      return new DashboardController(dashboardService);
    },
    false
  );

  container.register(
    'ProfileController',
    () => {
      const userService = container.resolve<UserService>('UserService');
      return new ProfileController(userService);
    },
    false
  );

  container.register(
    'ActivityController',
    () => {
      const activityService = container.resolve<ActivityService>('ActivityService');
      return new ActivityController(activityService);
    },
    false
  );

  container.register(
    'OnboardingService',
    () => {
      const onboardingRepository = container.resolve<OnboardingRepository>('OnboardingRepository');
      const userRepository = container.resolve<UserRepository>('UserRepository');
      return new OnboardingService(onboardingRepository, userRepository);
    },
    true
  );

  container.register(
    'OnboardingController',
    () => {
      const onboardingService = container.resolve<OnboardingService>('OnboardingService');
      return new OnboardingController(onboardingService);
    },
    false
  );

  container.register(
    "SubscriptionService",
    () => {
      const subscriptionRepository = container.resolve<SubscriptionRepository>('SubscriptionRepository');
      return new SubscriptionService(subscriptionRepository);
    },
    true
  )

  container.register(
    "SubscriptionController",
    () => {
      const subscriptionService = container.resolve<SubscriptionService>('SubscriptionService');
      return new SubscriptionController(subscriptionService);
    },
    false
  )

  container.register(
    "BillingService",
    () => {
      const billingRepository = container.resolve<BillingRepository>('BillingRepository');
      const subscriptionRepository = container.resolve<SubscriptionRepository>('SubscriptionRepository');
      return new BillingService(billingRepository, subscriptionRepository);
    },
    true
  )

  container.register(
    "BillingController",
    () => {
      const billingService = container.resolve<BillingService>('BillingService');
      return new BillingController(billingService);
    },
    false
  )
}

