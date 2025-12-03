import Stripe from 'stripe';
import { IPaymentProvider } from '../interfaces';
import { PlanType } from '../models/subscription.model';
import { Currency } from '../models/billing.model';

/**
 * Stripe Payment Provider Implementation
 * Handles all Stripe-specific payment operations
 */
export class StripeProvider implements IPaymentProvider {
  private stripe: Stripe;

  constructor() {
    const stripeKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeKey) {
      console.warn('⚠️  STRIPE_SECRET_KEY not found. Stripe provider will not work.');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });
  }

  getProviderName(): string {
    return 'stripe';
  }

  async createCustomer(
    email: string,
    name?: string,
    metadata?: Record<string, any>
  ): Promise<{ customerId: string }> {
    const customer = await this.stripe.customers.create({
      email,
      name,
      metadata,
    });

    return { customerId: customer.id };
  }

  async createSubscription(
    accountId: string,
    planType: PlanType,
    customerId?: string
  ): Promise<{
    subscriptionId: string;
    customerId: string;
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }> {
    // Get or create customer
    let customer: Stripe.Customer;
    if (customerId) {
      customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    } else {
      // In real implementation, you'd get customer email from account
      const newCustomer = await this.createCustomer(`account-${accountId}@buildmyplan.co.uk`);
      customer = await this.stripe.customers.retrieve(newCustomer.customerId) as Stripe.Customer;
    }

    // Get price ID for plan type (you'd configure these in Stripe dashboard)
    const priceId = this.getPriceIdForPlan(planType);

    const subscription = await this.stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        accountId,
        planType,
      },
    });

    return {
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  }

  async updateSubscription(
    subscriptionId: string,
    planType: PlanType
  ): Promise<{
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
  }> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const newPriceId = this.getPriceIdForPlan(planType);

    const updated = await this.stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      metadata: {
        ...subscription.metadata,
        planType,
      },
    });

    return {
      status: updated.status,
      currentPeriodStart: new Date(updated.current_period_start * 1000),
      currentPeriodEnd: new Date(updated.current_period_end * 1000),
    };
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<{
    status: string;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
  }> {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    return {
      status: subscription.status,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
    };
  }

  async resumeSubscription(subscriptionId: string): Promise<{
    status: string;
    cancelAtPeriodEnd: boolean;
  }> {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    return {
      status: subscription.status,
      cancelAtPeriodEnd: false,
    };
  }

  async getSubscription(subscriptionId: string): Promise<{
    status: string;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: Date;
  }> {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);

    return {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
      cancelledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : undefined,
    };
  }

  async createInvoice(
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
  }> {
    const invoice = await this.stripe.invoices.create({
      customer: customerId,
      subscription: subscriptionId,
      description,
      currency: currency.toLowerCase(),
      collection_method: 'charge_automatically',
    });

    // Add invoice items
    await this.stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      description,
    });

    // Finalize and pay invoice
    const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
    const paidInvoice = await this.stripe.invoices.pay(finalizedInvoice.id);

    return {
      invoiceId: paidInvoice.id,
      paymentIntentId: typeof paidInvoice.payment_intent === 'string' ? paidInvoice.payment_intent : undefined,
      status: paidInvoice.status || 'paid',
      invoicePdfUrl: paidInvoice.invoice_pdf || undefined,
    };
  }

  async getInvoicePdfUrl(invoiceId: string): Promise<string> {
    const invoice = await this.stripe.invoices.retrieve(invoiceId);
    if (!invoice.invoice_pdf) {
      throw new Error('Invoice PDF not available');
    }
    return invoice.invoice_pdf;
  }

  /**
   * Get Stripe price ID for plan type
   * These should be configured in your Stripe dashboard
   */
  private getPriceIdForPlan(planType: PlanType): string {
    const priceIds: Record<PlanType, string> = {
      free: process.env.STRIPE_PRICE_ID_FREE || '',
      pro: process.env.STRIPE_PRICE_ID_PRO || '',
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || '',
    };

    const priceId = priceIds[planType];
    if (!priceId) {
      throw new Error(`Price ID not configured for plan type: ${planType}`);
    }

    return priceId;
  }
}

