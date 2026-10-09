import mongoose, { Document, Schema, Model } from 'mongoose';

export type StipendStatus = 'Eligible' | 'Processing' | 'Disbursed' | 'On Hold' | 'Ineligible';

export interface IStipendRecord extends Document {
  student: mongoose.Types.ObjectId;
  monthNumber: number; // 1-6
  monthName: string;
  expectedAmount: number;
  amountPaid: number;
  status: StipendStatus;
  paymentReference?: string;
  paymentDate?: Date;
  remarks?: string;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StipendRecordSchema = new Schema<IStipendRecord>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    monthNumber: { type: Number, required: true },
    monthName: { type: String, required: true },
    expectedAmount: { type: Number, default: 16500 },
    amountPaid: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Eligible', 'Processing', 'Disbursed', 'On Hold', 'Ineligible'],
      default: 'Eligible',
      index: true,
    },
    paymentReference: { type: String, default: '' },
    paymentDate: { type: Date },
    remarks: { type: String, default: '' },
    processedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const StipendRecord: Model<IStipendRecord> =
  mongoose.models.StipendRecord ||
  mongoose.model<IStipendRecord>('StipendRecord', StipendRecordSchema);
