import { Request, Response } from 'express';
import { UserService } from '../services';
import { catchAsync } from '../utils';
import { BaseController } from './BaseController';
import { UserDTO } from '../dto';

/**
 * Profile Controller
 * Handles HTTP requests for user profile management
 */
export class ProfileController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * Get user profile
   */
  getProfile = catchAsync(async (req: Request, res: Response) => {
    // Use userId from token if available, otherwise from params
    const userId = req.user?.userId || req.params.userId;

    const user = await this.userService.getById(userId);
    const userDTO = UserDTO.from(user);

    return this.success(res, { user: userDTO });
  });

  /**
   * Update user profile
   */
  updateProfile = catchAsync(async (req: Request, res: Response) => {
    // Use userId from token if available, otherwise from params
    const userId = req.user?.userId || req.params.userId;
    const { firstName, lastName, company, phone, profilePicture } = req.body;

    const user = await this.userService.updateProfile(userId, {
      firstName,
      lastName,
      company,
      phone,
      profilePicture,
    });
    const userDTO = UserDTO.from(user);

    return this.success(res, { user: userDTO });
  });
}

