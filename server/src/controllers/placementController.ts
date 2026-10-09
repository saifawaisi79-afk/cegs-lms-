import { Request, Response } from 'express';
import { Company, JobOpportunity, Interview, Offer } from '../models/Placement.js';
import { StudentProfile } from '../models/Profiles.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

// COMPANIES
export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = await Company.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: companies.length, data: companies });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const company = await Company.create(req.body);
    await logAuditEvent(req, 'CREATE_COMPANY', 'PLACEMENT', company._id.toString(), req.body);
    res.status(201).json({ success: true, data: company });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// JOB OPPORTUNITIES
export const getJobOpportunities = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await JobOpportunity.find().populate('company').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createJobOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const job = await JobOpportunity.create(req.body);
    await logAuditEvent(req, 'CREATE_JOB_OPPORTUNITY', 'PLACEMENT', job._id.toString(), req.body);
    res.status(201).json({ success: true, data: job });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// INTERVIEWS
export const getInterviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user?.role === 'student') {
      query.candidate = req.user._id;
    }

    const interviews = await Interview.find(query)
      .populate('candidate', 'name email avatar')
      .populate('jobOpportunity')
      .sort({ scheduledAt: -1 });

    res.status(200).json({ success: true, count: interviews.length, data: interviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await Interview.create(req.body);
    await logAuditEvent(req, 'SCHEDULE_INTERVIEW', 'PLACEMENT', interview._id.toString(), req.body);
    res.status(201).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviewId = req.params.id as string;
    const interview = await Interview.findByIdAndUpdate(interviewId, req.body, { new: true });
    await logAuditEvent(req, 'UPDATE_INTERVIEW', 'PLACEMENT', interviewId, req.body);
    res.status(200).json({ success: true, data: interview });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// OFFERS
export const getOffers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user?.role === 'student') {
      query.student = req.user._id;
    }

    const offers = await Offer.find(query)
      .populate('student', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const offer = await Offer.create(req.body);
    await logAuditEvent(req, 'CREATE_OFFER', 'PLACEMENT', offer._id.toString(), req.body);
    res.status(201).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOffer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const offerId = req.params.id as string;
    const offer = await Offer.findByIdAndUpdate(offerId, req.body, { new: true });

    if (req.body.status === 'Accepted') {
      await StudentProfile.findOneAndUpdate(
        { user: offer?.student },
        { placementStatus: 'Placed' }
      );
    }

    await logAuditEvent(req, 'UPDATE_OFFER', 'PLACEMENT', offerId, req.body);
    res.status(200).json({ success: true, data: offer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PLACEMENT ANALYTICS & FUNNEL
export const getPlacementStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const jobReadyCount = await StudentProfile.countDocuments({ jobReady: true });
    const interviewsScheduled = await Interview.countDocuments();
    const interviewsCompleted = await Interview.countDocuments({ status: { $in: ['Completed', 'Selected', 'Not Selected'] } });
    const offersReceived = await Offer.countDocuments();
    const candidatesPlaced = await Offer.countDocuments({ status: 'Accepted' });

    // Funnel data
    const funnel = [
      { stage: 'Enrolled Candidates', count: totalStudents, fill: '#0d9488' },
      { stage: 'Job-Ready Certified', count: jobReadyCount, fill: '#0f766e' },
      { stage: 'Interviews Scheduled', count: interviewsScheduled, fill: '#0284c7' },
      { stage: 'Completed Interviews', count: interviewsCompleted, fill: '#6366f1' },
      { stage: 'Offers Extended', count: offersReceived, fill: '#f59e0b' },
      { stage: 'Offers Accepted / Placed', count: candidatesPlaced, fill: '#10b981' },
    ];

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        jobReadyCount,
        interviewsScheduled,
        interviewsCompleted,
        offersReceived,
        candidatesPlaced,
        pendingCandidates: Math.max(0, totalStudents - candidatesPlaced),
        funnel,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
