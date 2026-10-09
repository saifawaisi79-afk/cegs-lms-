import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Payment, IPayment, PaymentStatus } from '../models/Payment.js';
import { CourseFee } from '../models/CourseFee.js';
import { StudentProfile } from '../models/Profiles.js';
import { User } from '../models/User.js';
import { Batch, Track, Program } from '../models/Curriculum.js';
import { logAuditEvent } from '../utils/auditLogger.js';
import {
  calculateGST,
  determinePaymentStatus,
  generateUniquePaymentId,
  generateUniqueReceiptNumber,
  getActiveCourseFeeConfig,
  formatIndianCurrency,
} from '../services/paymentService.js';
import { generateReceiptPDF } from '../services/pdfService.js';

// ============================================================================
// STUDENT FACING CONTROLLERS
// ============================================================================

/**
 * GET /api/payments/me
 * Returns the current student's payment summary and complete payment history.
 */
export const getMyPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const studentId = req.user._id;

    // Fetch active course fee configuration
    const feeConfig = await getActiveCourseFeeConfig();

    // Fetch student's profile, batch, and track
    const studentProfile = await StudentProfile.findOne({ user: studentId })
      .populate('batch')
      .populate('track');

    // Fetch all payment records for this student
    const payments = await Payment.find({ studentId })
      .populate('trackId', 'name slug')
      .populate('batchId', 'name code')
      .sort({ paymentDate: -1, createdAt: -1 });

    // Aggregate paid amounts
    const validPayments = payments.filter((p) => p.status !== 'Cancelled' && p.status !== 'Refunded');
    const totalPaid = validPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalCourseFee = feeConfig.totalFee;
    const baseCourseFee = feeConfig.baseFee;
    const gstRate = feeConfig.gstRate;
    const gstAmount = feeConfig.gstAmount;
    const balanceDue = Math.max(0, totalCourseFee - totalPaid);

    let paymentStatus: 'Paid' | 'Partially Paid' | 'Pending' = 'Pending';
    if (totalPaid >= totalCourseFee && totalCourseFee > 0) {
      paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    const batch = studentProfile?.batch as any;
    const track = studentProfile?.track as any;

    const summary = {
      totalCourseFee,
      baseCourseFee,
      gstRate,
      gstAmount,
      totalPaid,
      balanceDue,
      paymentStatus,
      programTitle: feeConfig.programTitle || '6-Month Job-Ready Training Program',
      trackName: track?.name || studentProfile?.preferredTrack || 'Full Stack Development',
      studentName: req.user.name,
      studentEmail: req.user.email,
      rollNumber: studentProfile?.rollNumber || 'CEGS-2025-0182',
      batchCode: batch?.code || 'CEGS-FGT-OCT15',
      enrollmentDate: studentProfile?.createdAt || req.user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        payments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment details' });
  }
};

/**
 * GET /api/payments/:id
 * Retrieve a single payment record with security verification.
 */
export const getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id)
      .populate('studentId', 'name email avatar')
      .populate('trackId', 'name')
      .populate('batchId', 'name code');

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    // Security: Student cannot view another student's payment
    if (req.user?.role === 'student') {
      const paymentStudentId = (payment.studentId as any)._id
        ? (payment.studentId as any)._id.toString()
        : payment.studentId.toString();

      if (paymentStudentId !== req.user._id.toString()) {
        res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view this payment record.',
        });
        return;
      }
    }

    res.status(200).json({ success: true, data: payment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch payment' });
  }
};

/**
 * Helper to build receipt populated object
 */
const buildReceiptData = async (payment: IPayment) => {
  const studentUser = await User.findById(payment.studentId);
  const profile = await StudentProfile.findOne({ user: payment.studentId })
    .populate('batch')
    .populate('track');

  const batch = profile?.batch as any;
  const track = profile?.track as any;

  return {
    payment,
    student: {
      name: studentUser?.name || 'Candidate',
      email: studentUser?.email || '',
      phone: profile?.phone || '+91 98765 43210',
      rollNumber: profile?.rollNumber || 'CEGS-2025-0182',
      batchCode: batch?.code || 'CEGS-FGT-OCT15',
      trackName: track?.name || profile?.preferredTrack || 'Full Stack Development',
      programTitle: '6-Month Job-Ready Training Program',
    },
    verificationUrl: `http://localhost:5173/verify-receipt/${payment.receiptNumber}`,
  };
};

/**
 * GET /api/payments/:id/receipt
 * Retrieve formatted receipt data for View Receipt modal/page.
 */
export const getPaymentReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    // Security check
    if (req.user?.role === 'student' && payment.studentId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized access to receipt.' });
      return;
    }

    const receiptData = await buildReceiptData(payment);
    res.status(200).json({ success: true, data: receiptData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch receipt' });
  }
};

