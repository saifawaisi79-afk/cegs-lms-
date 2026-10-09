import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ISprint {
  sprintNumber: number;
  sprintGoal: string;
  startDate: Date;
  endDate: Date;
  blockers?: string;
  mentorComments?: string;
  isCompleted: boolean;
}

export interface IProject extends Document {
  title: string;
  description: string;
  objective: string;
  clientOrCompany?: string;
  track?: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  technologies: string[];
  repositoryUrl: string;
  documentationUrl: string;
  startDate: Date;
  endDate: Date;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  sprints: ISprint[];
  mentorNotes?: string;
  progressPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const SprintSchema = new Schema<ISprint>(
  {
    sprintNumber: { type: Number, required: true },
    sprintGoal: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    blockers: { type: String, default: '' },
    mentorComments: { type: String, default: '' },
    isCompleted: { type: Boolean, default: false },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    objective: { type: String, required: true },
    clientOrCompany: { type: String, default: 'Enterprise Capstone' },
    track: { type: Schema.Types.ObjectId, ref: 'Track' },
    teamMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    technologies: [{ type: String }],
    repositoryUrl: { type: String, default: 'https://github.com/cegs-capstone' },
    documentationUrl: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Review', 'Completed'],
      default: 'In Progress',
    },
    sprints: [SprintSchema],
    mentorNotes: { type: String, default: '' },
    progressPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type TaskStatus = 'TODO' | 'IN PROGRESS' | 'REVIEW' | 'COMPLETED';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ITask extends Document {
  project: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignedTo?: mongoose.Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  sprintNumber: number;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['TODO', 'IN PROGRESS', 'REVIEW', 'COMPLETED'],
      default: 'TODO',
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    sprintNumber: { type: Number, default: 1 },
    dueDate: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export interface IProjectFile extends Document {
  project: mongoose.Types.ObjectId;
  name: string;
  fileUrl: string;
  fileType: string;
  sizeBytes: number;
  uploadedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectFileSchema = new Schema<IProjectFile>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: 'application/pdf' },
    sizeBytes: { type: Number, default: 102400 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export const ProjectFile: Model<IProjectFile> =
  mongoose.models.ProjectFile || mongoose.model<IProjectFile>('ProjectFile', ProjectFileSchema);
