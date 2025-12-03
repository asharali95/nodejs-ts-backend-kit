import mongoose, { Schema, Document } from 'mongoose';
import { IActivity } from '../../models';

export interface IActivityDocument extends Omit<IActivity, 'id'>, Document {
  id: string;
}

const ActivitySchema = new Schema<IActivityDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'floor_plan_created',
        'floor_plan_updated',
        'floor_plan_deleted',
        'floor_plan_published',
        'profile_updated',
        'account_created',
        'account_updated',
        'user_registered',
        'user_logged_in',
        'trial_started',
        'trial_ended',
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track createdAt
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

// Indexes for efficient querying
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ accountId: 1, createdAt: -1 });
ActivitySchema.index({ activityType: 1, createdAt: -1 });
ActivitySchema.index({ createdAt: -1 }); // For recent activities

export const ActivityModel = mongoose.model<IActivityDocument>('Activity', ActivitySchema);

