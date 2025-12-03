import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../../models';

export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  id: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Never return password in JSON
        return ret;
      },
    },
  }
);

// Indexes
UserSchema.index({ accountId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ accountId: 1, email: 1 });

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

