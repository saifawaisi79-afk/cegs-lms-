import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ENV } from '../config/env.js';

export type UserRole = 'student' | 'mentor' | 'admin';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  isFirstLogin: boolean;
  mustChangePassword: boolean;
  createdBy?: mongoose.Types.ObjectId;
  removedAt?: Date;
  removedBy?: mongoose.Types.ObjectId;
  failedLoginAttempts: number;
  lockUntil?: Date;
  tokenVersion: number;
  lastLogin?: Date;
  passwordChangedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'mentor', 'admin'],
      default: 'student',
      index: true,
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    isFirstLogin: { type: Boolean, default: false },
    mustChangePassword: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    removedAt: { type: Date },
    removedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    lastLogin: { type: Date },
    passwordChangedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret: any) {
        delete ret.password;
        delete ret.tokenVersion;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (this.userId) {
    this.userId = this.userId.toUpperCase().trim();
  }
  if (!this.isModified('password') || !this.password) return next();
  try {
    const rounds = Number(ENV.BCRYPT_ROUNDS) || 12;
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) {
    throw new Error('Password hash not loaded. Use .select("+password") to compare password.');
  }
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
