import { Activity, IActivity } from '../models';
import { BaseRepository } from './BaseRepository';
import { ActivityModel, IActivityDocument } from '../database/schemas';
import mongoose from 'mongoose';

/**
 * Activity Repository
 * Handles all data access operations for activities using MongoDB
 */
export class ActivityRepository extends BaseRepository<Activity, string> {
  protected storage: any; // Not used with MongoDB

  private documentToModel(doc: IActivityDocument): Activity {
    return new Activity({
      id: doc._id.toString(),
      userId: doc.userId,
      accountId: doc.accountId,
      activityType: doc.activityType,
      description: doc.description,
      metadata: doc.metadata,
      createdAt: doc.createdAt,
    });
  }

  async findById(id: string): Promise<Activity | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await ActivityModel.findById(id).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findAll(): Promise<Activity[]> {
    const docs = await ActivityModel.find().exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByUserId(userId: string, limit: number = 50): Promise<Activity[]> {
    const docs = await ActivityModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByAccountId(accountId: string, limit: number = 50): Promise<Activity[]> {
    const docs = await ActivityModel.find({ accountId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByActivityType(
    activityType: string,
    limit: number = 50
  ): Promise<Activity[]> {
    const docs = await ActivityModel.find({ activityType })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async create(entity: Partial<IActivity>): Promise<Activity> {
    const activityData: any = { ...entity };
    // Remove id if provided, MongoDB will generate _id
    delete activityData.id;

    const doc = new ActivityModel(activityData);
    await doc.save();
    return this.documentToModel(doc);
  }

  async update(id: string, updates: Partial<IActivity>): Promise<Activity> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Activity');
    }

    // Activities are typically immutable, but keeping for interface compliance
    const activity = await this.findById(id);
    this.throwIfNotFound(activity, id, 'Activity');

    const updateData: any = { ...updates };
    // Remove id from updates if present
    delete updateData.id;

    const doc = await ActivityModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).exec();

    if (!doc) {
      throw new Error('Activity not found after update');
    }

    return this.documentToModel(doc);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'Activity');
    }

    const activity = await this.findById(id);
    this.throwIfNotFound(activity, id, 'Activity');
    await ActivityModel.findByIdAndDelete(id).exec();
  }

  /**
   * Get recent activities for a user
   */
  async getRecentByUserId(userId: string, limit: number = 20): Promise<Activity[]> {
    return this.findByUserId(userId, limit);
  }

  /**
   * Get recent activities for an account
   */
  async getRecentByAccountId(accountId: string, limit: number = 20): Promise<Activity[]> {
    return this.findByAccountId(accountId, limit);
  }
}

