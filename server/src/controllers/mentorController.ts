import { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { MentorProfile, StudentProfile } from '../models/Profiles.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateNextId } from '../services/idService.js';
import { generateTemporaryPassword } from '../services/passwordService.js';
import { logAuditEvent } from '../utils/auditLogger.js';

/**
 * Helper to resolve mentor by MongoDB ObjectId or MNTR ID
 */
async function findMentorByIdentifier(id: string) {
  const query: any[] = [];
  if (mongoose.Types.ObjectId.isValid(id)) {
    query.push({ _id: id });
  }
  query.push({ userId: id.toUpperCase().trim() });
  return User.findOne({ $or: query, role: 'mentor' });
}

export const createMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, phone, specialization, designation, experienceYears, bio } = req.body;

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const temporaryPassword = generateTemporaryPassword();
    const userId = await generateNextId('MNTR');

    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: temporaryPassword,
        role: 'mentor',
        userId,
        mustChangePassword: true,
        isFirstLogin: true,
        createdBy: req.user?._id,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(409).json({ success: false, message: 'A user with this email or ID already exists.' });
        return;
      }
      throw err;
    }

    const mentorProfile = await MentorProfile.create({
      user: user._id,
      specialization: specialization || [],
      designation: designation || 'Senior Technical Lead & Career Mentor',
      experienceYears: experienceYears ?? 5,
      bio: bio || '',
      assignedStudents: [],
    });

    await logAuditEvent(req, 'CREATE_MENTOR', 'MENTORS', user._id.toString(), {
      userId: user.userId,
      email: user.email,
      name: user.name,
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        user: {
          id: user._id,
          _id: user._id,
          userId: user.userId,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        profile: mentorProfile,
      },
      credentials: {
        userId: user.userId,
        email: user.email,
        temporaryPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMentors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, status = 'active', page = '1', limit = '50' } = req.query;

    const query: any = { role: 'mentor' };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'removed') {
      query.isActive = false;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { userId: { $regex: s, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [total, mentors] = await Promise.all([
      User.countDocuments(query),
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ]);

    const mentorIds = mentors.map((m) => m._id);
    const profiles = await MentorProfile.find({ user: { $in: mentorIds } });
    const profileMap = new Map(profiles.map((p) => [p.user.toString(), p]));

    // Compute student counts dynamically from StudentProfile
    const studentCountAgg = await StudentProfile.aggregate([
      { $match: { assignedMentor: { $in: mentorIds } } },
      { $group: { _id: '$assignedMentor', count: { $sum: 1 } } },
    ]);
    const studentCountMap = new Map(studentCountAgg.map((a) => [a._id.toString(), a.count]));

    const data = mentors.map((m) => {
      const prof = profileMap.get(m._id.toString());
      return {
        id: m._id,
        _id: m._id,
        userId: m.userId,
        name: m.name,
        email: m.email,
        role: m.role,
        isActive: m.isActive,
        lastLogin: m.lastLogin,
        removedAt: m.removedAt,
        createdAt: m.createdAt,
        studentCount: studentCountMap.get(m._id.toString()) || 0,
        profile: prof
          ? {
              designation: prof.designation,
              specialization: prof.specialization,
              experienceYears: prof.experienceYears,
              bio: prof.bio,
              officeHours: prof.officeHours,
              meetingLink: prof.meetingLink,
            }
          : undefined,
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      count: data.length,
      data: {
        mentors: data,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      mentors: data,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMentorById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const mentor = await findMentorByIdentifier(id);

    if (!mentor) {
      res.status(404).json({ success: false, message: 'Mentor not found.' });
      return;
    }

    const profile = await MentorProfile.findOne({ user: mentor._id });
    const studentCount = await StudentProfile.countDocuments({ assignedMentor: mentor._id });

    res.status(200).json({
      success: true,
      data: {
        id: mentor._id,
        _id: mentor._id,
        userId: mentor.userId,
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        isActive: mentor.isActive,
        lastLogin: mentor.lastLogin,
        removedAt: mentor.removedAt,
        createdAt: mentor.createdAt,
        studentCount,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const mentor = await findMentorByIdentifier(id);

    if (!mentor) {
      res.status(404).json({ success: false, message: 'Mentor not found.' });
      return;
    }

    const { name, phone, specialization, designation, experienceYears, bio, officeHours, meetingLink } = req.body;

    if (name) {
      mentor.name = name.trim();
      await mentor.save();
    }

    let profile = await MentorProfile.findOne({ user: mentor._id });
    if (!profile) {
      profile = new MentorProfile({ user: mentor._id });
    }

    if (specialization !== undefined) profile.specialization = specialization;
    if (designation !== undefined) profile.designation = designation;
    if (experienceYears !== undefined) profile.experienceYears = experienceYears;
    if (bio !== undefined) profile.bio = bio;
    if (officeHours !== undefined) profile.officeHours = officeHours;
    if (meetingLink !== undefined) profile.meetingLink = meetingLink;

    await profile.save();

    await logAuditEvent(req, 'UPDATE_MENTOR', 'MENTORS', mentor._id.toString(), {
      userId: mentor.userId,
      changes: req.body,
    });

    res.status(200).json({
      success: true,
      message: 'Mentor updated successfully.',
      data: {
        id: mentor._id,
        userId: mentor.userId,
        name: mentor.name,
        email: mentor.email,
        profile,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const mentor = await findMentorByIdentifier(id);

    if (!mentor) {
      res.status(404).json({ success: false, message: 'Mentor not found.' });
      return;
    }

    if (mentor._id.toString() === req.user?._id.toString()) {
      res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
      return;
    }

    const studentCount = await StudentProfile.countDocuments({ assignedMentor: mentor._id });
    const { reassignTo } = req.body || {};

    if (studentCount > 0) {
      if (!reassignTo) {
        res.status(409).json({
          success: false,
          code: 'MENTOR_HAS_STUDENTS',
          count: studentCount,
          message: `Mentor has ${studentCount} assigned student(s). Please provide a replacement mentor (reassignTo).`,
        });
        return;
      }

      const targetMentor = await findMentorByIdentifier(reassignTo);
      if (!targetMentor || !targetMentor.isActive) {
        res.status(400).json({
          success: false,
          message: 'The replacement mentor is not found or is currently inactive.',
        });
        return;
      }

      if (targetMentor._id.toString() === mentor._id.toString()) {
        res.status(400).json({
          success: false,
          message: 'Cannot reassign students to the mentor being deactivated.',
        });
        return;
      }

      // Reassign all students
      await StudentProfile.updateMany(
        { assignedMentor: mentor._id },
        { assignedMentor: targetMentor._id }
      );
    }

    // Soft remove
    mentor.isActive = false;
    mentor.removedAt = new Date();
    mentor.removedBy = req.user?._id;
    mentor.tokenVersion = (mentor.tokenVersion || 0) + 1;
    await mentor.save();

    // Revoke all sessions immediately
    await RefreshToken.updateMany({ user: mentor._id }, { revokedAt: new Date() });

    await logAuditEvent(req, 'REMOVE_MENTOR', 'MENTORS', mentor._id.toString(), {
      userId: mentor.userId,
      email: mentor.email,
      reassignedStudentCount: studentCount,
      reassignTo,
    });

    res.status(200).json({
      success: true,
      message: 'Mentor deactivated successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreMentor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const mentor = await findMentorByIdentifier(id);

    if (!mentor) {
      res.status(404).json({ success: false, message: 'Mentor not found.' });
      return;
    }

    mentor.isActive = true;
    mentor.removedAt = undefined;
    mentor.removedBy = undefined;
    await mentor.save();

    await logAuditEvent(req, 'RESTORE_MENTOR', 'MENTORS', mentor._id.toString(), {
      userId: mentor.userId,
      email: mentor.email,
    });

    res.status(200).json({
      success: true,
      message: 'Mentor restored successfully.',
      data: mentor,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetMentorPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const mentor = await findMentorByIdentifier(id);

    if (!mentor) {
      res.status(404).json({ success: false, message: 'Mentor not found.' });
      return;
    }

    const temporaryPassword = generateTemporaryPassword();
    mentor.password = temporaryPassword;
    mentor.mustChangePassword = true;
    mentor.tokenVersion = (mentor.tokenVersion || 0) + 1;
    await mentor.save();

    // Revoke all active sessions
    await RefreshToken.updateMany({ user: mentor._id }, { revokedAt: new Date() });

    await logAuditEvent(req, 'RESET_MENTOR_PASSWORD', 'MENTORS', mentor._id.toString(), {
      userId: mentor.userId,
      email: mentor.email,
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      message: 'Temporary password generated successfully.',
      credentials: {
        userId: mentor.userId,
        email: mentor.email,
        temporaryPassword,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