/**
 * GET /api/payments/:id/pdf
 * Stream generated vector PDF receipt.
 */
export const downloadPaymentPDF = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    // Security check
    if (req.user?.role === 'student' && payment.studentId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized access to receipt PDF.' });
      return;
    }

    const receiptData = await buildReceiptData(payment);
    generateReceiptPDF(receiptData, res);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to generate PDF' });
  }
};

/**
 * GET /api/receipts/:receiptNumber
 * Fetch receipt by receipt number (e.g., CEGS-REC-2026-000001).
 */
export const getReceiptByNumber = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { receiptNumber } = req.params;
    const payment = await Payment.findOne({ receiptNumber });

    if (!payment) {
      res.status(404).json({ success: false, message: 'Receipt not found' });
      return;
    }

    if (req.user?.role === 'student' && payment.studentId.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized access.' });
      return;
    }

    const receiptData = await buildReceiptData(payment);
    res.status(200).json({ success: true, data: receiptData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get receipt' });
  }
};

/**
 * GET /api/receipts/:receiptNumber/verify
 * Public verification endpoint (No sensitive PII exposed).
 */
export const verifyReceiptPublic = async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiptNumber } = req.params;
    const payment = await Payment.findOne({ receiptNumber });

    if (!payment) {
      res.status(404).json({
        success: false,
        valid: false,
        message: 'Receipt not found or does not exist in CEGS LMS registry.',
      });
      return;
    }

    const studentUser = await User.findById(payment.studentId).select('name');
    const profile = await StudentProfile.findOne({ user: payment.studentId }).populate('track');
    const track = profile?.track as any;

    res.status(200).json({
      success: true,
      valid: true,
      data: {
        receiptNumber: payment.receiptNumber,
        paymentId: payment.paymentId,
        studentName: studentUser?.name || 'Verified Scholar',
        programTitle: '6-Month Job-Ready Training Program',
        trackName: track?.name || profile?.preferredTrack || 'Full Stack Development',
        paymentDate: payment.paymentDate,
        totalAmount: payment.totalAmount,
        amountPaid: payment.amountPaid,
        balanceAmount: payment.balanceAmount,
        paymentStatus: payment.status,
        paymentMethod: payment.paymentMethod,
        isVerified: true,
        issuer: 'Career Expert Global Solutions',
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Verification failed' });
  }
};

// ============================================================================
// ADMIN FACING CONTROLLERS
// ============================================================================

/**
 * GET /api/admin/payments
 * Filtered, paginated list of all student payments for Admin.
 */
export const getAllPaymentsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      status,
      trackId,
      batchId,
      studentId,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (paymentMethod && paymentMethod !== 'all') {
      query.paymentMethod = paymentMethod;
    }

    if (trackId && trackId !== 'all') {
      query.trackId = trackId;
    }

    if (batchId && batchId !== 'all') {
      query.batchId = batchId;
    }

    if (studentId) {
      query.studentId = studentId;
    }

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate as string);
      if (endDate) query.paymentDate.$lte = new Date(endDate as string);
    }

    // Search filter
    if (search) {
      const searchStr = String(search).trim();
      // Search matching users first
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: searchStr, $options: 'i' } },
          { email: { $regex: searchStr, $options: 'i' } },
        ],
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { studentId: { $in: userIds } },
        { paymentId: { $regex: searchStr, $options: 'i' } },
        { receiptNumber: { $regex: searchStr, $options: 'i' } },
        { transactionId: { $regex: searchStr, $options: 'i' } },
        { description: { $regex: searchStr, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      Payment.find(query)
        .populate('studentId', 'name email avatar')
        .populate('studentProfile', 'rollNumber phone preferredTrack')
        .populate('trackId', 'name')
        .populate('batchId', 'name code')
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Payment.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin payments' });
  }
};

/**
 * GET /api/admin/payments/summary
 * Aggregate statistics for Admin Payment Dashboard.
 */
