import { User, IUser } from '../models';
import { BaseRepository } from './BaseRepository';
import { ConflictError } from '../errors';
import { UserModel, IUserDocument } from '../database/schemas';
import mongoose from 'mongoose';

/**
 * User Repository
 * Handles all data access operations for users using MongoDB
 */
export class UserRepository extends BaseRepository<User, string> {
  protected storage: any; // Not used with MongoDB

  private documentToModel(doc: IUserDocument | any): User {
    return new User({
      id: doc._id.toString(),
      accountId: doc.accountId,
      email: doc.email,
      password: doc.password,
      role: doc.role,
      firstName: doc.firstName,
      lastName: doc.lastName,
      company: doc.company,
      phone: doc.phone,
      profilePicture: doc.profilePicture,
      onboardingCompleted: doc.onboardingCompleted ?? false,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  async findById(id: string): Promise<User | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    const doc = await UserModel.findById(id).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findAll(): Promise<User[]> {
    const docs = await UserModel.find().exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() }).exec();
    return doc ? this.documentToModel(doc) : null;
  }

  async findByAccountId(accountId: string): Promise<User[]> {
    const docs = await UserModel.find({ accountId }).exec();
    return docs.map((doc) => this.documentToModel(doc));
  }

  async create(entity: Partial<IUser>): Promise<User> {
    // Check if email already exists
    if (entity.email) {
      const existing = await this.findByEmail(entity.email);
      if (existing) {
        throw new ConflictError(`User with email ${entity.email} already exists`);
      }
    }

    const userData: any = {
      ...entity,
      email: entity.email?.toLowerCase(),
    };
    // Remove id if provided, MongoDB will generate _id
    delete userData.id;

    const doc = new UserModel(userData);
    await doc.save();
    return this.documentToModel(doc);
  }

  async update(id: string, updates: Partial<IUser>): Promise<User> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'User');
    }

    const user = await this.findById(id);
    this.throwIfNotFound(user, id, 'User');

    // Check email conflict if updating email
    if (updates.email && updates.email !== user.email) {
      const existing = await this.findByEmail(updates.email);
      if (existing) {
        throw new ConflictError(`User with email ${updates.email} already exists`);
      }
    }

    const updateData: any = { ...updates, updatedAt: new Date() };
    if (updates.email) {
      updateData.email = updates.email.toLowerCase();
    }
    // Remove id from updates if present
    delete updateData.id;

    const doc = await UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();

    if (!doc) {
      throw new Error('User not found after update');
    }

    return this.documentToModel(doc);
  }

  async delete(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      this.throwIfNotFound(null, id, 'User');
    }

    const user = await this.findById(id);
    this.throwIfNotFound(user, id, 'User');
    await UserModel.findByIdAndDelete(id).exec();
  }
}

