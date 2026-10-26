import mongoose from 'mongoose';
import { IUser } from '../models/User.js';
import { StudentProfile, IStudentProfile } from '../models/Profiles.js';

export class AuthorizationError extends Error {
  statusCode: number;
  code?: string;
  constructor(message: string, statusCode = 403, code?: string) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Asserts that the current user (mentor or admin) owns or has authority over the student.
 * Single source of truth is StudentProfile.assignedMentor.
 * - Admin has full oversight and can touch any student.
 * - Mentor may only touch students whose assignedMentor equals user._id.
 * - Students can only touch their own record.
 */
export async function assertMentorOwnsStudent(
  user: IUser,
  studentIdOrUserId: string | mongoose.Types.ObjectId
): Promise<IStudentProfile> {
  let targetId: any = studentIdOrUserId;
  if ((targetId === 'me' || !targetId) && user) {
    targetId = user._id;
  }

  const queryCandidates: any[] = [];

  if (mongoose.Types.ObjectId.isValid(targetId)) {
    queryCandidates.push({ _id: targetId });
    queryCandidates.push({ user: targetId });
  }
  queryCandidates.push({ rollNumber: String(targetId).toUpperCase() });

  const profile = await StudentProfile.findOne({ $or: queryCandidates });

  if (!profile) {
    throw new AuthorizationError('Student profile not found', 404);
  }

  if (user.role === 'admin') {
    return profile;
  }

  if (user.role === 'mentor') {
    if (!profile.assignedMentor || profile.assignedMentor.toString() !== user._id.toString()) {
      throw new AuthorizationError('Forbidden: Not your assigned student', 403);
    }
    return profile;
  }

  if (user.role === 'student') {
    if (profile.user.toString() !== user._id.toString()) {
      throw new AuthorizationError('Forbidden: Cannot access another student', 403);
    }
    return profile;
  }

  throw new AuthorizationError('Forbidden', 403);
}

/**
 * Returns an array of student user ObjectIds assigned to this mentor.
 * If user is admin, returns undefined (meaning no scoping needed).
 */
export async function getMentorStudentUserIds(
  user: IUser
): Promise<mongoose.Types.ObjectId[] | undefined> {
  if (user.role === 'admin') {
    return undefined; // full oversight
  }
  if (user.role === 'mentor') {
    const profiles = await StudentProfile.find({ assignedMentor: user._id }).select('user');
    return profiles.map((p) => p.user as mongoose.Types.ObjectId);
  }
  return [];
}
