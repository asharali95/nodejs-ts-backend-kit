export type BillingStatus = 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'CAD' | 'AUD';

export interface IBilling {
  id: string;
  accountId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  status: BillingStatus;
  invoicePdfUrl?: string; // URL to downloadable invoice PDF
  paymentProvider: string; // 'stripe', 'paypal', etc.
  providerInvoiceId?: string; // External provider invoice ID
  providerPaymentIntentId?: string; // External provider payment intent ID
  metadata?: Record<string, any>; // Additional metadata
  createdAt: Date;
  updatedAt: Date;
}

export class Billing implements IBilling {
  id: string;
  accountId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  date: Date;
  description: string;
  amount: number;
  currency: Currency;
  status: BillingStatus;
  invoicePdfUrl?: string;
  paymentProvider: string;
  providerInvoiceId?: string;
  providerPaymentIntentId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IBilling>) {
    this.id = data.id || '';
    this.accountId = data.accountId || '';
    this.subscriptionId = data.subscriptionId;
    this.invoiceNumber = data.invoiceNumber || this.generateInvoiceNumber();
    this.date = data.date || new Date();
    this.description = data.description || '';
    this.amount = data.amount || 0;
    this.currency = data.currency || 'USD';
    this.status = data.status || 'pending';
    this.invoicePdfUrl = data.invoicePdfUrl;
    this.paymentProvider = data.paymentProvider || 'stripe';
    this.providerInvoiceId = data.providerInvoiceId;
    this.providerPaymentIntentId = data.providerPaymentIntentId;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Generate invoice number
   */
  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }
}

