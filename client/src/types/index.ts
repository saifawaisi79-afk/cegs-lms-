export type UserRole = 'student' | 'mentor' | 'admin';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isFirstLogin?: boolean;
  studentProfile?: IStudentProfile;
}

export interface IStudentProfile {
  _id: string;
  user: IUser | string;
  batch?: IBatch | string;
  track?: ITrack | string;
  assignedMentor?: IUser | string;
  rollNumber: string;
  phone: string;
  dob?: string;
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
  placementStatus: 'Not Started' | 'In Progress' | 'Interviewing' | 'Placed';
  resumeUrl?: string;
}

export interface IMentorProfile {
  _id: string;
  user: IUser | string;
  specialization: string[];
  bio: string;
  experienceYears: number;
  assignedStudents: (IUser | string)[];
  meetingLink: string;
  officeHours: string;
  designation: string;
}

export interface IProgram {
  _id: string;
  title: string;
  slug: string;
  description: string;
  durationMonths: number;
  totalWeeks: number;
  stipendRange: string;
  isActive: boolean;
}

export interface ITrack {
  _id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  technologies: string[];
  learningObjectives: string[];
  isActive: boolean;
}

export interface IBatch {
  _id: string;
  name: string;
  code: string;
  program: IProgram | string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: 'Upcoming' | 'Active' | 'Completed' | 'Archived';
}

export interface IModule {
  _id: string;
  title: string;
  description: string;
  track?: string;
  monthNumber: number;
  weekNumber: number;
  order: number;
  durationHours: number;
  learningOutcomes: string[];
  lessons?: ILesson[];
}

export interface ILesson {
  _id: string;
  module: string | IModule;
  title: string;
  description: string;
  contentType: 'video' | 'pdf' | 'presentation' | 'document' | 'text' | 'external';
  contentUrl?: string;
  bodyText?: string;
  durationMinutes: number;
  order: number;
  codeSnippets?: { language: string; code: string; title: string }[];
  attachments?: { title: string; url: string; fileType: string }[];
  resources?: { title: string; url: string }[];
}

export interface IQuestion {
  id: string;
  questionText: string;
  type: 'mcq' | 'multi-select' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: any;
  explanation?: string;
  marks: number;
}

export interface IAssessment {
  _id: string;
  title: string;
  description: string;
  track?: string;
  monthNumber: number;
  weekNumber: number;
  type: 'mcq' | 'mixed' | 'technical' | 'soft-skills';
  durationMinutes: number;
  attemptLimit: number;
  passingScore: number;
  totalMarks: number;
  instructions: string[];
  questions: IQuestion[];
  isActive: boolean;
}

export interface IAssessmentAttempt {
  _id: string;
  assessment: IAssessment | string;
  student: IUser | string;
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
  submittedAt: string;
}

export interface IAttendance {
  _id: string;
  student: IUser | string;
  batch?: IBatch | string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
  checkInTime?: string;
}

