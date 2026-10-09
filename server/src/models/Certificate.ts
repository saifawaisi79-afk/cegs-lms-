import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICertificate extends Document {
  certificateId: string;
  student: mongoose.Types.ObjectId;
  candidateName: string;
  programTitle: string;
  trackName: string;
  completionDate: Date;
  issueDate: Date;
  grade: string;
  verificationUrl: string;
  status: 'Issued' | 'Revoked';
  issuedBy?: mongoose.Types.ObjectId;
  skillsCertified: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: { type: String, required: true, unique: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    candidateName: { type: String, required: true },
    programTitle: { type: String, default: '6-Month Freshers Growth Training Program' },
    trackName: { type: String, required: true },
    completionDate: { type: Date, required: true },
    issueDate: { type: Date, default: Date.now },
    grade: { type: String, default: 'Distinction' },
    verificationUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['Issued', 'Revoked'],
      default: 'Issued',
    },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    skillsCertified: [{ type: String }],
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate || mongoose.model<ICertificate>('Certificate', CertificateSchema);
