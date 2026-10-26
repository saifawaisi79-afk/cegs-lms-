import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IRefreshToken extends Document {
  _id: mongoose.Types.ObjectId;
  jti: string;
  user: mongoose.Types.ObjectId;
  familyId: string;
  expiresAt: Date;
  revokedAt?: Date;
  replacedBy?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    jti: { type: String, required: true, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    familyId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedBy: { type: String },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

// TTL index to automatically prune expired refresh tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<IRefreshToken> =
  mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
