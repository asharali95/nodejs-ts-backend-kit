import { IMfaProvider } from '../interfaces';
import { TotpMfaProvider } from './TotpMfaProvider';

/**
 * MFA provider factory. Currently returns a TOTP provider.
 * Extend this to support SMS, email-based OTP, WebAuthn, etc.
 */
export class MfaProviderFactory {
  static getProvider(): IMfaProvider {
    return new TotpMfaProvider();
  }
}


