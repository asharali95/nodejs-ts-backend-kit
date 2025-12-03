import mongoose, { Schema, Document } from 'mongoose';
import { IAccount } from '../../models';

export interface IAccountDocument extends Omit<IAccount, 'id'>, Document {
  id: string;
}

const AccountSchema = new Schema<IAccountDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subdomain: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'cancelled'],
      default: 'active',
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    trialStartDate: {
      type: Date,
    },
    trialEndDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc: any, ret: any) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
AccountSchema.index({ subdomain: 1 });
AccountSchema.index({ status: 1 });
AccountSchema.index({ isTrial: 1 });

export const AccountModel = mongoose.model<IAccountDocument>('Account', AccountSchema);

