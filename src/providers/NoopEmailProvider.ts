import { IEmailProvider, EmailMessage } from '../interfaces';
import { logger } from '../utils';

/**
 * Default "no-op" email provider.
 * Logs emails instead of sending, perfect for templates and local dev.
 */
export class NoopEmailProvider implements IEmailProvider {
  async sendEmail(message: EmailMessage): Promise<void> {
    logger.info('Email (noop provider)', message);
  }
}


