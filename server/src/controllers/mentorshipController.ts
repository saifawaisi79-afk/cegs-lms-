import { Request, Response } from 'express';
import { MentorshipSession, SWOTReview, MockInterview } from '../models/Mentorship.js';
import { MentorProfile, StudentProfile } from '../models/Profiles.js';
import { AssessmentAttempt } from '../models/Assessment.js';
import { Attendance } from '../models/Attendance.js';
import { Project } from '../models/Project.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import { assertMentorOwnsStudent } from '../utils/ownership.js';

// MENTORSHIP SESSIONS
export const getSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, mentorId } = req.query;
    const query: any = {};

    if (req.user?.role === 'student') {
      query.student = req.user._id;
    } else if (req.user?.role === 'mentor') {
      query.mentor = req.user._id;
      if (studentId) {
        await assertMentorOwnsStudent(req.user, studentId as string);
        query.student = studentId;
      }
    } else {
      if (studentId) query.student = studentId;
      if (mentorId) query.mentor = mentorId;
    }

    const sessions = await MentorshipSession.find(query)
      .populate('student', 'name email avatar')
      .populate('mentor', 'name email avatar')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: sessions.length, data: sessions });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const createSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionData = { ...req.body };

    if (req.user?.role === 'student') {
      sessionData.student = req.user._id;
      if (!sessionData.mentor) {
        const studentProfile = await StudentProfile.findOne({ user: req.user._id });
        if (studentProfile?.assignedMentor) {
          sessionData.mentor = studentProfile.assignedMentor;
        }
      }
      sessionData.status = 'Scheduled';
    } else if (req.user?.role === 'mentor') {
      sessionData.mentor = req.user._id;
      if (sessionData.student) {
        await assertMentorOwnsStudent(req.user, sessionData.student);
      }
    }

    const session = await MentorshipSession.create(sessionData);
    await logAuditEvent(req, 'CREATE_MENTOR_SESSION', 'MENTORSHIP', session._id.toString(), sessionData);
    res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const updateSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.id as string;
    const existing = await MentorshipSession.findById(sessionId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mentorship session not found.' });
      return;
    }

    if (req.user?.role === 'mentor') {
      if (existing.mentor?.toString() !== req.user._id.toString()) {
        await assertMentorOwnsStudent(req.user, existing.student.toString());
      }
    } else if (req.user?.role === 'student') {
      if (existing.student?.toString() !== req.user._id.toString()) {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
    }

    const session = await MentorshipSession.findByIdAndUpdate(sessionId, req.body, { new: true });
    await logAuditEvent(req, 'UPDATE_MENTOR_SESSION', 'MENTORSHIP', sessionId, req.body);
    res.status(200).json({ success: true, data: session });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// SWOT REVIEWS
export const getSWOTReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawParam = req.params.studentId;
    const studentId = Array.isArray(rawParam) ? rawParam[0] : rawParam;
    if (req.user) {
      await assertMentorOwnsStudent(req.user, studentId);
    }

    const reviews = await SWOTReview.find({ student: studentId })
      .populate('mentor', 'name email avatar')
      .sort({ reviewedAt: 1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const saveSWOTReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, reviewStage, strengths, weaknesses, opportunities, threats, mentorAdvice, actionPlan } = req.body;

    if (req.user) {
      await assertMentorOwnsStudent(req.user, studentId);
    }

    let review = await SWOTReview.findOne({ student: studentId, reviewStage });

    if (review) {
      review.strengths = strengths || review.strengths;
      review.weaknesses = weaknesses || review.weaknesses;
      review.opportunities = opportunities || review.opportunities;
      review.threats = threats || review.threats;
      review.mentorAdvice = mentorAdvice || review.mentorAdvice;
      review.actionPlan = actionPlan || review.actionPlan;
      review.reviewedAt = new Date();
      await review.save();
    } else {
      review = await SWOTReview.create({
        student: studentId,
        mentor: req.user?._id,
        reviewStage,
        strengths,
        weaknesses,
        opportunities,
        threats,
        mentorAdvice,
        actionPlan,
      });
    }

    await logAuditEvent(req, 'SAVE_SWOT_REVIEW', 'MENTORSHIP', review._id.toString(), { reviewStage, studentId });
    res.status(200).json({ success: true, data: review });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

// MOCK INTERVIEWS
export const getMockInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user?.role === 'student') {
      query.student = req.user._id;
    } else if (req.user?.role === 'mentor') {
      query.mentor = req.user._id;
    }

    const interviews = await MockInterview.find(query)
      .populate('student', 'name email avatar')
      .populate('mentor', 'name email avatar')
      .sort({ scheduledAt: -1 });

    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMockInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === 'mentor') {
      req.body.mentor = req.user._id;
      if (req.body.student) {
        await assertMentorOwnsStudent(req.user, req.body.student);
      }
    }
    const interview = await MockInterview.create(req.body);
    await logAuditEvent(req, 'CREATE_MOCK_INTERVIEW', 'MENTORSHIP', interview._id.toString(), req.body);
    res.status(201).json({ success: true, data: interview });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const updateMockInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.id as string;
    const existing = await MockInterview.findById(interviewId);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Mock interview not found.' });
      return;
    }

    if (req.user?.role === 'mentor') {
      if (existing.mentor?.toString() !== req.user._id.toString()) {
        await assertMentorOwnsStudent(req.user, existing.student.toString());
      }
    }

    const interview = await MockInterview.findByIdAndUpdate(interviewId, req.body, { new: true });
    await logAuditEvent(req, 'UPDATE_MOCK_INTERVIEW', 'MENTORSHIP', interviewId, req.body);
    res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ success: false, message: error.message });
  }
};

