import { Subscription, ISubscription } from '../models';
import { BaseRepository } from './BaseRepository';
import { SubscriptionModel, ISubscriptionDocument } from '../database/schemas';
import mongoose from 'mongoose';

/**
 * Subscription Repository
 * Handles all data access operations for subscriptions using MongoDB
 */
export class SubscriptionRepository extends BaseRepository<Subscription, string> {
  protected storage: any; // Not used with MongoDB

  private documentToModel(doc: ISubscriptionDocument): Subscription {
    return new Subscription({
      id: doc._id.toString(),
      accountId: doc.accountId,
      planType: doc.planType,
      status: doc.status,
      currentPeriodStart: doc.currentPeriodStart,
      currentPeriodEnd: doc.currentPeriodEnd,
      cancelAtPeriodEnd: doc.cancelAtPeriodEnd,
      cancelledAt: doc.cancelledAt,
      features: doc.features,
      paymentProvider: doc.paymentProvider,
      providerSubscriptionId: doc.providerSubscriptionId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Subscription | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await SubscriptionModel.findById(id).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findAll(): Promise<Subscription[]> {
    const docs = await SubscriptionModel.find().exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByAccountId(accountId: string): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOne({ accountId }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findByProviderSubscriptionId(
    provider: string,
    providerSubscriptionId: string
  ): Promise<Subscription | null> {
    const doc = await SubscriptionModel.findOne({
      paymentProvider: provider,
      providerSubscriptionId,
    }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async create(entity: Partial<ISubscription>): Promise<Subscription> {
    const subscriptionData: any = { ...entity };
    delete subscriptionData.id;

    const doc = new SubscriptionModel(subscriptionData);
    await doc.save();
    return this.documentToModel(doc);
  }

  async update(id: string, updates: Partial<ISubscription>): Promise<Subscription> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Subscription');
    }

    const subscription = await this.findById(id);
    this.throwIfNotFound(subscription, id, 'Subscription');

    const updateData: any = { ...updates, updatedAt: new Date() };
    delete updateData.id;

    const doc = await SubscriptionModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!doc) {
      throw new Error('Subscription not found after update');
    }

    return this.documentToModel(doc);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Subscription');
    }

    const subscription = await this.findById(id);
    this.throwIfNotFound(subscription, id, 'Subscription');
    await SubscriptionModel.findByIdAndDelete(id).exec();
  }
}

