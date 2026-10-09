import { z } from 'zod';

export const updateOfferSchema = z.object({
  status: z.enum(['Received', 'Accepted', 'Declined', 'Negotiating']).optional(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  ctc: z.number().optional(),
  offerDate: z.string().datetime().optional().or(z.date().optional()),
  student: z.string().optional(),
}).passthrough();

export const updateStudentSchema = z.object({
  phone: z.string().optional(),
  dob: z.string().datetime().optional().or(z.date().optional()),
  city: z.string().optional(),
  state: z.string().optional(),
  degree: z.string().optional(),
  college: z.string().optional(),
  graduationYear: z.number().optional(),
  preferredTrack: z.string().optional(),
  academicBackground: z.string().optional(),
  targetRole: z.string().optional(),
  careerGoals: z.string().optional(),
  strengths: z.array(z.string()).optional(),
  skillGaps: z.array(z.string()).optional(),
  name: z.string().optional(),
  track: z.string().optional(),
  batch: z.string().optional(),
  assignedMentor: z.string().optional(),
}).passthrough();

export const markAttendanceSchema = z.object({
  studentId: z.string().optional(),
  batchId: z.string().optional(),
  date: z.string().datetime().optional().or(z.date().optional()),
  status: z.enum(['Present', 'Absent', 'Late', 'Excused']).optional(),
  remarks: z.string().optional(),
  checkInTime: z.string().optional(),
}).strict();

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  assignedTo: z.string().optional(),
  project: z.string().optional(),
  sprintNumber: z.number().optional(),
}).strict();

export const createTaskSchema = z.object({
  title: z.string(),
  project: z.string(),
  assignedTo: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  status: z.enum(['TODO', 'IN PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  sprintNumber: z.number().optional(),
}).strict();

export const updateProjectSchema = z.object({
  description: z.string().optional(),
  repoUrl: z.string().optional(),
  liveUrl: z.string().optional(),
}).passthrough();

export const uploadProjectFileSchema = z.object({
  projectId: z.string(),
  name: z.string(),
  fileUrl: z.string(),
  fileType: z.string().optional(),
  sizeBytes: z.number().optional(),
}).passthrough();

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
}).passthrough();

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
}).passthrough();

export const updateSettingsSchema = z.object({
  orgName: z.string().optional(),
  supportEmail: z.string().email().optional(),
  stipendBase: z.number().optional(),
  passingScore: z.number().min(0).max(100).optional(),
  attendanceMin: z.number().min(0).max(100).optional(),
}).strict();