export const getMentorDashboardData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const mentorId = req.user._id;

    // 1. Assigned students only - NO fallback to other students when empty!
    const assignedProfiles = await StudentProfile.find({ assignedMentor: mentorId })
      .populate('user', '-password')
      .populate('track')
      .populate('batch');

    // 2. Scheduled sessions today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaySessions = await MentorshipSession.find({
      mentor: mentorId,
      date: { $gte: startOfToday, $lte: endOfToday },
    }).populate('student', 'name email avatar');

    // 3. Pending assessments submitted by mentees needing review/feedback
    const menteeUserIds = assignedProfiles.map((p) => p.user?._id).filter(Boolean);
    const pendingAssessments = menteeUserIds.length > 0
      ? await AssessmentAttempt.countDocuments({
          student: { $in: menteeUserIds },
          feedback: { $in: ['', null] },
        })
      : 0;

    // 4. Active projects involving mentees
    const activeProjectsCount = menteeUserIds.length > 0
      ? await Project.countDocuments({
          teamMembers: { $in: menteeUserIds },
          status: { $in: ['In Progress', 'Planning'] },
        })
      : 0;

    // 5. Build candidate roster with real attendance and assessment scores
    const candidateRoster = await Promise.all(
      assignedProfiles.map(async (prof: any) => {
        const studentUserId = prof.user?._id;
        if (!studentUserId) return null;

        const [attempts, attendanceRecords] = await Promise.all([
          AssessmentAttempt.find({ student: studentUserId }).sort({ submittedAt: -1 }),
          Attendance.find({ student: studentUserId }),
        ]);

        const latestAttempt = attempts[0];
        const totalDays = attendanceRecords.length;
        const presentDays = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 1000) / 10 : 95.0;

        return {
          _id: prof._id,
          user: prof.user,
          preferredTrack: prof.track?.name || prof.preferredTrack || 'Full Stack Development',
          currentMonth: prof.currentMonth || 3,
          currentWeek: prof.currentWeek || 10,
          overallProgress: prof.overallProgress || 0,
          attendanceRate,
          latestScore: latestAttempt ? latestAttempt.percentage : 0,
          strengths: prof.strengths || [],
          skillGaps: prof.skillGaps || [],
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        assignedScholarsCount: assignedProfiles.length,
        assignedStudentsCount: assignedProfiles.length,
        todaySessionsCount: todaySessions.length,
        pendingAssessmentsCount: pendingAssessments,
        activeProjectsCount: activeProjectsCount,
        kpis: {
          assignedScholarsCount: assignedProfiles.length,
          assignedStudentsCount: assignedProfiles.length,
          todaySessionsCount: todaySessions.length,
          pendingAssessmentsCount: pendingAssessments,
          activeProjectsCount: activeProjectsCount,
        },
        candidates: candidateRoster.filter(Boolean),
        todaySessions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
