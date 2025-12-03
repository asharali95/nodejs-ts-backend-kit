import { User } from '../models';

/**
 * User Data Transfer Object
 * Used for API responses to control what data is exposed
 */
export class UserDTO {
  id: string;
  accountId: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  firstName?: string;
  lastName?: string;
  fullName: string;
  company?: string;
  phone?: string;
  profilePicture?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.accountId = user.accountId;
    this.email = user.email;
    this.role = user.role;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = user.getFullName();
    this.company = user.company;
    this.phone = user.phone;
    this.profilePicture = user.profilePicture;
    this.onboardingCompleted = user.onboardingCompleted;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  /**
   * Create DTO from user model
   */
  static from(user: User): UserDTO {
    return new UserDTO(user);
  }

  /**
   * Create DTOs from array of users
   */
  static fromArray(users: User[]): UserDTO[] {
    return users.map((user) => UserDTO.from(user));
  }

  /**
   * Create minimal DTO (for lists)
   */
  static minimal(user: User): Partial<UserDTO> {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}

