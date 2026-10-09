import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISettings extends Document {
  orgName: string;
  supportEmail: string;
  stipendBase: string;
  passingScore: string;
  attendanceMin: string;
}

const SettingsSchema = new Schema<ISettings>({
  orgName: { type: String, default: 'Career Expert Global Solutions' },
  supportEmail: { type: String, default: 'support@careerexpertglobal.com' },
  stipendBase: { type: String, default: '16500' },
  passingScore: { type: String, default: '70' },
  attendanceMin: { type: String, default: '85' },
}, { timestamps: true });

export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
