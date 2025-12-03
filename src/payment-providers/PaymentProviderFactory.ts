import { IPaymentProvider } from '../interfaces';
import { StripeProvider } from './StripeProvider';

/**
 * Payment Provider Factory
 * Creates payment provider instances based on provider name
 * This allows easy extension to support multiple payment providers
 */
export class PaymentProviderFactory {
  private static providers: Map<string, () => IPaymentProvider> = new Map();

  /**
   * Register a payment provider
   */
  static register(providerName: string, factory: () => IPaymentProvider): void {
    this.providers.set(providerName.toLowerCase(), factory);
  }

  /**
   * Get payment provider instance
   */
  static getProvider(providerName: string = 'stripe'): IPaymentProvider {
    const factory = this.providers.get(providerName.toLowerCase());
    if (!factory) {
      throw new Error(`Payment provider '${providerName}' is not registered`);
    }
    return factory();
  }

  /**
   * Check if provider is registered
   */
  static isProviderRegistered(providerName: string): boolean {
    return this.providers.has(providerName.toLowerCase());
  }
}

// Register default providers
PaymentProviderFactory.register('stripe', () => new StripeProvider());

// Future providers can be registered here:
// PaymentProviderFactory.register('paypal', () => new PayPalProvider());
// PaymentProviderFactory.register('razorpay', () => new RazorpayProvider());

