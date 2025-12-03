import { Billing, IBilling, Currency } from '../models';
import { BaseService } from './BaseService';
import { BillingRepository } from '../repositories';
import { SubscriptionRepository } from '../repositories';
import { NotFoundError } from '../errors';
import { PaymentProviderFactory } from '../payment-providers';
import { redisCache } from '../cache';

/**
 * Billing Service
 * Business logic for billing/invoice operations
 */
export class BillingService extends BaseService<Billing, string> {
  constructor(
    private readonly billingRepository: BillingRepository,
    private readonly subscriptionRepository: SubscriptionRepository
  ) {
    super();
  }

  /**
   * Get billing history for an account
   */
  async getBillingHistory(accountId: string, limit?: number): Promise<Billing[]> {
    const cacheKey = `billing:history:${accountId}:${limit || 'all'}`;

    return redisCache.getOrSet(
      cacheKey,
      async () => {
        return this.billingRepository.findByAccountId(accountId, limit);
      },
      1800 // 30 minutes cache
    );
  }

  /**
   * Get billing by ID
   */
  async getById(id: string): Promise<Billing> {
    const billing = await this.billingRepository.findById(id);
    this.throwIfNotFound(billing, id, 'Billing');
    return billing;
  }

  /**
   * Create invoice
   */
  async createInvoice(
    accountId: string,
    amount: number,
    currency: Currency,
    description: string,
    subscriptionId?: string,
    paymentProvider: string = 'stripe'
  ): Promise<Billing> {
    // Get subscription if provided
    let customerId: string | undefined;
    if (subscriptionId) {
      const subscription = await this.subscriptionRepository.findById(subscriptionId);
      if (subscription && subscription.providerSubscriptionId) {
        // In real implementation, you'd get customer ID from subscription or account
        // For now, we'll create a customer if needed
      }
    }

    // Get payment provider
    const provider = PaymentProviderFactory.getProvider(paymentProvider);

    // Create customer if needed (in real implementation, store customer ID in account)
    if (!customerId) {
      const customer = await provider.createCustomer(`account-${accountId}@example.com`);
      customerId = customer.customerId;
    }

    // Create invoice with payment provider
    const providerResult = await provider.createInvoice(
      customerId,
      amount,
      currency,
      description,
      subscriptionId
    );

    // Create billing record in database
    const billing = await this.billingRepository.create({
      accountId,
      subscriptionId,
      date: new Date(),
      description,
      amount,
      currency,
      status: providerResult.status as any,
      invoicePdfUrl: providerResult.invoicePdfUrl,
      paymentProvider,
      providerInvoiceId: providerResult.invoiceId,
      providerPaymentIntentId: providerResult.paymentIntentId,
    });

    // Invalidate cache
    await redisCache.delete(`billing:history:${accountId}:*`);
    await redisCache.invalidatePattern(`billing:history:${accountId}:*`);

    return billing;
  }

  /**
   * Get invoice PDF URL
   */
  async getInvoicePdfUrl(billingId: string): Promise<string> {
    const billing = await this.getById(billingId);

    // If PDF URL already exists, return it
    if (billing.invoicePdfUrl) {
      return billing.invoicePdfUrl;
    }

    // Get PDF URL from payment provider
    if (billing.providerInvoiceId) {
      const provider = PaymentProviderFactory.getProvider(billing.paymentProvider);
      const pdfUrl = await provider.getInvoicePdfUrl(billing.providerInvoiceId);

      // Update billing record with PDF URL
      await this.billingRepository.update(billingId, {
        invoicePdfUrl: pdfUrl,
      });

      return pdfUrl;
    }

    throw new NotFoundError('Invoice PDF not available');
  }

  /**
   * Get billing by invoice number
   */
  async getByInvoiceNumber(invoiceNumber: string): Promise<Billing> {
    const billing = await this.billingRepository.findByInvoiceNumber(invoiceNumber);
    this.throwIfNotFound(billing, invoiceNumber, 'Billing');
    return billing;
  }

  /**
   * Get all billing records
   */
  async getAll(): Promise<Billing[]> {
    return this.billingRepository.findAll();
  }

  /**
   * Create billing (generic method)
   */
  async create(data: Partial<IBilling>): Promise<Billing> {
    const billing = await this.billingRepository.create(data);
    
    // Invalidate cache
    await redisCache.invalidatePattern(`billing:history:${billing.accountId}:*`);
    
    return billing;
  }

  /**
   * Update billing (generic method)
   */
  async update(id: string, updates: Partial<IBilling>): Promise<Billing> {
    // Validate billing exists
    await this.getById(id);
    const updated = await this.billingRepository.update(id, updates);
    
    // Invalidate cache
    await redisCache.invalidatePattern(`billing:history:${updated.accountId}:*`);
    
    return updated;
  }

  /**
   * Delete billing
   */
  async delete(id: string): Promise<void> {
    const billing = await this.getById(id);
    await this.billingRepository.delete(id);
    
    // Invalidate cache
    await redisCache.invalidatePattern(`billing:history:${billing.accountId}:*`);
  }
}

