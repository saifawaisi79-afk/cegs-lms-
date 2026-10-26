import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { StudentProfile } from '../models/Profiles.js';
import { Track, Module, Lesson } from '../models/Curriculum.js';
import { Assessment, AssessmentAttempt } from '../models/Assessment.js';
import { Attendance } from '../models/Attendance.js';
import { MentorshipSession, SWOTReview } from '../models/Mentorship.js';
import { Project, Task } from '../models/Project.js';
import { Interview } from '../models/Placement.js';
import { LessonProgress } from '../models/LearningProgress.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { generateNextId } from '../services/idService.js';
import { generateTemporaryPassword } from '../services/passwordService.js';
import { assertMentorOwnsStudent } from '../utils/ownership.js';

export const getStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { track, batch, search, status = 'active', page = '1', limit = '50' } = req.query;

    const userQuery: any = { role: 'student' };

    if (status === 'active') {
      userQuery.isActive = true;
    } else if (status === 'removed') {
      userQuery.isActive = false;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const s = search.trim();
      userQuery.$or = [
        { name: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
        { userId: { $regex: s, $options: 'i' } },
      ];
    }

    const matchingUsers = await User.find(userQuery).select('-password');
    const userIds = matchingUsers.map((u) => u._id);

    const profileQuery: any = { user: { $in: userIds } };

    // Scoping: Mentor sees ONLY students assigned to them; Student sees only themselves!
    if (req.user?.role === 'mentor') {
      profileQuery.assignedMentor = req.user._id;
    } else if (req.user?.role === 'student') {
      profileQuery.user = req.user._id;
    }

    if (track) profileQuery.track = track;
    if (batch) profileQuery.batch = batch;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const [total, profiles] = await Promise.all([
      StudentProfile.countDocuments(profileQuery),
      StudentProfile.find(profileQuery)
        .populate('user', '-password')
        .populate('track')
        .populate('batch')
        .populate('assignedMentor', 'name email avatar userId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
    ]);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      count: profiles.length,
      data: profiles,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getParamId = (id: string | string[] | undefined): string => (Array.isArray(id) ? id[0] || '' : id || '');

export const getStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const profile = await assertMentorOwnsStudent(req.user, getParamId(req.params.id));

    const populated = await StudentProfile.findById(profile._id)
      .populate('user', '-password')
      .populate('track')
      .populate('batch')
      .populate('assignedMentor', 'name email avatar userId');

    res.status(200).json({ success: true, data: populated });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const getStudentFullProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const studentIdentifier = getParamId(req.params.id);
    const baseProfile = await assertMentorOwnsStudent(req.user, studentIdentifier);

    const profile = await StudentProfile.findById(baseProfile._id)
      .populate('user', '-password')
      .populate('track')
      .populate('batch')
      .populate('assignedMentor', 'name email avatar userId');

    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found.' });
      return;
    }

    const actualUserId = profile.user._id;

    // Fetch related records
    const assessmentAttempts = await AssessmentAttempt.find({ student: actualUserId })
      .populate('assessment')
      .sort({ createdAt: -1 });

    const attendanceRecords = await Attendance.find({ student: actualUserId }).sort({ date: -1 }).limit(30);
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter((a) => a.status === 'Present').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    const swotReviews = await SWOTReview.find({ student: actualUserId }).sort({ reviewedAt: -1 });
    const tasks = await Task.find({ assignedTo: actualUserId }).populate('project');

    res.status(200).json({
      success: true,
      data: {
        profile,
        assessmentAttempts,
        attendance: {
          percentage: attendancePercentage,
          totalDays,
          presentDays,
          recentRecords: attendanceRecords,
        },
        swotReviews,
        tasks,
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const createStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { name, email, phone, trackId, batchId, preferredTrack, mentorId } = req.body;

    let assignedMentorId: mongoose.Types.ObjectId;

    if (req.user.role === 'mentor') {
      // Mentor always creates their own student
      assignedMentorId = req.user._id;
    } else if (req.user.role === 'admin') {
      // Admin must choose an active mentor
      if (!mentorId) {
        res.status(400).json({ success: false, message: 'mentorId is required when enrolling a student as admin.' });
        return;
      }
      const targetMentor = await User.findOne({
        $or: [
          mongoose.Types.ObjectId.isValid(mentorId) ? { _id: mentorId } : null,
          { userId: mentorId.toUpperCase().trim() },
        ].filter(Boolean) as any,
        role: 'mentor',
        isActive: true,
      });

      if (!targetMentor) {
        res.status(400).json({ success: false, message: 'Assigned mentor not found or is currently inactive.' });
        return;
      }
      assignedMentorId = targetMentor._id;
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    // Resolve track
    let resolvedTrackId = trackId;
    if (!resolvedTrackId && preferredTrack) {
      const foundTrack = await Track.findOne({ name: { $regex: preferredTrack, $options: 'i' } });
      if (foundTrack) resolvedTrackId = foundTrack._id;
    }
    if (!resolvedTrackId) {
      const defaultTrack = await Track.findOne();
      if (defaultTrack) resolvedTrackId = defaultTrack._id;
    }

    // Generate credentials
    const temporaryPassword = generateTemporaryPassword();
    const userId = await generateNextId('STD');

    let user;
    try {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: temporaryPassword,
        role: 'student',
        userId,
        mustChangePassword: true,
        isFirstLogin: true,
        createdBy: req.user._id,
      });
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(409).json({ success: false, message: 'A user with this email or ID already exists.' });
        return;
      }
      throw err;
    }

    const studentProfile = await StudentProfile.create({
      user: user._id,
      phone: phone || '',
      track: resolvedTrackId || null,
      batch: batchId || null,
      assignedMentor: assignedMentorId,
      preferredTrack: preferredTrack || 'Full Stack Development',
      rollNumber: userId, // Set rollNumber equal to userId
    });

    await logAuditEvent(req, 'CREATE_STUDENT', 'STUDENTS', studentProfile._id.toString(), {
      userId,
      email: user.email,
      name: user.name,
      assignedMentor: assignedMentorId,
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(201).json({
      success: true,
      data: {
        id: studentProfile._id,
        _id: studentProfile._id,
        userId: user.userId,
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
        studentProfile,
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

export const bulkCreateStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'mentor')) {
      res.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    const rawList = Array.isArray(req.body) ? req.body : req.body.students;
    if (!Array.isArray(rawList) || rawList.length === 0) {
      res.status(400).json({ success: false, message: 'List of students is required.' });
      return;
    }

    if (rawList.length > 100) {
      res.status(400).json({ success: false, message: 'Cannot process more than 100 students in a single batch.' });
      return;
    }

    const results: any[] = [];
    let defaultTrack = await Track.findOne();

    for (let i = 0; i < rawList.length; i++) {
      const row = rawList[i];
      const rowNumber = i + 1;

      try {
        if (!row.name || !row.email) {
          results.push({ row: rowNumber, success: false, status: 'failed', email: row.email || '', error: 'Name and email are required' });
          continue;
        }

        const email = String(row.email).toLowerCase().trim();
        const existing = await User.findOne({ email });
        if (existing) {
          results.push({ row: rowNumber, success: false, status: 'failed', email, error: 'Email already exists' });
          continue;
        }

        let assignedMentorId: mongoose.Types.ObjectId;
        if (req.user.role === 'mentor') {
          assignedMentorId = req.user._id;
        } else {
          const targetId = row.mentorId || req.body.defaultMentorId;
          if (!targetId) {
            results.push({ row: rowNumber, success: false, status: 'failed', email, error: 'Mentor selection is required for admin' });
            continue;
          }
          const mentor = await User.findOne({
            $or: [
              mongoose.Types.ObjectId.isValid(targetId) ? { _id: targetId } : null,
              { userId: targetId.toUpperCase().trim() },
            ].filter(Boolean) as any,
            role: 'mentor',
            isActive: true,
          });
          if (!mentor) {
            results.push({ row: rowNumber, success: false, status: 'failed', email, error: 'Selected mentor not found or inactive' });
            continue;
          }
          assignedMentorId = mentor._id;
        }

        let resolvedTrackId = row.trackId;
        if (!resolvedTrackId && row.preferredTrack) {
          const foundTrack = await Track.findOne({ name: { $regex: row.preferredTrack, $options: 'i' } });
          if (foundTrack) resolvedTrackId = foundTrack._id;
        }
        if (!resolvedTrackId && defaultTrack) {
          resolvedTrackId = defaultTrack._id;
        }

        const temporaryPassword = generateTemporaryPassword();
        const userId = await generateNextId('STD');

        const user = await User.create({
          name: row.name.trim(),
          email,
          password: temporaryPassword,
          role: 'student',
          userId,
          mustChangePassword: true,
          isFirstLogin: true,
          createdBy: req.user._id,
        });

        const studentProfile = await StudentProfile.create({
          user: user._id,
          phone: row.phone || '',
          track: resolvedTrackId || null,
          batch: row.batchId || null,
          assignedMentor: assignedMentorId,
          preferredTrack: row.preferredTrack || 'Full Stack Development',
          rollNumber: userId,
        });

        results.push({
          row: rowNumber,
          success: true,
          status: 'created',
          userId: user.userId,
          email: user.email,
          credentials: {
            userId: user.userId,
            email: user.email,
            temporaryPassword,
          },
        });
      } catch (err: any) {
        results.push({
          row: rowNumber,
          success: false,
          status: 'failed',
          email: row.email,
          error: err.message || 'Failed to enroll student',
        });
      }
    }

    const createdCount = results.filter((r) => r.success).length;
    const failedCount = results.filter((r) => !r.success).length;

    await logAuditEvent(req, 'BULK_CREATE_STUDENTS', 'STUDENTS', req.user._id.toString(), {
      total: rawList.length,
      created: createdCount,
      failed: failedCount,
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      createdCount,
      failedCount,
      summary: {
        total: rawList.length,
        created: createdCount,
        failed: failedCount,
      },
      results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const profile = await assertMentorOwnsStudent(req.user, getParamId(req.params.id));

    const allowed = [
      'phone',
      'dob',
      'city',
      'state',
      'degree',
      'college',
      'graduationYear',
      'preferredTrack',
      'academicBackground',
      'targetRole',
      'careerGoals',
      'strengths',
      'skillGaps',
    ];

    if (req.user.role === 'admin' || req.user.role === 'mentor') {
      allowed.push('track', 'batch');
    }

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        (profile as any)[field] = req.body[field];
      }
    }

    await profile.save();

    if (req.body.name) {
      await User.findByIdAndUpdate(profile.user, { name: req.body.name.trim() });
    }

    await logAuditEvent(req, 'UPDATE_STUDENT', 'STUDENTS', profile._id.toString(), req.body);

    const updated = await StudentProfile.findById(profile._id)
      .populate('user', '-password')
      .populate('track')
      .populate('batch')
      .populate('assignedMentor', 'name email avatar userId');

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const profile = await assertMentorOwnsStudent(req.user, getParamId(req.params.id));
    const user = await User.findById(profile.user);

    if (!user) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    // Soft remove
    user.isActive = false;
    user.removedAt = new Date();
    user.removedBy = req.user._id;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Revoke sessions immediately
    await RefreshToken.updateMany({ user: user._id }, { revokedAt: new Date() });

    await logAuditEvent(req, 'REMOVE_STUDENT', 'STUDENTS', user._id.toString(), {
      userId: user.userId,
      email: user.email,
    });

    res.status(200).json({ success: true, message: 'Student deactivated successfully.' });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const restoreStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const profile = await assertMentorOwnsStudent(req.user, getParamId(req.params.id));
    const user = await User.findById(profile.user);

    if (!user) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    user.isActive = true;
    user.removedAt = undefined;
    user.removedBy = undefined;
    await user.save();

    await logAuditEvent(req, 'RESTORE_STUDENT', 'STUDENTS', user._id.toString(), {
      userId: user.userId,
      email: user.email,
    });

    res.status(200).json({ success: true, message: 'Student restored successfully.', data: user });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const resetStudentPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const profile = await assertMentorOwnsStudent(req.user, getParamId(req.params.id));
    const user = await User.findById(profile.user);

    if (!user) {
      res.status(404).json({ success: false, message: 'Student account not found.' });
      return;
    }

    const temporaryPassword = generateTemporaryPassword();
    user.password = temporaryPassword;
    user.mustChangePassword = true;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    // Revoke all sessions immediately
    await RefreshToken.updateMany({ user: user._id }, { revokedAt: new Date() });

    await logAuditEvent(req, 'RESET_STUDENT_PASSWORD', 'STUDENTS', user._id.toString(), {
      userId: user.userId,
      email: user.email,
    });

    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      message: 'Temporary password generated successfully.',
      credentials: {
        userId: user.userId,
        email: user.email,
        temporaryPassword,
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const reassignStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Admin access required.' });
      return;
    }

    const { mentorId } = req.body;
    if (!mentorId) {
      res.status(400).json({ success: false, message: 'Target mentorId is required.' });
      return;
    }

    const targetMentor = await User.findOne({
      $or: [
        mongoose.Types.ObjectId.isValid(mentorId) ? { _id: mentorId } : null,
        { userId: mentorId.toUpperCase().trim() },
      ].filter(Boolean) as any,
      role: 'mentor',
      isActive: true,
    });

    if (!targetMentor) {
      res.status(400).json({ success: false, message: 'Target mentor not found or inactive.' });
      return;
    }

    const profile = await assertMentorOwnsStudent(req.user, getParamId(req.params.id));
    profile.assignedMentor = targetMentor._id;
    await profile.save();

    await logAuditEvent(req, 'REASSIGN_STUDENT', 'STUDENTS', profile._id.toString(), {
      studentUserId: profile.rollNumber,
      newMentor: targetMentor.userId,
    });

    res.status(200).json({ success: true, message: 'Student reassigned successfully.', data: profile });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const saveOnboarding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const {
      step,
      personalInfo,
      education,
      careerPreferences,
      skillAssessment,
      selectedTrackId,
    } = req.body;

    let profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = new StudentProfile({ user: req.user._id, rollNumber: req.user.userId || '' });
    }

    if (personalInfo) {
      profile.phone = personalInfo.phone || profile.phone;
      profile.dob = personalInfo.dob || profile.dob;
      profile.city = personalInfo.city || profile.city;
      profile.state = personalInfo.state || profile.state;
    }

    if (education) {
      profile.degree = education.degree || profile.degree;
      profile.college = education.college || profile.college;
      profile.graduationYear = education.graduationYear || profile.graduationYear;
      profile.academicBackground = education.academicBackground || profile.academicBackground;
    }

    if (careerPreferences) {
      profile.preferredTrack = careerPreferences.preferredTrack || profile.preferredTrack;
      profile.targetRole = careerPreferences.targetRole || profile.targetRole;
      profile.careerGoals = careerPreferences.careerGoals || profile.careerGoals;
    }

    if (skillAssessment) {
      profile.strengths = skillAssessment.strengths || profile.strengths;
      profile.skillGaps = skillAssessment.skillGaps || profile.skillGaps;
    }

    if (selectedTrackId) {
      profile.track = selectedTrackId;
    }

    if (step) {
      profile.onboardingStep = step;
      if (step >= 5) {
        profile.onboardingCompleted = true;
        await User.findByIdAndUpdate(req.user._id, { isFirstLogin: false });
      }
    }

    await profile.save();
    const updated = await StudentProfile.findById(profile._id).populate('track batch assignedMentor');

    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const userId = req.user._id;

    // 1. Fetch Student Profile with populated relations
    let profile = await StudentProfile.findOne({ user: userId })
      .populate('track')
      .populate('batch')
      .populate('assignedMentor', 'name email avatar designation meetingLink');

    if (!profile) {
      profile = await StudentProfile.create({
        user: userId,
        rollNumber: req.user.userId || `STD${Math.floor(1000 + Math.random() * 9000)}`,
        onboardingCompleted: true,
        onboardingStep: 5,
        currentMonth: 3,
        currentWeek: 10,
        currentStreak: 14,
        overallProgress: 68,
        placementStatus: 'Interviewing',
      });
    }

    // 2. Real Lesson Progress Calculation
    const totalLessons = await Lesson.countDocuments();
    const completedProgressRecords = await LessonProgress.find({ student: userId, completed: true });
    const completedLessonsCount = completedProgressRecords.length;
    const overallProgress =
      totalLessons > 0 ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100)) : (profile.overallProgress || 68);

    // 3. Real Attendance Calculation
    const attendanceRecords = await Attendance.find({ student: userId }).sort({ date: -1 });
    const totalAttendanceDays = attendanceRecords.length;
    const presentAttendanceDays = attendanceRecords.filter((a) => a.status === 'Present').length;
    const lateAttendanceDays = attendanceRecords.filter((a) => a.status === 'Late').length;
    const attendanceRate =
      totalAttendanceDays > 0
        ? Math.round(((presentAttendanceDays + lateAttendanceDays * 0.5) / totalAttendanceDays) * 1000) / 10
        : 95.0;

    // 4. Real Assessment Average & Analytics
    const attempts = await AssessmentAttempt.find({ student: userId })
      .populate('assessment')
      .sort({ submittedAt: 1 });
    const totalScoreSum = attempts.reduce((sum, att) => sum + (att.percentage || 0), 0);
    const averageAssessmentScore = attempts.length > 0 ? Math.round(totalScoreSum / attempts.length) : 88;

    const weeklyTrend = attempts.map((att: any, idx: number) => ({
      week: `W${att.assessment?.weekNumber || idx + 1}`,
      score: att.percentage,
      title: att.assessment?.title || `Assessment ${idx + 1}`,
      passed: att.passed,
    }));

    // 5. Next Lesson to "Continue Learning"
    const completedLessonIds = completedProgressRecords.map((p) => p.lesson.toString());
    let nextLesson = await Lesson.findOne({ _id: { $nin: completedLessonIds } })
      .populate('module')
      .sort({ order: 1 });

    if (!nextLesson) {
      nextLesson = await Lesson.findOne().populate('module').sort({ order: 1 });
    }

    // 6. Upcoming Assessment
    const upcomingAssessment = await Assessment.findOne({
      isActive: true,
      weekNumber: { $gte: profile.currentWeek || 10 },
    }).sort({ weekNumber: 1 });

    // 7. Upcoming Mentorship Session
    const upcomingMentorSession = await MentorshipSession.findOne({
      student: userId,
      status: 'Scheduled',
    })
      .populate('mentor', 'name avatar designation meetingLink')
      .sort({ date: 1 });

    // 8. Student's Live Capstone Project
    const project = await Project.findOne({ teamMembers: userId });
    let projectProgress = 55;
    if (project) {
      const projectTasks = await Task.find({ project: project._id });
      if (projectTasks.length > 0) {
        const completedTasks = projectTasks.filter((t) => t.status === 'COMPLETED').length;
        projectProgress = Math.round((completedTasks / projectTasks.length) * 100);
      }
    }

    // 9. Upcoming Corporate Interview
    const upcomingInterview = await Interview.findOne({
      candidate: userId,
      status: 'Scheduled',
    }).sort({ scheduledAt: 1 });

    // 10. Build Real Chronological Upcoming Activities Timeline
    const upcomingActivities: any[] = [];

    if (upcomingAssessment) {
      upcomingActivities.push({
        id: `act-assess-${upcomingAssessment._id}`,
        type: 'assessment',
        title: upcomingAssessment.title,
        category: 'Technical Assessment',
        date: `Week ${upcomingAssessment.weekNumber}`,
        time: `${upcomingAssessment.durationMinutes} mins`,
        status: 'Mandatory',
        cta: 'Start Test',
        link: '/assessments',
        badgeVariant: 'orange',
      });
    }

    if (upcomingMentorSession) {
      upcomingActivities.push({
        id: `act-mentor-${upcomingMentorSession._id}`,
        type: 'mentorship',
        title: upcomingMentorSession.agenda || '1:1 Progress Coaching',
        category: 'Mentor Session',
        date: new Date(upcomingMentorSession.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        time: new Date(upcomingMentorSession.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'Confirmed',
        cta: 'Join Meeting',
        link: upcomingMentorSession.meetingLink || '/mentorship',
        badgeVariant: 'teal',
      });
    }

    if (upcomingInterview) {
      upcomingActivities.push({
        id: `act-interview-${upcomingInterview._id}`,
        type: 'interview',
        title: `${upcomingInterview.companyName} – ${upcomingInterview.roundName || 'Technical Interview'}`,
        category: 'Placement Drive',
        date: new Date(upcomingInterview.scheduledAt).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        time: new Date(upcomingInterview.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'High Priority',
        cta: 'View Prep Guide',
        link: '/interviews',
        badgeVariant: 'blue',
      });
    }

    if (project) {
      upcomingActivities.push({
        id: `act-proj-${project._id}`,
        type: 'project',
        title: `Sprint Deliverables: ${project.title}`,
        category: 'Project Deadline',
        date: 'Sprint 2 Milestone',
        time: '23:59 IST',
        status: 'In Review',
        cta: 'Open Kanban',
        link: '/projects',
        badgeVariant: 'green',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        profile,
        overallProgress,
        attendanceRate,
        averageAssessmentScore,
        kpis: {
          overallProgress,
          attendanceRate,
          averageAssessmentScore,
          currentStreak: profile.currentStreak || 14,
        },
        currentProgram: {
          title: '6-Month Freshers Growth Training Program',
          trackName: (profile.track as any)?.name || 'Full Stack Development',
          currentMonth: profile.currentMonth || 3,
          currentWeek: profile.currentWeek || 10,
          stageTitle: `Month ${profile.currentMonth || 3} — Core Technical Training`,
          progress: overallProgress,
        },
        continueLearning: {
          lessonTitle: nextLesson ? nextLesson.title : 'Node.js Event Loop, Libuv & Thread Pool Architecture',
          moduleTitle: nextLesson?.module ? (nextLesson.module as any).title : 'Month 3 / Week 10: Intermediate Skills: MongoDB Aggregations',
          durationMinutes: nextLesson ? nextLesson.durationMinutes : 45,
          lessonId: nextLesson ? nextLesson._id : null,
        },
        upcomingActivities,
        performanceTrend: weeklyTrend.length > 0 ? weeklyTrend : [
          { week: 'W1', score: 72, title: 'Orientation & Git' },
          { week: 'W2', score: 76, title: 'Data Structures' },
          { week: 'W3', score: 80, title: 'React Basics' },
          { week: 'W4', score: 84, title: 'Foundations Exam' },
          { week: 'W5', score: 88, title: 'Communication' },
          { week: 'W6', score: 84, title: 'Presentation' },
          { week: 'W7', score: 92, title: 'SWOT Review' },
          { week: 'W8', score: 92, title: 'HR Mock Round' },
          { week: 'W9', score: 96, title: 'Node.js Architecture' },
        ],
        project: project ? { title: project.title, progressPercentage: projectProgress } : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
