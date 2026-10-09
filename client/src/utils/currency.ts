/**
 * Reusable Indian Currency and GST Calculation Utilities
 */

export const formatINR = (amount: number): string => {
  const safeAmount = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safeAmount);
};

export interface IGstCalcResult {
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
}

export const calculateGST = (baseAmount: number, gstRate: number = 18): IGstCalcResult => {
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

export const calculateBaseFromTotal = (totalAmount: number, gstRate: number = 18): IGstCalcResult => {
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
