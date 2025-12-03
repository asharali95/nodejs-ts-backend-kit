import { Billing, IBilling } from '../models';
import { BaseRepository } from './BaseRepository';
import { BillingModel, IBillingDocument } from '../database/schemas';
import mongoose from 'mongoose';

/**
 * Billing Repository
 * Handles all data access operations for billing/invoices using MongoDB
 */
export class BillingRepository extends BaseRepository<Billing, string> {
  protected storage: any; // Not used with MongoDB

  private documentToModel(doc: IBillingDocument): Billing {
    return new Billing({
      id: doc._id.toString(),
      accountId: doc.accountId,
      subscriptionId: doc.subscriptionId,
      invoiceNumber: doc.invoiceNumber,
      date: doc.date,
      description: doc.description,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status,
      invoicePdfUrl: doc.invoicePdfUrl,
      paymentProvider: doc.paymentProvider,
      providerInvoiceId: doc.providerInvoiceId,
      providerPaymentIntentId: doc.providerPaymentIntentId,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Billing | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await BillingModel.findById(id).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findAll(): Promise<Billing[]> {
    const docs = await BillingModel.find().exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByAccountId(accountId: string, limit?: number): Promise<Billing[]> {
    const query = BillingModel.find({ accountId }).sort({ date: -1 });
    if (limit) {
      query.limit(limit);
    }
    const docs = await query.exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findBySubscriptionId(subscriptionId: string): Promise<Billing[]> {
    const docs = await BillingModel.find({ subscriptionId }).sort({ date: -1 }).exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<Billing | null> {
    const doc = await BillingModel.findOne({ invoiceNumber }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findByProviderInvoiceId(
    provider: string,
    providerInvoiceId: string
  ): Promise<Billing | null> {
    const doc = await BillingModel.findOne({
      paymentProvider: provider,
      providerInvoiceId,
    }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async create(entity: Partial<IBilling>): Promise<Billing> {
    const billingData: any = { ...entity };
    delete billingData.id;

    const doc = new BillingModel(billingData);
    await doc.save();
    return this.documentToModel(doc);
  }

  async update(id: string, updates: Partial<IBilling>): Promise<Billing> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Billing');
    }

    const billing = await this.findById(id);
    this.throwIfNotFound(billing, id, 'Billing');

    const updateData: any = { ...updates, updatedAt: new Date() };
    delete updateData.id;

    const doc = await BillingModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!doc) {
      throw new Error('Billing not found after update');
    }

    return this.documentToModel(doc);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Billing');
    }

    const billing = await this.findById(id);
    this.throwIfNotFound(billing, id, 'Billing');
    await BillingModel.findByIdAndDelete(id).exec();
  }
}

