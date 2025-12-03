import mongoose, { Schema, Document } from 'mongoose';
import { IBilling } from '../../models';

export interface IBillingDocument extends Omit<IBilling, 'id'>, Document {
  id: string;
}

const BillingSchema = new Schema<IBillingDocument>(
  {
    accountId: {
      type: String,
      required: true,
      index: true,
    },
    subscriptionId: {
      type: String,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'],
      default: 'USD',
    },
    status: {
      type: String,
      required: true,
      enum: ['paid', 'pending', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
    },
    invoicePdfUrl: {
      type: String,
    },
    paymentProvider: {
      type: String,
      required: true,
      default: 'stripe',
      index: true,
    },
    providerInvoiceId: {
      type: String,
      index: true,
    },
    providerPaymentIntentId: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
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
BillingSchema.index({ accountId: 1, date: -1 });
BillingSchema.index({ subscriptionId: 1 });
BillingSchema.index({ status: 1 });
BillingSchema.index({ paymentProvider: 1, providerInvoiceId: 1 });

export const BillingModel = mongoose.model<IBillingDocument>('Billing', BillingSchema);

