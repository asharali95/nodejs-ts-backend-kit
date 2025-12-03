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
    const {
      email,
      password,
      method,
      provider,
      oauthCode,
      samlResponse,
      ssoToken,
      mfaCode,
    } = req.body;

    const { user, account, token } = await this.authService.login(email, password, {
      method,
      provider,
      oauthCode,
      samlResponse,
      ssoToken,
      mfaCode,
    });

    const userDTO = UserDTO.from(user);
    const accountDTO = AccountDTO.from(account);

    return this.success(res, {
      user: userDTO,
      account: accountDTO,
      token,
    });
  });

  /**
   * Request password reset
   */
  requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const { resetToken } = await this.authService.requestPasswordReset(email);

    // NOTE: In production, you would NOT return the token in the response.
    // You would send it via email instead. This is kept for template/demo purposes.
    return this.success(res, {
      message: 'If that email exists, a reset link has been generated.',
      resetToken,
    });
  });

  /**
   * Reset password using reset token
   */
  resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    const { user, account, token: jwt } = await this.authService.resetPassword(
      token,
      newPassword
    );

    const userDTO = UserDTO.from(user);
    const accountDTO = AccountDTO.from(account);

    return this.success(res, {
      user: userDTO,
      account: accountDTO,
      token: jwt,
    });
  });
}