export const getAdminPaymentSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const feeConfig = await getActiveCourseFeeConfig();
    const payments = await Payment.find();

    const activePayments = payments.filter((p) => p.status !== 'Cancelled' && p.status !== 'Refunded');

    const totalRevenueRecorded = activePayments.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
    const totalAmountPaid = activePayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const totalPending = activePayments.reduce((sum, p) => sum + (p.balanceAmount || 0), 0);
    const totalGSTRecorded = activePayments.reduce((sum, p) => sum + (p.gstAmount || 0), 0);
    const numberPayments = payments.length;

    // Count students with outstanding balance
    const studentsWithBalance = new Set();
    activePayments.forEach((p) => {
      if (p.balanceAmount > 0) {
        studentsWithBalance.add(p.studentId.toString());
      }
    });

    // Also check all enrolled students against course fee
    const allStudents = await StudentProfile.find();
    let studentsWithOutstandingBalance = 0;

    for (const student of allStudents) {
      const studentPayments = activePayments.filter(
        (p) => p.studentId.toString() === student.user.toString()
      );
      const studentPaid = studentPayments.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
      if (studentPaid < feeConfig.totalFee) {
        studentsWithOutstandingBalance++;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        totalRevenueRecorded,
        totalAmountPaid,
        totalPending,
        totalGSTRecorded,
        numberPayments,
        numberStudentsWithOutstandingBalance: Math.max(studentsWithBalance.size, studentsWithOutstandingBalance),
        courseFeeConfig: feeConfig,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to aggregate payment summary' });
  }
};

/**
 * POST /api/admin/payments
 * Create a new payment record with GST calculation and audit logging.
 */
export const createPaymentAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      studentId,
      description,
      installmentNumber,
      baseAmount,
      totalAmount: inputTotal,
      gstRate = 18,
      amountPaid,
      paymentMethod,
      transactionId,
      paymentDate,
      status,
      notes,
    } = req.body;

    if (!studentId) {
      res.status(400).json({ success: false, message: 'Student ID is required.' });
      return;
    }

    // Calculate GST precisely
    let calc;
    if (baseAmount !== undefined && baseAmount !== null && baseAmount !== '') {
      calc = calculateGST(Number(baseAmount), Number(gstRate));
    } else if (inputTotal !== undefined && inputTotal !== null) {
      const safeTotal = Number(inputTotal);
      const safeBase = Math.round((safeTotal / (1 + Number(gstRate) / 100)) * 100) / 100;
      calc = calculateGST(safeBase, Number(gstRate));
    } else {
      res.status(400).json({ success: false, message: 'Either baseAmount or totalAmount must be provided.' });
      return;
    }

    const safeAmountPaid = Number(amountPaid ?? calc.totalAmount);
    const safeBalance = Math.max(0, Math.round((calc.totalAmount - safeAmountPaid) * 100) / 100);

    const calculatedStatus = determinePaymentStatus(safeAmountPaid, calc.totalAmount, status as PaymentStatus);

    const paymentId = await generateUniquePaymentId();
    const receiptNumber = await generateUniqueReceiptNumber();

    // Look up student profile, batch, and track
    const studentProfile = await StudentProfile.findOne({ user: studentId });

    const newPayment = await Payment.create({
      paymentId,
      receiptNumber,
      studentId,
      studentProfile: studentProfile?._id,
      programId: studentProfile?.batch ? undefined : undefined,
      trackId: studentProfile?.track,
      batchId: studentProfile?.batch,
      description: description || 'Course / Training Fee',
      installmentNumber: Number(installmentNumber || 1),
      baseAmount: calc.baseAmount,
      gstRate: calc.gstRate,
      gstAmount: calc.gstAmount,
      totalAmount: calc.totalAmount,
      amountPaid: safeAmountPaid,
      balanceAmount: safeBalance,
      paymentMethod: paymentMethod || 'Online',
      transactionId: transactionId ? String(transactionId).trim() : '',
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: calculatedStatus,
      notes: notes || '',
      createdBy: req.user?._id,
    });

    // Audit Log
    await logAuditEvent(req, 'CREATE_PAYMENT', 'PAYMENTS', newPayment._id.toString(), {
      paymentId,
      receiptNumber,
      studentId,
      totalAmount: calc.totalAmount,
      amountPaid: safeAmountPaid,
      status: calculatedStatus,
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded and receipt generated successfully.',
      data: newPayment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create payment record' });
  }
};

/**
 * PUT /api/admin/payments/:id
 * Update an existing payment record with recalculation & audit logging.
 */
