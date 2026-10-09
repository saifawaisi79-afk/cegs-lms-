import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  CreditCard,
  Building2,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import api from '../services/api.js';
import { formatINR } from '../utils/currency.js';
import { StatusBadge } from '../components/ui/StatusBadge.js';

interface IVerificationData {
  receiptNumber: string;
  paymentId: string;
  studentName: string;
  programTitle: string;
  trackName: string;
  paymentDate: string;
  totalAmount: number;
  amountPaid: number;
  balanceAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  isVerified: boolean;
  issuer: string;
  verifiedAt: string;
}

export const VerifyReceiptPage: React.FC = () => {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const [data, setData] = useState<IVerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyReceipt = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/receipts/${receiptNumber}/verify`);
        if (res.data?.success && res.data.data) {
          setData(res.data.data);
        } else {
          setError(res.data?.message || 'Receipt could not be verified in the CEGS registry.');
        }
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Receipt not found or invalid. Please check the receipt number and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (receiptNumber) {
      verifyReceipt();
    }
  }, [receiptNumber]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <div className="max-w-2xl w-full mx-auto flex items-center justify-between pb-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
            CE
          </div>
          <div>
            <span className="font-extrabold text-sm text-slate-900 block leading-tight">
              CEGS LMS
            </span>
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
              Official Registry Verification
            </span>
          </div>
        </Link>

        <Link
          to="/login"
          className="text-xs font-bold text-brand-600 hover:text-brand-800 transition flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Portal Login</span>
        </Link>
      </div>

      {/* Main Verification Card */}
      <div className="max-w-2xl w-full mx-auto my-auto">
        <div className="card-premium p-6 sm:p-10 bg-white border border-slate-200/90 shadow-xl space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                Verifying receipt cryptographically against CEGS LMS registry...
              </p>
              <p className="text-xs text-slate-400 font-mono">{receiptNumber}</p>
            </div>
          ) : error || !data ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-slate-900">
                  Verification Unsuccessful
                </h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  {error || 'The receipt number provided is not recognized by Career Expert Global Solutions.'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-600 border border-slate-100 max-w-sm mx-auto">
                Receipt Number: {receiptNumber}
              </div>
            </div>
          ) : (
            <>
              {/* Verification Header */}
              <div className="text-center space-y-3 border-b border-slate-100 pb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold uppercase tracking-wide">
                    ✓ Authenticated & Verified Receipt
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
                    Official Payment Record Confirmed
                  </h2>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    This document is officially registered with Career Expert Global Solutions Financial Accounts.
                  </p>
                </div>
              </div>

              {/* Verified Details Grid */}
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100 divide-y divide-slate-200/60 text-xs">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Receipt Number</span>
                    <span className="font-mono font-extrabold text-slate-900 text-sm">
                      {data.receiptNumber}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Payment ID</span>
                    <span className="font-mono font-bold text-slate-700">{data.paymentId}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Candidate / Student</span>
                    <span className="font-bold text-slate-900">{data.studentName}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Program</span>
                    <span className="font-bold text-slate-900">{data.programTitle}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Career Track</span>
                    <span className="font-bold text-brand-700">{data.trackName}</span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Payment Date</span>
                    <span className="font-bold text-slate-800">
                      {new Date(data.paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Total Transaction Amount</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {formatINR(data.totalAmount)}
                    </span>
                  </div>

                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-slate-500">Settlement Status</span>
                    <span className="font-extrabold text-emerald-700 uppercase">
                      {data.paymentStatus === 'Paid' ? 'Paid in Full' : data.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Institutional Privacy Guard */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>
                  Candidate financial account numbers and personal contact information are masked for public security.
                </span>
              </div>

              {/* Institutional Seal */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Issuer: {data.issuer}</span>
                <span>Verified: {new Date(data.verifiedAt).toLocaleTimeString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-2xl w-full mx-auto text-center pt-6 text-[11px] text-slate-400">
        © {new Date().getFullYear()} Career Expert Global Solutions. All rights reserved.
      </div>
    </div>
  );
};
