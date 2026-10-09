import { Request, Response } from 'express';
import { Assessment, AssessmentAttempt } from '../models/Assessment.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getAssessments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackId, monthNumber, weekNumber } = req.query;
    const query: any = { isActive: true };

    if (trackId) {
      query.$or = [{ track: trackId }, { track: null }];
    }
    if (monthNumber) query.monthNumber = Number(monthNumber);
    if (weekNumber) query.weekNumber = Number(weekNumber);

    const assessments = await Assessment.find(query).sort({ monthNumber: 1, weekNumber: 1 });
    res.status(200).json({ success: true, count: assessments.length, data: assessments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssessmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found.' });
      return;
    }
    res.status(200).json({ success: true, data: assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessment = await Assessment.create(req.body);
    await logAuditEvent(req, 'CREATE_ASSESSMENT', 'ASSESSMENT', assessment._id.toString(), req.body);
    res.status(201).json({ success: true, data: assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const assessmentId = req.params.id;
    const { answers, timeSpentSeconds } = req.body; // array of { questionId, submittedAnswer }

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      res.status(404).json({ success: false, message: 'Assessment not found.' });
      return;
    }

    // Evaluate answers
    let totalScore = 0;
    const evaluatedAnswers = assessment.questions.map((q) => {
      const studentAns = answers?.find((a: any) => a.questionId === q.id);
      let isCorrect = false;
      let marksObtained = 0;

      if (studentAns) {
        if (q.type === 'multi-select') {
          const expected = Array.isArray(q.correctAnswer) ? q.correctAnswer.sort() : [];
          const actual = Array.isArray(studentAns.submittedAnswer) ? studentAns.submittedAnswer.sort() : [];
          isCorrect = JSON.stringify(expected) === JSON.stringify(actual);
        } else {
          isCorrect =
            String(studentAns.submittedAnswer).trim().toLowerCase() ===
            String(q.correctAnswer).trim().toLowerCase();
        }

        if (isCorrect) {
          marksObtained = q.marks;
          totalScore += q.marks;
        }
      }

      return {
        questionId: q.id,
        submittedAnswer: studentAns?.submittedAnswer,
        isCorrect,
        marksObtained,
      };
    });

    const percentage = Math.round((totalScore / (assessment.totalMarks || 100)) * 100);
    const passed = percentage >= assessment.passingScore;

    const attempt = await AssessmentAttempt.create({
      assessment: assessment._id,
      student: req.user._id,
      answers: evaluatedAnswers,
      score: totalScore,
      percentage,
      passed,
      timeSpentSeconds: timeSpentSeconds || 0,
      submittedAt: new Date(),
    });

    await logAuditEvent(req, 'SUBMIT_ASSESSMENT', 'ASSESSMENT', attempt._id.toString(), {
      assessmentId,
      score: totalScore,
      percentage,
      passed,
    });

    res.status(201).json({
      success: true,
      data: {
        attempt,
        assessmentTitle: assessment.title,
        score: totalScore,
        totalMarks: assessment.totalMarks,
        percentage,
        passed,
        passingScore: assessment.passingScore,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStudentAssessmentAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId || req.user?._id;
    if (!studentId) {
      res.status(400).json({ success: false, message: 'Student ID required.' });
      return;
    }

    const attempts = await AssessmentAttempt.find({ student: studentId })
      .populate('assessment')
      .sort({ submittedAt: 1 });

    const totalAssessments = await Assessment.countDocuments({ isActive: true });
    const completedCount = attempts.length;

    let totalScoreSum = 0;
    let highest = 0;
    let lowest = attempts.length > 0 ? 100 : 0;

    const weeklyTrend = attempts.map((att: any, idx: number) => {
      const p = att.percentage;
      totalScoreSum += p;
      if (p > highest) highest = p;
      if (p < lowest) lowest = p;

      return {
        week: `Week ${att.assessment?.weekNumber || idx + 1}`,
        score: p,
        title: att.assessment?.title || `Assessment ${idx + 1}`,
        passed: att.passed,
      };
    });

    const averageScore = completedCount > 0 ? Math.round(totalScoreSum / completedCount) : 0;

    res.status(200).json({
      success: true,
      data: {
        weeklyTrend,
        averageScore,
        highestScore: highest,
        lowestScore: lowest,
        completedAssessments: completedCount,
        pendingAssessments: Math.max(0, totalAssessments - completedCount),
        attempts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
