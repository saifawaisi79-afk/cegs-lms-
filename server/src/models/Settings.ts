import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  orgName: string;
  supportEmail: string;
  stipendBase: number;
  passingScore: number;
  attendanceMin: number;
}

const SettingsSchema = new Schema<ISettings>({
  orgName: { type: String, default: 'Career Expert Global Solutions' },
  supportEmail: { type: String, default: 'support@careerexpertglobal.com' },
  stipendBase: { type: Number, default: 16500 },
  passingScore: { type: Number, default: 70 },
  attendanceMin: { type: Number, default: 85 },
}, { timestamps: true });

export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
