import mongoose, { Schema, Document } from 'mongoose';
import { IOnboarding } from '../../models';

export interface IOnboardingDocument extends Omit<IOnboarding, 'id'>, Document {
  id: string;
}

const OnboardingSchema = new Schema<IOnboardingDocument>(
  {
    userId: {
      type: String,
      required: true,
      unique: true, // One onboarding per user
      index: true,
    },
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    userType: {
      type: String,
      required: true,
      enum: ['individual', 'architect', 'real_estate_company', 'other'],
    },
    mainGoal: {
      type: String,
      required: true,
      enum: ['personal_project', 'business_use', 'client_work', 'education_learning'],
    },
    monthlyProjects: {
      type: String,
      required: true,
      enum: ['1-5', '6-15', '16-30', '30+'],
    },
    companyName: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
      required: true,
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
OnboardingSchema.index({ userId: 1 });
OnboardingSchema.index({ accountId: 1 });

export const OnboardingModel = mongoose.model<IOnboardingDocument>('Onboarding', OnboardingSchema);

