import mongoose, { Document, Schema, Model } from 'mongoose';

// COMPANY MODEL
export interface ICompany extends Document {
  name: string;
  logo: string;
  website: string;
  industry: string;
  location: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, unique: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: 'Information Technology' },
    location: { type: String, default: 'Bengaluru / Hyderabad / Remote' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// JOB OPPORTUNITY MODEL
export interface IJobOpportunity extends Document {
  company: mongoose.Types.ObjectId;
  role: string;
  location: string;
  experience: string;
  skills: string[];
  salaryRange?: string;
  description: string;
  interviewProcess: string[];
  status: 'Open' | 'Closed' | 'Interviewing';
  createdAt: Date;
  updatedAt: Date;
}

const JobOpportunitySchema = new Schema<IJobOpportunity>(
  {
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    role: { type: String, required: true },
    location: { type: String, default: 'Hybrid / On-site' },
    experience: { type: String, default: 'Freshers / 0-1 Years' },
    skills: [{ type: String }],
    salaryRange: { type: String, default: '₹4.5 - 7.5 LPA' },
    description: { type: String, default: '' },
    interviewProcess: [{ type: String }],
    status: {
      type: String,
      enum: ['Open', 'Closed', 'Interviewing'],
      default: 'Open',
    },
  },
  { timestamps: true }
);

// INTERVIEW MODEL
export type InterviewStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Selected'
  | 'Not Selected'
  | 'Awaiting Result'
  | 'Rescheduled'
  | 'Cancelled';

export interface IInterview extends Document {
  candidate: mongoose.Types.ObjectId;
  jobOpportunity?: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  roundName: string;
  scheduledAt: Date;
  mode: 'Online' | 'In-person';
  interviewer?: string;
  meetingLink?: string;
  status: InterviewStatus;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jobOpportunity: { type: Schema.Types.ObjectId, ref: 'JobOpportunity' },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    roundName: { type: String, default: 'Technical Round 1' },
    scheduledAt: { type: Date, required: true },
    mode: { type: String, enum: ['Online', 'In-person'], default: 'Online' },
    interviewer: { type: String, default: 'Technical Hiring Panel' },
    meetingLink: { type: String, default: 'https://meet.google.com/cegs-company-interview' },
    status: {
      type: String,
      enum: [
        'Scheduled',
        'Completed',
        'Selected',
        'Not Selected',
        'Awaiting Result',
        'Rescheduled',
        'Cancelled',
      ],
      default: 'Scheduled',
      index: true,
    },
    feedback: { type: String, default: '' },
  },
  { timestamps: true }
);

// OFFER MODEL
export type OfferStatus = 'Draft' | 'Received' | 'Under Review' | 'Accepted' | 'Declined';

export interface IOffer extends Document {
  student: mongoose.Types.ObjectId;
  companyName: string;
  role: string;
  location: string;
  compensation: string;
  joiningDate?: Date;
  offerLetterUrl?: string;
  status: OfferStatus;
  verifiedByAdmin: boolean;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String, default: 'Bengaluru, India' },
    compensation: { type: String, required: true }, // e.g. 6.5 LPA
    joiningDate: { type: Date },
    offerLetterUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Draft', 'Received', 'Under Review', 'Accepted', 'Declined'],
      default: 'Received',
    },
    verifiedByAdmin: { type: Boolean, default: false },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

export const JobOpportunity: Model<IJobOpportunity> =
  mongoose.models.JobOpportunity ||
  mongoose.model<IJobOpportunity>('JobOpportunity', JobOpportunitySchema);

export const Interview: Model<IInterview> =
  mongoose.models.Interview || mongoose.model<IInterview>('Interview', InterviewSchema);

export const Offer: Model<IOffer> =
  mongoose.models.Offer || mongoose.model<IOffer>('Offer', OfferSchema);
