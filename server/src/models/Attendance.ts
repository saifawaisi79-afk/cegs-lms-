import mongoose, { Document, Schema, Model } from 'mongoose';

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface IAttendance extends Document {
  student: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  date: Date;
  status: AttendanceStatus;
  markedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  checkInTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    date: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present',
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    remarks: { type: String, default: '' },
    checkInTime: { type: String, default: '' },
  },
  { timestamps: true }
);

// Prevent duplicate attendance for same student on same calendar date
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
