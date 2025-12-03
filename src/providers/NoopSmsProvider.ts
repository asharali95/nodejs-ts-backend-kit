import { ISmsProvider, SmsMessage } from '../interfaces';
import { logger } from '../utils';

/**
 * Default "no-op" SMS provider.
 * Logs SMS instead of sending, suitable for templates and dev.
 */
export class NoopSmsProvider implements ISmsProvider {
  async sendSms(message: SmsMessage): Promise<void> {
    logger.info('SMS (noop provider)', message);
  }
}


