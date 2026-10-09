import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ILessonProgress extends Document {
  student: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  module: mongoose.Types.ObjectId;
  completed: boolean;
  completedAt?: Date;
  bookmarked: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LessonProgressSchema = new Schema<ILessonProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
    bookmarked: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

LessonProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });

export const LessonProgress: Model<ILessonProgress> =
  mongoose.models.LessonProgress || mongoose.model<ILessonProgress>('LessonProgress', LessonProgressSchema);
