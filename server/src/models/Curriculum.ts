import mongoose, { Document, Schema, Model } from 'mongoose';

// PROGRAM MODEL
export interface IProgram extends Document {
  title: string;
  slug: string;
  description: string;
  durationMonths: number;
  totalWeeks: number;
  stipendRange: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    durationMonths: { type: Number, default: 6 },
    totalWeeks: { type: Number, default: 24 },
    stipendRange: { type: String, default: '₹15,000 - ₹18,000 / month' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// TRACK MODEL
export interface ITrack extends Document {
  name: string;
  slug: string;
  description: string;
  iconName: string;
  technologies: string[];
  learningObjectives: string[];
  prerequisites: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    iconName: { type: String, default: 'Code' },
    technologies: [{ type: String }],
    learningObjectives: [{ type: String }],
    prerequisites: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// BATCH MODEL
export interface IBatch extends Document {
  name: string;
  code: string;
  program: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  capacity: number;
  students: mongoose.Types.ObjectId[];
  trainers: mongoose.Types.ObjectId[];
  mentors: mongoose.Types.ObjectId[];
  status: 'Upcoming' | 'Active' | 'Completed' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    program: { type: Schema.Types.ObjectId, ref: 'Program' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    capacity: { type: Number, default: 30 },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    trainers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    mentors: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    status: {
      type: String,
      enum: ['Upcoming', 'Active', 'Completed', 'Archived'],
      default: 'Active',
      index: true,
    },
  },
  { timestamps: true }
);

// MODULE MODEL
export interface IModule extends Document {
  title: string;
  description: string;
  track?: mongoose.Types.ObjectId; // Optional: null means shared across all tracks (e.g. Month 1 & Month 2)
  monthNumber: number; // 1 to 6
  weekNumber: number; // 1 to 24
  order: number;
  durationHours: number;
  learningOutcomes: string[];
  isLockedDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema = new Schema<IModule>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    track: { type: Schema.Types.ObjectId, ref: 'Track', default: null, index: true },
    monthNumber: { type: Number, required: true, index: true },
    weekNumber: { type: Number, required: true, index: true },
    order: { type: Number, default: 1 },
    durationHours: { type: Number, default: 10 },
    learningOutcomes: [{ type: String }],
    isLockedDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// LESSON MODEL
export type ContentType = 'video' | 'pdf' | 'presentation' | 'document' | 'text' | 'external';

export interface ILesson extends Document {
  module: mongoose.Types.ObjectId;
  title: string;
  description: string;
  contentType: ContentType;
  contentUrl?: string; // video url, pdf url, etc.
  bodyText?: string;
  durationMinutes: number;
  order: number;
  codeSnippets?: { language: string; code: string; title: string }[];
  attachments?: { title: string; url: string; fileType: string }[];
  resources?: { title: string; url: string }[];
  isFreePreview: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    module: { type: Schema.Types.ObjectId, ref: 'Module', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    contentType: {
      type: String,
      enum: ['video', 'pdf', 'presentation', 'document', 'text', 'external'],
      default: 'video',
    },
    contentUrl: { type: String, default: '' },
    bodyText: { type: String, default: '' },
    durationMinutes: { type: Number, default: 30 },
    order: { type: Number, default: 1 },
    codeSnippets: [
      {
        language: { type: String, default: 'typescript' },
        code: { type: String, default: '' },
        title: { type: String, default: '' },
      },
    ],
    attachments: [
      {
        title: { type: String },
        url: { type: String },
        fileType: { type: String },
      },
    ],
    resources: [
      {
        title: { type: String },
        url: { type: String },
      },
    ],
    isFreePreview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Program: Model<IProgram> = mongoose.models.Program || mongoose.model<IProgram>('Program', ProgramSchema);
export const Track: Model<ITrack> = mongoose.models.Track || mongoose.model<ITrack>('Track', TrackSchema);
export const Batch: Model<IBatch> = mongoose.models.Batch || mongoose.model<IBatch>('Batch', BatchSchema);
export const Module: Model<IModule> = mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);
export const Lesson: Model<ILesson> = mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema);
