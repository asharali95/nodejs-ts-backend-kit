import { Billing } from '../models';

/**
 * Billing Data Transfer Object
 */
export class BillingDTO {
  id: string;
  accountId: string;
  subscriptionId?: string;
  invoiceNumber: string;
  date: Date;
  description: string;
  amount: number;
  currency: string;
  status: string;
  invoicePdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(billing: Billing) {
    this.id = billing.id;
    this.accountId = billing.accountId;
    this.subscriptionId = billing.subscriptionId;
    this.invoiceNumber = billing.invoiceNumber;
    this.date = billing.date;
    this.description = billing.description;
    this.amount = billing.amount;
    this.currency = billing.currency;
    this.status = billing.status;
    this.invoicePdfUrl = billing.invoicePdfUrl;
    this.createdAt = billing.createdAt;
    this.updatedAt = billing.updatedAt;
  }

  static from(billing: Billing): BillingDTO {
    return new BillingDTO(billing);
  }

  static fromArray(billings: Billing[]): BillingDTO[] {
    return billings.map((billing) => BillingDTO.from(billing));
  }
}