export interface IMentorshipSession {
  _id: string;
  mentor: IUser;
  student: IUser;
  date: string;
  durationMinutes: number;
  agenda: string;
  meetingLink: string;
  notes: string;
  actionItems: string[];
  feedback: string;
  followUpDate?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface ISWOTReview {
  _id: string;
  student: string;
  mentor: IUser;
  reviewStage: 'Initial SWOT' | 'Month 2 Review' | 'Month 4 Review' | 'Final Review';
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  mentorAdvice: string;
  actionPlan: string[];
  reviewedAt: string;
}

export interface IMockInterview {
  _id: string;
  student: IUser;
  mentor: IUser;
  interviewType: 'HR' | 'Technical' | 'Behavioral' | 'Communication';
  scheduledAt: string;
  durationMinutes: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  ratings: {
    communication: number;
    technical: number;
    confidence: number;
    problemSolving: number;
    professionalism: number;
    roleAwareness: number;
  };
  overallScore: number;
  feedback: string;
  recommendations: string[];
  preparationMaterials?: string[];
  interviewer?: string;
  meetingLink?: string;
  roundNumber?: number;
}

export interface ITask {
  _id: string;
  project: string;
  title: string;
  description: string;
  assignedTo?: IUser;
  status: 'TODO' | 'IN PROGRESS' | 'REVIEW' | 'COMPLETED';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sprintNumber: number;
  dueDate?: string;
}

export interface IProject {
  _id: string;
  title: string;
  description: string;
  objective: string;
  clientOrCompany?: string;
  track?: ITrack;
  teamMembers: IUser[];
  technologies: string[];
  techStack?: string[];
  repositoryUrl: string;
  documentationUrl: string;
  startDate: string;
  endDate: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  sprints: {
    sprintNumber: number;
    sprintGoal: string;
    startDate: string;
    endDate: string;
    isCompleted: boolean;
  }[];
  mentorNotes?: string;
  progressPercentage: number;
}

export interface ICompany {
  _id: string;
  name: string;
  logo: string;
  website: string;
  industry: string;
  location: string;
  description: string;
}

export interface IJobOpportunity {
  _id: string;
  company: ICompany;
  role: string;
  location: string;
  experience: string;
  skills: string[];
  salaryRange?: string;
  description: string;
  interviewProcess: string[];
  status: 'Open' | 'Closed';
}

export interface IInterview {
  _id: string;
  candidate: IUser;
  jobOpportunity?: IJobOpportunity;
  companyName: string;
  role: string;
  roundName: string;
  scheduledAt: string;
  mode: 'Online' | 'In-person';
  interviewer?: string;
  meetingLink?: string;
  status: 'Scheduled' | 'Completed' | 'Selected' | 'Not Selected' | 'Awaiting Result' | 'Rescheduled' | 'Cancelled';
  feedback?: string;
}

export interface IOffer {
  _id: string;
  student: IUser;
  companyName: string;
  role: string;
  location: string;
  compensation: string;
  joiningDate?: string;
  offerLetterUrl?: string;
  status: 'Draft' | 'Received' | 'Under Review' | 'Accepted' | 'Declined';
  remarks?: string;
}

export interface ICertificate {
  _id: string;
  certificateId: string;
  student: IUser | string;
  candidateName: string;
  programTitle: string;
  trackName: string;
  completionDate: string;
  issueDate: string;
  grade: string;
  verificationUrl: string;
  status: 'Issued' | 'Revoked';
  skillsCertified: string[];
}

export interface IStipendRecord {
  _id: string;
  student: IUser | string;
  monthNumber: number;
  monthName: string;
  expectedAmount: number;
  amountPaid: number;
  status: 'Eligible' | 'Processing' | 'Disbursed' | 'On Hold' | 'Ineligible';
  paymentReference?: string;
  paymentDate?: string;
  remarks?: string;
}

export interface INotification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: 'lesson' | 'assessment' | 'mentor' | 'project' | 'interview' | 'placement' | 'certificate' | 'stipend' | 'announcement';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ICalendarEvent {
  _id: string;
  title: string;
  description: string;
  eventType: 'Class' | 'Assessment' | 'MentorSession' | 'MockInterview' | 'CompanyInterview' | 'ProjectDeadline' | 'Announcement';
  startDate: string;
  endDate: string;
  meetingLink?: string;
  location?: string;
}

export type PaymentStatus =
  | 'Paid'
  | 'Partially Paid'
  | 'Pending'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled';

export type PaymentMethod =
  | 'Online'
  | 'Bank Transfer'
  | 'UPI'
  | 'Card'
  | 'Cash'
  | 'Other';

export interface IPaymentRecord {
  _id: string;
  paymentId: string;
  receiptNumber: string;
  studentId: IUser | any;
  studentProfile?: IStudentProfile | any;
  programId?: IProgram | any;
  trackId?: ITrack | any;
  batchId?: IBatch | any;
  description: string;
  installmentNumber?: number;
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceAmount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  paymentDate: string;
  status: PaymentStatus;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICourseFee {
  _id?: string;
  programTitle: string;
  baseFee: number;
  gstRate: number;
  gstAmount: number;
  totalFee: number;
  currency: string;
  description?: string;
  isActive: boolean;
}

export interface IPaymentSummary {
  totalCourseFee: number;
  baseCourseFee: number;
  gstRate: number;
  gstAmount: number;
  totalPaid: number;
  balanceDue: number;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Pending';
  programTitle: string;
  trackName: string;
  studentName: string;
  studentEmail: string;
  rollNumber: string;
  batchCode: string;
  enrollmentDate: string;
}

export interface IReceiptData {
  payment: IPaymentRecord;
  student: {
    name: string;
    email: string;
    phone?: string;
    rollNumber?: string;
    batchCode?: string;
    trackName?: string;
    programTitle?: string;
  };
  verificationUrl?: string;
}
