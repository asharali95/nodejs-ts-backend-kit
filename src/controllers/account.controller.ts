import { Request, Response } from 'express';
import { AccountService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { AccountDTO } from '../dto';

/**
 * Account Controller
 * Handles HTTP requests for account operations
 */
export class AccountController extends BaseController {
  constructor(private readonly accountService: AccountService) {
    super();
  }
  /**
   * Create a new account
   */
  create = catchAsync(async (req: Request, res: Response) => {
    const { name, subdomain, plan } = req.body;

    // MVP: All new accounts get 14-day trial by default
    const account = await this.accountService.createAccount(name, subdomain, plan, true);
    const accountDTO = AccountDTO.from(account);

    return this.success(res, { account: accountDTO }, 201);
  });

  /**
   * Get account by ID
   */
  getById = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;

    const account = await this.accountService.getAccountById(accountId);
    const accountDTO = AccountDTO.from(account);

    return this.success(res, { account: accountDTO });
  });

  /**
   * Get trial status for an account
   */
  getTrialStatus = catchAsync(async (req: Request, res: Response) => {
    const { accountId } = req.params;

    const trialStatus = await this.accountService.getTrialStatus(accountId);

    return this.success(res, { trial: trialStatus });
  });

  /**
   * Update account
   */
  update = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;
    const updates = req.body;

    const account = await this.accountService.updateAccount(accountId, updates);
    const accountDTO = AccountDTO.from(account);

    return this.success(res, { account: accountDTO });
  });

  /**
   * Delete account
   */
  delete = catchAsync(async (req: Request, res: Response) => {
    // Use accountId from token if available, otherwise from params
    const accountId = req.user?.accountId || req.params.accountId;

    await this.accountService.deleteAccount(accountId);

    return this.success(res, { message: 'Account deleted successfully' });
  });
}

