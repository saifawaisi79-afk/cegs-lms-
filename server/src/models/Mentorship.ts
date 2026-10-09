import mongoose, { Document, Schema, Model } from 'mongoose';

// MENTORSHIP SESSION MODEL
export interface IMentorshipSession extends Document {
  mentor: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  date: Date;
  durationMinutes: number;
  agenda: string;
  meetingLink: string;
  notes: string;
  actionItems: string[];
  feedback: string;
  followUpDate?: Date;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const MentorshipSessionSchema = new Schema<IMentorshipSession>(
  {
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, default: 45 },
    agenda: { type: String, required: true },
    meetingLink: { type: String, default: 'https://meet.google.com/cegs-mentor-room' },
    notes: { type: String, default: '' },
    actionItems: [{ type: String }],
    feedback: { type: String, default: '' },
    followUpDate: { type: Date },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

// SWOT REVIEW MODEL
export type SWOTStage = 'Initial SWOT' | 'Month 2 Review' | 'Month 4 Review' | 'Final Review';

export interface ISWOTReview extends Document {
  student: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  reviewStage: SWOTStage;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  mentorAdvice: string;
  actionPlan: string[];
  reviewedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SWOTReviewSchema = new Schema<ISWOTReview>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reviewStage: {
      type: String,
      enum: ['Initial SWOT', 'Month 2 Review', 'Month 4 Review', 'Final Review'],
      required: true,
    },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    opportunities: [{ type: String }],
    threats: [{ type: String }],
    mentorAdvice: { type: String, default: '' },
    actionPlan: [{ type: String }],
    reviewedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// MOCK INTERVIEW MODEL
export type MockInterviewType = 'HR' | 'Technical' | 'Behavioral' | 'Communication';

export interface IMockInterviewRatings {
  communication: number; // 1-10
  technical: number; // 1-10
  confidence: number; // 1-10
  problemSolving: number; // 1-10
  professionalism: number; // 1-10
  roleAwareness: number; // 1-10
}

export interface IMockInterview extends Document {
  student: mongoose.Types.ObjectId;
  mentor: mongoose.Types.ObjectId;
  interviewType: MockInterviewType;
  scheduledAt: Date;
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  ratings: IMockInterviewRatings;
  overallScore: number; // 0-100
  feedback: string;
  recommendations: string[];
  preparationMaterials?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MockInterviewSchema = new Schema<IMockInterview>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mentor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    interviewType: {
      type: String,
      enum: ['HR', 'Technical', 'Behavioral', 'Communication'],
      default: 'Technical',
    },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled'],
      default: 'Scheduled',
    },
    ratings: {
      communication: { type: Number, default: 0 },
      technical: { type: Number, default: 0 },
      confidence: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      professionalism: { type: Number, default: 0 },
      roleAwareness: { type: Number, default: 0 },
    },
    overallScore: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    recommendations: [{ type: String }],
    preparationMaterials: [{ type: String }],
  },
  { timestamps: true }
);

export const MentorshipSession: Model<IMentorshipSession> =
  mongoose.models.MentorshipSession ||
  mongoose.model<IMentorshipSession>('MentorshipSession', MentorshipSessionSchema);

export const SWOTReview: Model<ISWOTReview> =
  mongoose.models.SWOTReview || mongoose.model<ISWOTReview>('SWOTReview', SWOTReviewSchema);

export const MockInterview: Model<IMockInterview> =
  mongoose.models.MockInterview || mongoose.model<IMockInterview>('MockInterview', MockInterviewSchema);
