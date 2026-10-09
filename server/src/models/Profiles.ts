import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  track?: mongoose.Types.ObjectId;
  assignedMentor?: mongoose.Types.ObjectId;
  rollNumber: string;
  phone: string;
  dob?: Date;
  city: string;
  state: string;
  degree: string;
  college: string;
  graduationYear: number;
  academicBackground: string;
  preferredTrack: string;
  targetRole: string;
  careerGoals: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
  strengths: string[];
  skillGaps: string[];
  currentMonth: number;
  currentWeek: number;
  currentStreak: number;
  overallProgress: number;
  jobReady: boolean;
  placementStatus:
    | 'Not Started'
    | 'Training'
    | 'Interview Preparation'
    | 'In Progress'
    | 'Interview Scheduled'
    | 'Interview Completed'
    | 'Interviewing'
    | 'Awaiting Result'
    | 'Selected'
    | 'Not Selected'
    | 'Offer Received'
    | 'Offered'
    | 'Offer Accepted'
    | 'Placed';
  resumeUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    track: { type: Schema.Types.ObjectId, ref: 'Track' },
    assignedMentor: { type: Schema.Types.ObjectId, ref: 'User' },
    rollNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    dob: { type: Date },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    degree: { type: String, default: 'B.Tech / B.E' },
    college: { type: String, default: '' },
    graduationYear: { type: Number, default: 2024 },
    academicBackground: { type: String, default: 'Computer Science' },
    preferredTrack: { type: String, default: 'Full Stack Development' },
    targetRole: { type: String, default: 'Software Engineer' },
    careerGoals: { type: String, default: '' },
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 1 },
    strengths: [{ type: String }],
    skillGaps: [{ type: String }],
    currentMonth: { type: Number, default: 1 },
    currentWeek: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 1 },
    overallProgress: { type: Number, default: 0 },
    jobReady: { type: Boolean, default: false },
    placementStatus: {
      type: String,
      enum: [
        'Not Started',
        'Training',
        'Interview Preparation',
        'In Progress',
        'Interview Scheduled',
        'Interview Completed',
        'Interviewing',
        'Awaiting Result',
        'Selected',
        'Not Selected',
        'Offer Received',
        'Offered',
        'Offer Accepted',
        'Placed',
      ],
      default: 'Not Started',
    },
    resumeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export interface IMentorProfile extends Document {
  user: mongoose.Types.ObjectId;
  specialization: string[];
  bio: string;
  experienceYears: number;
  assignedStudents: mongoose.Types.ObjectId[];
  meetingLink: string;
  officeHours: string;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
}

const MentorProfileSchema = new Schema<IMentorProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    specialization: [{ type: String }],
    bio: { type: String, default: '' },
    experienceYears: { type: Number, default: 5 },
    assignedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    meetingLink: { type: String, default: 'https://meet.google.com/cegs-mentor-session' },
    officeHours: { type: String, default: 'Mon-Fri 4:00 PM - 6:00 PM' },
    designation: { type: String, default: 'Senior Technical Lead & Career Mentor' },
  },
  { timestamps: true }
);

export const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile || mongoose.model<IStudentProfile>('StudentProfile', StudentProfileSchema);

export const MentorProfile: Model<IMentorProfile> =
  mongoose.models.MentorProfile || mongoose.model<IMentorProfile>('MentorProfile', MentorProfileSchema);
