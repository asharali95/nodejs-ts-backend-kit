import { Account, IAccount } from '../models';
import { BaseRepository } from './BaseRepository';
import { ConflictError } from '../errors';
import { AccountModel, IAccountDocument } from '../database/schemas';
import mongoose from 'mongoose';

/**
 * Account Repository
 * Handles all data access operations for accounts using MongoDB
 */
export class AccountRepository extends BaseRepository<Account, string> {
  protected storage: any; // Not used with MongoDB

  private documentToModel(doc: IAccountDocument): Account {
    return new Account({
      id: doc._id.toString(),
      name: doc.name,
      subdomain: doc.subdomain,
      plan: doc.plan,
      status: doc.status,
      isTrial: doc.isTrial,
      trialStartDate: doc.trialStartDate,
      trialEndDate: doc.trialEndDate,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Account | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await AccountModel.findById(id).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findAll(): Promise<Account[]> {
    const docs = await AccountModel.find().exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findBySubdomain(subdomain: string): Promise<Account | null> {
    const doc = await AccountModel.findOne({ subdomain }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async create(entity: Partial<IAccount>): Promise<Account> {
    // Check if subdomain already exists
    if (entity.subdomain) {
      const existing = await this.findBySubdomain(entity.subdomain);
      if (existing) {
        throw new ConflictError(`Account with subdomain ${entity.subdomain} already exists`);
      }
    }

    const accountData = { ...entity };
    // Remove id if provided, MongoDB will generate _id
    delete (accountData as any).id;

    const doc = new AccountModel(accountData);
    await doc.save();
    return this.documentToModel(doc);
  }

  async update(id: string, updates: Partial<IAccount>): Promise<Account> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Account');
    }

    const account = await this.findById(id);
    this.throwIfNotFound(account, id, 'Account');

    // Check subdomain conflict if updating subdomain
    if (updates.subdomain && updates.subdomain !== account.subdomain) {
      const existing = await this.findBySubdomain(updates.subdomain);
      if (existing) {
        throw new ConflictError(`Account with subdomain ${updates.subdomain} already exists`);
      }
    }

    // Remove id from updates if present
    const updateData = { ...updates };
    delete (updateData as any).id;

    const doc = await AccountModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!doc) {
      throw new Error('Account not found after update');
    }

    return this.documentToModel(doc);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Account');
    }

    const account = await this.findById(id);
    this.throwIfNotFound(account, id, 'Account');
    await AccountModel.findByIdAndDelete(id).exec();
  }

  async exists(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return false;
    }
    const doc = await AccountModel.findById(id).exec();
    return doc !== null;
  }
}

