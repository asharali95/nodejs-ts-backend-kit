import { Onboarding, IOnboarding } from '../models';
import { BaseRepository } from './BaseRepository';
import { ConflictError } from '../errors';
import { OnboardingModel, IOnboardingDocument } from '../database/schemas';
import mongoose from 'mongoose';

/**
 * Onboarding Repository
 * Handles all data access operations for onboarding using MongoDB
 */
export class OnboardingRepository extends BaseRepository<Onboarding, string> {
  protected storage: any; // Not used with MongoDB

  private documentToModel(doc: IOnboardingDocument): Onboarding {
    return new Onboarding({
      id: doc._id.toString(),
      userId: doc.userId,
      accountId: doc.accountId,
      userType: doc.userType,
      mainGoal: doc.mainGoal,
      monthlyProjects: doc.monthlyProjects,
      companyName: doc.companyName,
      completedAt: doc.completedAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<Onboarding | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await OnboardingModel.findById(id).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findAll(): Promise<Onboarding[]> {
    const docs = await OnboardingModel.find().exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByUserId(userId: string): Promise<Onboarding | null> {
    const doc = await OnboardingModel.findOne({ userId }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findByAccountId(accountId: string): Promise<Onboarding[]> {
    const docs = await OnboardingModel.find({ accountId }).exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async create(entity: Partial<IOnboarding>): Promise<Onboarding> {
    // Check if user already has onboarding
    if (entity.userId) {
      const existing = await this.findByUserId(entity.userId);
      if (existing) {
        throw new ConflictError('User has already completed onboarding');
      }
    }

    const onboardingData: any = {
      ...entity,
      completedAt: entity.completedAt || new Date(),
    };
    // Remove id if provided, MongoDB will generate _id
    delete onboardingData.id;

    const doc = new OnboardingModel(onboardingData);
    await doc.save();
    return this.documentToModel(doc);
  }

  async update(id: string, updates: Partial<IOnboarding>): Promise<Onboarding> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Onboarding');
    }

    const onboarding = await this.findById(id);
    this.throwIfNotFound(onboarding, id, 'Onboarding');

    const updateData: any = { ...updates, updatedAt: new Date() };
    // Remove id from updates if present
    delete updateData.id;

    const doc = await OnboardingModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!doc) {
      throw new Error('Onboarding not found after update');
    }

    return this.documentToModel(doc);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Onboarding');
    }

    const onboarding = await this.findById(id);
    this.throwIfNotFound(onboarding, id, 'Onboarding');
    await OnboardingModel.findByIdAndDelete(id).exec();
  }

  /**
   * Check if user has completed onboarding
   */
  async hasCompletedOnboarding(userId: string): Promise<boolean> {
    const onboarding = await this.findByUserId(userId);
    return onboarding !== null;
  }
}

