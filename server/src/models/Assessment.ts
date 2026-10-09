import mongoose, { Document, Schema, Model } from 'mongoose';

export type AssessmentQuestionType = 'mcq' | 'multi-select' | 'true-false' | 'short-answer';

export interface IQuestion {
  id: string;
  questionText: string;
  type: AssessmentQuestionType;
  options?: string[];
  correctAnswer: any; // string, number, or array for multi-select
  explanation?: string;
  marks: number;
}

export interface IAssessment extends Document {
  title: string;
  description: string;
  track?: mongoose.Types.ObjectId;
  monthNumber: number;
  weekNumber: number;
  type: 'mcq' | 'mixed' | 'technical' | 'soft-skills';
  durationMinutes: number;
  attemptLimit: number;
  passingScore: number; // e.g. 70
  totalMarks: number;
  instructions: string[];
  questions: IQuestion[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    id: { type: String, required: true },
    questionText: { type: String, required: true },
    type: {
      type: String,
      enum: ['mcq', 'multi-select', 'true-false', 'short-answer'],
      default: 'mcq',
    },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed, required: true },
    explanation: { type: String, default: '' },
    marks: { type: Number, default: 5 },
  },
  { _id: false }
);

const AssessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    track: { type: Schema.Types.ObjectId, ref: 'Track', default: null, index: true },
    monthNumber: { type: Number, required: true, index: true },
    weekNumber: { type: Number, required: true, index: true },
    type: {
      type: String,
      enum: ['mcq', 'mixed', 'technical', 'soft-skills'],
      default: 'mcq',
    },
    durationMinutes: { type: Number, default: 45 },
    attemptLimit: { type: Number, default: 3 },
    passingScore: { type: Number, default: 70 },
    totalMarks: { type: Number, default: 100 },
    instructions: [{ type: String }],
    questions: [QuestionSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export interface IAssessmentAttempt extends Document {
  assessment: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  answers: {
    questionId: string;
    submittedAnswer: any;
    isCorrect?: boolean;
    marksObtained: number;
  }[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpentSeconds: number;
  feedback?: string;
  evaluatedBy?: mongoose.Types.ObjectId;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AssessmentAttemptSchema = new Schema<IAssessmentAttempt>(
  {
    assessment: { type: Schema.Types.ObjectId, ref: 'Assessment', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    answers: [
      {
        questionId: { type: String, required: true },
        submittedAnswer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean, default: false },
        marksObtained: { type: Number, default: 0 },
      },
    ],
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeSpentSeconds: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    evaluatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Assessment: Model<IAssessment> =
  mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);

export const AssessmentAttempt: Model<IAssessmentAttempt> =
  mongoose.models.AssessmentAttempt ||
  mongoose.model<IAssessmentAttempt>('AssessmentAttempt', AssessmentAttemptSchema);
