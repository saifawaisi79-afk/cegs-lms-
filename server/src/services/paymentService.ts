import { Payment, IPayment, PaymentStatus } from '../models/Payment.js';
import { CourseFee, ICourseFee } from '../models/CourseFee.js';

export interface IGstCalculation {
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

/**
 * Reusable precise GST Calculation Utility
 * Rounds accurately to avoid floating-point discrepancies.
 */
export const calculateGST = (baseAmount: number, gstRate: number = 18): IGstCalculation => {
  const safeBase = Math.round(Number(baseAmount || 0) * 100) / 100;
  const safeRate = Math.round(Number(gstRate ?? 18) * 100) / 100;
  const gstAmount = Math.round(((safeBase * safeRate) / 100) * 100) / 100;
  const totalAmount = Math.round((safeBase + gstAmount) * 100) / 100;

  return {
    baseAmount: safeBase,
    gstRate: safeRate,
    gstAmount,
    totalAmount,
  };
};

/**
 * Derive Base and GST amounts from a Total Amount that already includes GST
 */
export const calculateBaseFromTotal = (totalAmount: number, gstRate: number = 18): IGstCalculation => {
  const safeTotal = Math.round(Number(totalAmount || 0) * 100) / 100;
  const safeRate = Math.round(Number(gstRate ?? 18) * 100) / 100;
  const baseAmount = Math.round((safeTotal / (1 + safeRate / 100)) * 100) / 100;
  const gstAmount = Math.round((safeTotal - baseAmount) * 100) / 100;

  return {
    baseAmount,
    gstRate: safeRate,
    gstAmount,
    totalAmount: safeTotal,
  };
};

/**
 * Format number into Indian Rupee currency format (e.g., ₹1,18,000)
 */
export const formatIndianCurrency = (amount: number): string => {
  const safeAmount = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

/**
 * Automatically determine payment status based on amount paid vs total amount
 */
export const determinePaymentStatus = (
  amountPaid: number,
  totalAmount: number,
  overrideStatus?: PaymentStatus
): PaymentStatus => {
  if (overrideStatus === 'Cancelled' || overrideStatus === 'Refunded' || overrideStatus === 'Failed') {
    return overrideStatus;
  }

  const paid = Number(amountPaid || 0);
  const total = Number(totalAmount || 0);

  if (paid >= total && total > 0) {
    return 'Paid';
  }
  if (paid > 0 && paid < total) {
    return 'Partially Paid';
  }
  return 'Pending';
};

/**
 * Generate a guaranteed unique receipt number (e.g., CEGS-REC-2026-000101)
 */
export const generateUniqueReceiptNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Payment.countDocuments();
  let candidate = `CEGS-REC-${year}-${String(count + 1).padStart(6, '0')}`;
  
  let exists = await Payment.findOne({ receiptNumber: candidate });
  let attempt = 1;
  while (exists) {
    candidate = `CEGS-REC-${year}-${String(count + 1 + attempt).padStart(6, '0')}`;
    exists = await Payment.findOne({ receiptNumber: candidate });
    attempt++;
  }
  return candidate;
};

/**
 * Generate a guaranteed unique payment ID (e.g., PAY-2026-001)
 */
export const generateUniquePaymentId = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await Payment.countDocuments();
  let candidate = `PAY-${year}-${String(count + 1).padStart(3, '0')}`;

  let exists = await Payment.findOne({ paymentId: candidate });
  let attempt = 1;
  while (exists) {
    candidate = `PAY-${year}-${String(count + 1 + attempt).padStart(3, '0')}`;
    exists = await Payment.findOne({ paymentId: candidate });
    attempt++;
  }
  return candidate;
};

/**
 * Fetch or initialize the active Course Fee configuration
 */
export const getActiveCourseFeeConfig = async (): Promise<ICourseFee> => {
  let fee = await CourseFee.findOne({ isActive: true });
  if (!fee) {
    const calc = calculateGST(100000, 18);
    fee = await CourseFee.create({
      programTitle: '6-Month Job-Ready Training Program',
      baseFee: calc.baseAmount,
      gstRate: calc.gstRate,
      gstAmount: calc.gstAmount,
      totalFee: calc.totalAmount,
      currency: 'INR',
      description: '6-Month Job-Ready Training Program Standard Tuition & Mentorship Fee',
      isActive: true,
    });
  }
  return fee;
};
