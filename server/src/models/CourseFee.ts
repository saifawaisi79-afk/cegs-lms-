import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICourseFee extends Document {
  program?: mongoose.Types.ObjectId;
  programTitle: string;
  track?: mongoose.Types.ObjectId;
  baseFee: number;
  gstRate: number; // default 18
  gstAmount: number; // calculated baseFee * gstRate / 100
  totalFee: number; // baseFee + gstAmount
  currency: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseFeeSchema = new Schema<ICourseFee>(
  {
    program: { type: Schema.Types.ObjectId, ref: 'Program' },
    programTitle: { type: String, default: '6-Month Job-Ready Training Program' },
    track: { type: Schema.Types.ObjectId, ref: 'Track' },
    baseFee: { type: Number, required: true, default: 100000 },
    gstRate: { type: Number, required: true, default: 18 },
    gstAmount: { type: Number, required: true, default: 18000 },
    totalFee: { type: Number, required: true, default: 118000 },
    currency: { type: String, default: 'INR' },
    description: { type: String, default: '6-Month Job-Ready Training Program Standard Tuition Fee' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CourseFee: Model<ICourseFee> =
  mongoose.models.CourseFee || mongoose.model<ICourseFee>('CourseFee', CourseFeeSchema);
