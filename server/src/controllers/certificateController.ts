import { Request, Response } from 'express';
import { Certificate } from '../models/Certificate.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/Profiles.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user?.role === 'student') {
      query.student = req.user._id;
    }

    const certificates = await Certificate.find(query)
      .populate('student', 'name email avatar')
      .populate('issuedBy', 'name email')
      .sort({ issueDate: -1 });

    res.status(200).json({ success: true, count: certificates.length, data: certificates });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCertificateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const cert = await Certificate.findOne({
      $or: [{ _id: req.params.id }, { certificateId: req.params.id }],
    }).populate('student', 'name email avatar');

    if (!cert) {
      res.status(404).json({ success: false, message: 'Certificate not found.' });
      return;
    }
    res.status(200).json({ success: true, data: cert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const certificateId = String(req.params.certificateId || '').trim().toUpperCase();
    const cert = await Certificate.findOne({ certificateId });

    if (!cert || cert.status !== 'Issued') {
      res.status(404).json({
        success: false,
        isValid: false,
        message: 'Certificate not found or revoked. Please verify the Certificate ID.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      isValid: true,
      data: {
        certificateId: cert.certificateId,
        candidateName: cert.candidateName,
        programTitle: cert.programTitle,
        trackName: cert.trackName,
        completionDate: cert.completionDate,
        issueDate: cert.issueDate,
        grade: cert.grade,
        status: cert.status,
        skillsCertified: cert.skillsCertified,
        issuer: 'Career Expert Global Solutions',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const issueCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, candidateName, trackName, grade, skillsCertified } = req.body;

    const user = await User.findById(studentId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Candidate not found.' });
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const certificateId = `CEGS-2025-FGT-${randomNum}`;
    const verificationUrl = `/verify-certificate/${certificateId}`;

    const cert = await Certificate.create({
      certificateId,
      student: user._id,
      candidateName: candidateName || user.name,
      programTitle: '6-Month Freshers Growth Training Program',
      trackName: trackName || 'Full Stack Development',
      completionDate: new Date(),
      issueDate: new Date(),
      grade: grade || 'Distinction',
      verificationUrl,
      status: 'Issued',
      issuedBy: req.user?._id,
      skillsCertified: skillsCertified || ['React', 'Node.js', 'MongoDB', 'System Design'],
    });

    await StudentProfile.findOneAndUpdate({ user: user._id }, { jobReady: true });
    await logAuditEvent(req, 'ISSUE_CERTIFICATE', 'CERTIFICATES', cert._id.toString(), {
      certificateId,
      studentId,
    });

    res.status(201).json({ success: true, data: cert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
