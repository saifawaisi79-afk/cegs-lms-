import mongoose, { Document, Schema, Model } from 'mongoose';

export type PaymentStatus =
  | 'Paid'
  | 'Partially Paid'
  | 'Pending'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export type PaymentMethod =
  | 'Online'
  | 'Bank Transfer'
  | 'UPI'
  | 'Card'
  | 'Cash'
  | 'Other';

export interface IPayment extends Document {
  paymentId: string;
  receiptNumber: string;

  studentId: mongoose.Types.ObjectId;
  studentProfile?: mongoose.Types.ObjectId;
  programId?: mongoose.Types.ObjectId;
  trackId?: mongoose.Types.ObjectId;
  batchId?: mongoose.Types.ObjectId;

  description: string;
  installmentNumber?: number;

  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;

  amountPaid: number;
  balanceAmount: number;

  paymentMethod: PaymentMethod;
  transactionId?: string;

  paymentDate: Date;
  status: PaymentStatus;

  receiptUrl?: string;
  notes?: string;

  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studentProfile: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      index: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: 'Program',
    },
    trackId: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
    },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: 'Batch',
    },
    description: {
      type: String,
      required: true,
      default: 'Course / Training Fee',
    },
    installmentNumber: {
      type: Number,
      default: 1,
    },
    baseAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    gstRate: {
      type: Number,
      required: true,
      default: 18,
    },
    gstAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    balanceAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Online', 'Bank Transfer', 'UPI', 'Card', 'Cash', 'Other'],
      default: 'Online',
    },
    transactionId: {
      type: String,
      default: '',
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Pending', 'Failed', 'Refunded', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    receiptUrl: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ studentId: 1, paymentDate: -1 });
PaymentSchema.index({ status: 1, paymentDate: -1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
