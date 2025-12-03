import { UserRepository } from '../repositories';
import { AccountRepository } from '../repositories';

/**
 * Dashboard Service
 * Provides analytics and statistics for the dashboard
 */
export class DashboardService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly accountRepository: AccountRepository
  ) {}

  /**
   * Get dashboard analytics for an account
   */
  async getDashboardAnalytics(accountId: string): Promise<{
    totalItems: number;
    teamMembers: number;
    storageUsed: number; // In MB (dummy for now)
  }> {
    // Verify account exists
    const account = await this.accountRepository.findById(accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Get team members count
    const teamMembers = await this.userRepository.findByAccountId(accountId);
    const teamMembersCount = teamMembers.length;

    // Dummy storage calculation (in MB)
    // In production, this would calculate actual storage used based on your domain
    const storageUsed = 0;

    return {
      totalItems: 0,
      teamMembers: teamMembersCount,
      storageUsed,
    };
  }
}

