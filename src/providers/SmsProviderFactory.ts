import { ISmsProvider } from '../interfaces';
import { config } from '../config';
import { NoopSmsProvider } from './NoopSmsProvider';

/**
 * Simple factory to resolve the active SMS provider.
 * Swap implementation here (e.g. Twilio) without touching business logic.
 */
export class SmsProviderFactory {
  static getProvider(): ISmsProvider {
    // In a real app, you might branch on config.SMS_PROVIDER
    // and return different implementations.
    if (!config.NODE_ENV || config.NODE_ENV === 'development') {
      return new NoopSmsProvider();
    }

    return new NoopSmsProvider();
  }
}


