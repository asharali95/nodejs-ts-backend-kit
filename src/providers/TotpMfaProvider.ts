import speakeasy from 'speakeasy';
import { IMfaProvider } from '../interfaces';
import { config } from '../config';

/**
 * TOTP-based MFA provider using RFC 6238 (e.g., Google Authenticator).
 */
export class TotpMfaProvider implements IMfaProvider {
  async generateSecret(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    const secret = speakeasy.generateSecret({
      name: `${config.APP_NAME} (${userId})`,
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url || '',
    };
  }

  async verifyCode(secret: string, code: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
  }
}


