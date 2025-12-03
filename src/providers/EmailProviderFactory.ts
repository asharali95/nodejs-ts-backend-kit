import { IEmailProvider } from '../interfaces';
import { config } from '../config';
import { NoopEmailProvider } from './NoopEmailProvider';

/**
 * Simple factory to resolve the active email provider.
 * Swap implementation here (e.g. SendGrid, SES, Resend) without touching business logic.
 */
export class EmailProviderFactory {
  static getProvider(): IEmailProvider {
    // In a real app, you might branch on config.EMAIL_PROVIDER
    // and return different implementations.
    if (!config.NODE_ENV || config.NODE_ENV === 'development') {
      return new NoopEmailProvider();
    }

    return new NoopEmailProvider();
  }
}