export const updatePaymentAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    const {
      description,
      installmentNumber,
      baseAmount,
      gstRate,
      amountPaid,
      paymentMethod,
      transactionId,
      paymentDate,
      status,
      notes,
    } = req.body;

    if (description !== undefined) payment.description = description;
    if (installmentNumber !== undefined) payment.installmentNumber = Number(installmentNumber);
    if (paymentMethod !== undefined) payment.paymentMethod = paymentMethod;
    if (transactionId !== undefined) payment.transactionId = transactionId;
    if (paymentDate !== undefined) payment.paymentDate = new Date(paymentDate);
    if (notes !== undefined) payment.notes = notes;

    // Recalculate financial breakdown if amounts or rate changed
    if (baseAmount !== undefined || gstRate !== undefined) {
      const calc = calculateGST(
        baseAmount !== undefined ? Number(baseAmount) : payment.baseAmount,
        gstRate !== undefined ? Number(gstRate) : payment.gstRate
      );
      payment.baseAmount = calc.baseAmount;
      payment.gstRate = calc.gstRate;
      payment.gstAmount = calc.gstAmount;
      payment.totalAmount = calc.totalAmount;
    }

    if (amountPaid !== undefined) {
      payment.amountPaid = Number(amountPaid);
    }

    payment.balanceAmount = Math.max(0, Math.round((payment.totalAmount - payment.amountPaid) * 100) / 100);

    payment.status = determinePaymentStatus(payment.amountPaid, payment.totalAmount, status as PaymentStatus);

    await payment.save();

    // Audit Log
    await logAuditEvent(req, 'UPDATE_PAYMENT', 'PAYMENTS', payment._id.toString(), {
      paymentId: payment.paymentId,
      receiptNumber: payment.receiptNumber,
      updatedFields: req.body,
      newStatus: payment.status,
    });

    res.status(200).json({
      success: true,
      message: 'Payment record updated successfully.',
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update payment' });
  }
};

/**
 * DELETE /api/admin/payments/:id
 * Remove a payment record and log audit trail.
 */
export const deletePaymentAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id);

    if (!payment) {
      res.status(404).json({ success: false, message: 'Payment record not found' });
      return;
    }

    await Payment.findByIdAndDelete(id);

    // Audit Log
    await logAuditEvent(req, 'DELETE_PAYMENT', 'PAYMENTS', String(id), {
      paymentId: payment.paymentId,
      receiptNumber: payment.receiptNumber,
      studentId: payment.studentId,
      totalAmount: payment.totalAmount,
    });

    res.status(200).json({ success: true, message: 'Payment record deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete payment' });
  }
};

/**
 * GET /api/admin/course-fees
 * Get program fee configuration.
 */
export const getCourseFeeConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getActiveCourseFeeConfig();
    res.status(200).json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch fee configuration' });
  }
};

/**
 * PUT /api/admin/course-fees
 * Update base course fee & GST configuration.
 */
export const updateCourseFeeConfig = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { baseFee, gstRate = 18, programTitle, description } = req.body;

    if (baseFee === undefined || isNaN(Number(baseFee))) {
      res.status(400).json({ success: false, message: 'Valid base fee is required.' });
      return;
    }

    const calc = calculateGST(Number(baseFee), Number(gstRate));

    let fee = await CourseFee.findOne({ isActive: true });
    if (!fee) {
      fee = new CourseFee();
    }

    fee.baseFee = calc.baseAmount;
    fee.gstRate = calc.gstRate;
    fee.gstAmount = calc.gstAmount;
    fee.totalFee = calc.totalAmount;
    if (programTitle) fee.programTitle = programTitle;
    if (description) fee.description = description;
    fee.isActive = true;

    await fee.save();

    await logAuditEvent(req, 'UPDATE_COURSE_FEE', 'PAYMENTS', fee._id.toString(), {
      baseFee: calc.baseAmount,
      gstRate: calc.gstRate,
      gstAmount: calc.gstAmount,
      totalFee: calc.totalAmount,
    });

    res.status(200).json({
      success: true,
      message: 'Course fee structure updated successfully.',
      data: fee,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update fee configuration' });
  }
};

/**
 * GET /api/admin/students/:studentId/payments
 * Payments tab inside Student Profile in Admin view (Section 18).
 */
export const getStudentPaymentsAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params;

    const studentUser = await User.findById(studentId);
    if (!studentUser) {
      res.status(404).json({ success: false, message: 'Student user not found' });
      return;
    }

    const feeConfig = await getActiveCourseFeeConfig();
    const payments = await Payment.find({ studentId })
      .populate('trackId', 'name')
      .populate('batchId', 'name code')
      .sort({ paymentDate: -1 });

    const validPayments = payments.filter((p) => p.status !== 'Cancelled' && p.status !== 'Refunded');
    const totalPaid = validPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const balance = Math.max(0, feeConfig.totalFee - totalPaid);

    let paymentStatus: PaymentStatus = 'Pending';
    if (totalPaid >= feeConfig.totalFee && feeConfig.totalFee > 0) {
      paymentStatus = 'Paid';
    } else if (totalPaid > 0) {
      paymentStatus = 'Partially Paid';
    }

    res.status(200).json({
      success: true,
      data: {
        courseFee: feeConfig.baseFee,
        gst: feeConfig.gstAmount,
        gstRate: feeConfig.gstRate,
        totalPayable: feeConfig.totalFee,
        totalPaid,
        balance,
        paymentStatus,
        payments,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch student payments' });
  }
};
