import mongoose, { Schema, Document } from 'mongoose';
import { ISubscription } from '../../models';

export interface ISubscriptionDocument extends Omit<ISubscription, 'id'>, Document {
  id: string;
}

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    accountId: {
      type: String,
      required: true,
      unique: true, // One subscription per account
      index: true,
    },
    planType: {
      type: String,
      required: true,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'cancelled', 'past_due', 'trialing', 'expired'],
      default: 'active',
    },
    currentPeriodStart: {
      type: Date,
      required: true,
    },
    currentPeriodEnd: {
      type: Date,
      required: true,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    features: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    paymentProvider: {
      type: String,
      required: true,
      default: 'stripe',
      index: true,
    },
    providerSubscriptionId: {
      type: String,
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
        return ret;
      },
    },
  }
);

// Indexes
SubscriptionSchema.index({ accountId: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ paymentProvider: 1, providerSubscriptionId: 1 });

export const SubscriptionModel = mongoose.model<ISubscriptionDocument>('Subscription', SubscriptionSchema);

