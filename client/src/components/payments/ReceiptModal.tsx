import React from 'react';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  CreditCard,
  Hash,
  User,
  GraduationCap,
} from 'lucide-react';
import { IReceiptData } from '../../types/index.js';
import { formatINR } from '../../utils/currency.js';
import { downloadReceiptPdf } from '../../utils/pdfGenerator.js';
import { StatusBadge } from '../ui/StatusBadge.js';

interface ReceiptModalProps {
  receipt: IReceiptData | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  if (!receipt) return null;

  const { payment, student } = receipt;

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadReceiptPdf(receipt);
  };

  const getStatusDisplay = () => {
    switch (payment.status) {
      case 'Paid':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>✓ Payment Received</span>
          </div>
        );
      case 'Partially Paid':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Partially Paid</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-xs font-extrabold">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            <span>{payment.status.toUpperCase()}</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-brand-700 uppercase tracking-wider">
              Official Tax Invoice & Receipt
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              ({payment.receiptNumber})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-sm"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Download Selectable PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Container */}
        <div className="receipt-print-container p-6 sm:p-10 overflow-y-auto flex-1 space-y-6 bg-white text-slate-900">
          {/* Header Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
                CE
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  CAREER EXPERT GLOBAL SOLUTIONS
                </h1>
                <p className="text-[11px] font-bold text-brand-600 uppercase tracking-widest">
                  Build • Grow • Excel
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Corporate HQ • Training & Career Transformation Division
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="inline-block px-2.5 py-1 rounded bg-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                PAYMENT RECEIPT
              </span>
              <p className="font-mono text-sm font-extrabold text-slate-900">
                {payment.receiptNumber}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Payment ID: <span className="font-mono font-bold text-slate-700">{payment.paymentId}</span>
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Date: <span className="font-bold text-slate-700">{formattedDate}</span>
              </p>
            </div>
          </div>

          {/* Student & Program 2-Column Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Student Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-brand-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Student Details</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Candidate:</span>
                <span className="col-span-2 font-bold text-slate-900">{student.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Email:</span>
                <span className="col-span-2 font-medium text-slate-800 break-all">{student.email}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Phone:</span>
                <span className="col-span-2 font-medium text-slate-800">{student.phone || '+91 98765 43210'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Roll ID:</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">{student.rollNumber || 'CEGS-2025-0182'}</span>
              </div>
            </div>

            {/* Program & Track Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-brand-700 font-extrabold uppercase text-[10px] tracking-wider mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Enrolled Program</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Program:</span>
                <span className="col-span-2 font-bold text-slate-900">{student.programTitle || '6-Month Job-Ready Training Program'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Career Track:</span>
                <span className="col-span-2 font-bold text-brand-700">{student.trackName || 'Full Stack Development'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-500">Cohort Batch:</span>
                <span className="col-span-2 font-medium text-slate-800">{student.batchCode || 'CEGS-FGT-OCT15'}</span>
              </div>
              <div className="grid grid-cols-3 gap-1 items-center">
                <span className="text-slate-500">Status:</span>
                <div className="col-span-2">{getStatusDisplay()}</div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white uppercase tracking-wider font-extrabold">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Fee Description</th>
                  <th className="py-3 px-4 text-center">Tax Specification</th>
                  <th className="py-3 px-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-400 font-mono">01</td>
                  <td className="py-3 px-4">
                    <p className="font-extrabold text-slate-900">
                      {payment.description || 'Course / Training Program Tuition Fee'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Installment {payment.installmentNumber || 1} • Professional Training & Industry Mentorship
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-medium">
                    Base Course Fee
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {formatINR(payment.baseAmount)}
                  </td>
                </tr>

                <tr className="bg-slate-50/40">
                  <td className="py-3 px-4 text-slate-400 font-mono">02</td>
                  <td className="py-3 px-4">
                    <p className="font-extrabold text-slate-900">
                      Goods & Services Tax (GST @ {payment.gstRate || 18}%)
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Statutory Central & State GST (18%)
                    </p>
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 font-medium">
                    GST @ {payment.gstRate || 18}%
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {formatINR(payment.gstAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Breakdown & Settlement Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Settlement Details (Left) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <p className="font-extrabold text-brand-700 uppercase text-[10px] tracking-wider mb-2">
                Settlement & Transaction Info
              </p>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-900">{payment.paymentMethod || 'Online'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-800">
                  {payment.transactionId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-bold text-slate-800">{formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-700">
                  {payment.status === 'Paid' ? 'PAID IN FULL' : payment.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Total Breakdown Box (Right) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Course Fee:</span>
                <span className="font-bold">{formatINR(payment.baseAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST @ {payment.gstRate || 18}%:</span>
                <span className="font-bold">{formatINR(payment.gstAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-brand-700">{formatINR(payment.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-extrabold">
                <span>Amount Paid:</span>
                <span>{formatINR(payment.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-600">
                <span>Balance Due:</span>
                <span className={payment.balanceAmount > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-500'}>
                  {formatINR(payment.balanceAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Official Verification Box & Signatory */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-extrabold text-emerald-900 text-[11px]">
                  Institutional Financial Verification
                </p>
                <p className="text-[10px] text-emerald-700">
                  Recorded and cleared in the CEGS LMS Institutional Accounts Registry.
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="font-extrabold text-slate-900">Career Expert Global Solutions</p>
              <p className="text-[11px] text-slate-500">Authorized Financial Officer</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">CEGS-FIN-ACCOUNTS-DELHI</p>
            </div>
          </div>

          {/* Footer Note and Verification Link */}
          <div className="border-t border-slate-100 pt-4 text-center space-y-1">
            <p className="text-[10px] text-slate-400">
              This is an official computer-generated document. For verification, visit:
            </p>
            <a
              href={`/verify-receipt/${payment.receiptNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-brand-600 hover:text-brand-800 underline inline-flex items-center gap-1"
            >
              <span>http://localhost:5173/verify-receipt/{payment.receiptNumber}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
