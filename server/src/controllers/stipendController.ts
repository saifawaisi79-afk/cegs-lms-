import { Request, Response } from 'express';
import { StipendRecord } from '../models/Stipend.js';
import { AuthRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../utils/auditLogger.js';

export const getStipends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId, monthNumber, status } = req.query;
    const query: any = {};

    if (req.user?.role === 'student') {
      query.student = req.user._id;
    } else {
      if (studentId) query.student = studentId;
      if (monthNumber) query.monthNumber = Number(monthNumber);
      if (status) query.status = status;
    }

    const records = await StipendRecord.find(query)
      .populate('student', 'name email avatar')
      .populate('processedBy', 'name email')
      .sort({ monthNumber: 1, createdAt: -1 });

    const totalDisbursed = records
      .filter((r) => r.status === 'Disbursed')
      .reduce((sum, r) => sum + (r.amountPaid || 0), 0);

    const pendingDisbursement = records
      .filter((r) => r.status === 'Processing' || r.status === 'Eligible')
      .reduce((sum, r) => sum + (r.expectedAmount || 0), 0);

    res.status(200).json({
      success: true,
      count: records.length,
      data: {
        records,
        totalDisbursed,
        pendingDisbursement,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStipendRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const record = await StipendRecord.create({
      ...req.body,
      processedBy: req.user?._id,
    });
    await logAuditEvent(req, 'CREATE_STIPEND_RECORD', 'STIPEND', record._id.toString(), req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStipendRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const recordId = req.params.id as string;
    const updateData = { ...req.body, processedBy: req.user?._id };
    if (req.body.status === 'Disbursed' && !req.body.paymentDate) {
      updateData.paymentDate = new Date();
    }

    const record = await StipendRecord.findByIdAndUpdate(recordId, updateData, { new: true });
    await logAuditEvent(req, 'UPDATE_STIPEND_STATUS', 'STIPEND', recordId, req.body);
    res.status(200).json({ success: true, data: record });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
