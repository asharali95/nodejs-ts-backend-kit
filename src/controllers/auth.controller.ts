import { Request, Response } from 'express';
import { AuthService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { UserDTO, AccountDTO } from '../dto';

/**
 * Auth Controller
 * Handles HTTP requests for authentication operations
 */
export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  /**
   * Register a new user and create their account (multi-tenant)
   */
  register = catchAsync(async (req: Request, res: Response) => {
    const { email, password, accountName, subdomain, firstName, lastName } =
      req.body;

    const { user, account, token } = await this.authService.register(
      email,
      password,
      accountName,
      subdomain,
      firstName,
      lastName
    );

    const userDTO = UserDTO.from(user);
    const accountDTO = AccountDTO.from(account);

    return this.success(
      res,
      {
        user: userDTO,
        account: accountDTO,
        token,
      },
      201
    );
  });

  /**
   * Login user
   */
  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, account, token } = await this.authService.login(email, password);

    const userDTO = UserDTO.from(user);
    const accountDTO = AccountDTO.from(account);

    return this.success(res, {
      user: userDTO,
      account: accountDTO,
      token,
    });
  });
}

