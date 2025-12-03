import { PlanType } from '../models/subscription.model';
import { Currency } from '../models/billing.model';

/**
 * Payment Provider Interface
 * Abstract interface for payment providers (Stripe, PayPal, etc.)
 */
export interface IPaymentProvider {
  /**
   * Create a subscription
   */
  createSubscription(
    accountId: string,
    planType: PlanType,
    customerId?: string
  ): Promise<{
    subscriptionId: string;
    customerId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }>;

  /**
   * Update subscription plan
   */
  updateSubscription(
    subscriptionId: string,
    planType: PlanType
  ): Promise<{
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }>;

  /**
   * Cancel subscription
   */
  cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd?: boolean
  ): Promise<{
    status: string;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
  }>;

  /**
   * Resume cancelled subscription
   */
  resumeSubscription(subscriptionId: string): Promise<{
    status: string;
    cancelAtPeriodEnd: boolean;
  }>;

  /**
   * Get subscription details
   */
  getSubscription(subscriptionId: string): Promise<{
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
  }>;

  /**
   * Create invoice
   */
  createInvoice(
    customerId: string,
    amount: number,
    currency: Currency,
    description: string,
    subscriptionId?: string
  ): Promise<{
    invoiceId: string;
    paymentIntentId?: string;
    status: string;
    invoicePdfUrl?: string;
  }>;

  /**
   * Get invoice PDF URL
   */
  getInvoicePdfUrl(invoiceId: string): Promise<string>;

  /**
   * Create customer
   */
  createCustomer(email: string, name?: string, metadata?: Record<string, any>): Promise<{
    customerId: string;
  }>;

  /**
   * Get provider name
   */
  getProviderName(): string;
}

