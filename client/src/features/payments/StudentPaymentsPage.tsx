import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Receipt,
  IndianRupee,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Calendar,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  FileText,
} from 'lucide-react';
import api from '../../services/api.js';
import { IPaymentRecord, IPaymentSummary, IReceiptData } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { ReceiptModal } from '../../components/payments/ReceiptModal.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { formatINR } from '../../utils/currency.js';
import { downloadReceiptPdf } from '../../utils/pdfGenerator.js';
import { useAuthStore } from '../../store/authStore.js';

export const StudentPaymentsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<IPaymentSummary | null>(null);
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<IReceiptData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/payments/me');
      if (res.data?.success && res.data.data) {
        setSummary(res.data.data.summary);
        setPayments(res.data.data.payments);
      } else {
        setSummary(null);
        setPayments([]);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(true);
      setSummary(null);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPaymentsData();
  };

  const handleViewReceipt = (p: IPaymentRecord) => {
    const receiptData: IReceiptData = {
      payment: p,
      student: {
        name: summary?.studentName || user?.name || 'Candidate',
        email: summary?.studentEmail || user?.email || '',
        phone: '+91 98765 43210',
        rollNumber: summary?.rollNumber || 'CEGS-2025-0182',
        batchCode: summary?.batchCode || 'CEGS-FGT-OCT15',
        trackName: summary?.trackName || 'Full Stack Development',
        programTitle: summary?.programTitle || '6-Month Job-Ready Training Program',
      },
      verificationUrl: `http://localhost:5173/verify-receipt/${p.receiptNumber}`,
    };
    setSelectedReceipt(receiptData);
  };

  const handleDownloadDirect = (p: IPaymentRecord) => {
    const receiptData: IReceiptData = {
      payment: p,
      student: {
        name: summary?.studentName || user?.name || 'Candidate',
        email: summary?.studentEmail || user?.email || '',
        phone: '+91 98765 43210',
        rollNumber: summary?.rollNumber || 'CEGS-2025-0182',
        batchCode: summary?.batchCode || 'CEGS-FGT-OCT15',
        trackName: summary?.trackName || 'Full Stack Development',
        programTitle: summary?.programTitle || '6-Month Job-Ready Training Program',
      },
      verificationUrl: `http://localhost:5173/verify-receipt/${p.receiptNumber}`,
    };
    downloadReceiptPdf(receiptData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <StatusBadge label="Paid in Full" variant="green" size="sm" />;
      case 'Partially Paid':
      case 'Partial':
        return <StatusBadge label="Partially Paid" variant="blue" size="sm" />;
      case 'Pending':
        return <StatusBadge label="Pending" variant="orange" size="sm" />;
      case 'Refunded':
        return <StatusBadge label="Refunded" variant="neutral" size="sm" />;
      case 'Failed':
      case 'Cancelled':
        return <StatusBadge label={status} variant="red" size="sm" />;
      default:
        return <StatusBadge label={status} variant="teal" size="sm" />;
    }
  };

  const paidPercentage = summary?.totalCourseFee
    ? Math.min(100, Math.round((summary.totalPaid / summary.totalCourseFee) * 100))
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        eyebrow="FINANCIAL TRANSACTIONS & RECEIPTS"
        title="My Payments"
        subtitle="View your course payment details, payment history and official GST receipts."
        badge={
          summary?.paymentStatus === 'Paid' ? (
            <StatusBadge label="Fee Fully Settled" variant="green" />
          ) : summary?.paymentStatus === 'Partially Paid' ? (
            <StatusBadge label="Installment Active" variant="blue" />
          ) : (
            <StatusBadge label="Payment Pending" variant="orange" />
          )
        }
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3.5 py-2 border border-border hover:bg-surface-muted text-[#17202A] rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-subtle bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-brand-500' : 'text-foreground-muted'}`} />
            <span>Refresh</span>
          </button>
        }
      />

      {/* 2. Top Summary Cards (Section 2 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          label="Total Course Fee"
          value={formatINR(summary?.totalCourseFee || 0)}
          icon={CreditCard}
          trend={{ value: '18% GST Included', positive: true }}
          subtext="Standard institutional program fee"
        />

        <StatCard
          label="Total Paid"
          value={formatINR(summary?.totalPaid || 0)}
          icon={IndianRupee}
          trend={{ value: `${paidPercentage}% Cleared`, positive: paidPercentage === 100 }}
          subtext="Verified receipts cleared"
        />

        <StatCard
          label="Balance Due"
          value={formatINR(summary?.balanceDue || 0)}
          icon={Clock}
          trend={{
            value: summary?.balanceDue === 0 ? 'Nil Balance' : 'Awaiting Settlement',
            positive: summary?.balanceDue === 0,
          }}
          subtext="Remaining outstanding fee"
        />

        <div className="card-premium p-5 flex flex-col justify-between space-y-3 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="eyebrow-text text-[11px] text-slate-400">
              Payment Status
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800">
              <ShieldCheck className="w-4 h-4 text-[#0F8F87]" />
            </div>
          </div>
          <div>
            <div className="pt-1">{getStatusBadge(summary?.paymentStatus || 'Pending')}</div>
            <p className="text-[11px] text-slate-500 mt-2 font-normal">
              {summary?.balanceDue === 0
                ? 'All financial obligations fulfilled.'
                : 'Payment schedule in progression.'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Course Payment Details Card & Invoice Breakdown (Section 3 & 4 & 5 Spec) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Course Payment Details */}
        <div className="lg:col-span-2 card-premium p-6 sm:p-8 space-y-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200/80 flex items-center justify-center text-brand-600">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  COURSE PAYMENT DETAILS
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Configured academic curriculum & training fee structure
                </p>
              </div>
            </div>
            {getStatusBadge(summary?.paymentStatus || 'Pending')}
          </div>

          {/* Grid of details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="eyebrow-text text-[10px] text-slate-400 block">Program</span>
              <span className="font-bold text-slate-900 block text-sm">
                {summary?.programTitle || '6-Month Job-Ready Training Program'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="eyebrow-text text-[10px] text-slate-400 block">Assigned Track</span>
              <span className="font-bold text-[#0F8F87] block text-sm">
                {summary?.trackName || 'Full Stack Development'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="eyebrow-text text-[10px] text-slate-400 block">Student Name</span>
              <span className="font-bold text-slate-900 block">
                {summary?.studentName || user?.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ID: {summary?.rollNumber || 'CEGS-2025-0182'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="eyebrow-text text-[10px] text-slate-400 block">Enrollment Date</span>
              <span className="font-bold text-slate-900 block">
                {summary?.enrollmentDate
                  ? new Date(summary.enrollmentDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '15 October 2025'}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Course Fee Fulfillment</span>
              <span className="font-extrabold text-[#0F8F87]">{paidPercentage}% Cleared</span>
            </div>
            <ProgressBar value={paidPercentage} variant="brand" size="md" />
            <div className="flex justify-between text-[11px] text-slate-500 pt-1">
              <span>Paid: {formatINR(summary?.totalPaid || 0)}</span>
              <span>Balance: {formatINR(summary?.balanceDue || 0)}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Invoice-Style GST Breakdown (Section 5 Spec) */}
        <div className="card-premium p-6 sm:p-7 space-y-5 bg-slate-900 text-white flex flex-col justify-between border border-slate-800 rounded-2xl shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <h4 className="font-bold text-sm tracking-wide text-white uppercase">
                  Tax Invoice Breakdown
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">
                18% GST
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Standard statutory taxation breakdown in compliance with GST guidelines.
            </p>

            {/* Official Invoice Box */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-2.5 font-mono text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-sans">Course Fee</span>
                <span className="font-bold">{formatINR(summary?.baseCourseFee || 100000)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-sans">GST @ {summary?.gstRate || 18}%</span>
                <span className="font-bold">{formatINR(summary?.gstAmount || 18000)}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between items-center text-sm font-extrabold text-white">
                <span className="font-sans">Total Amount</span>
                <span className="text-teal-300">{formatINR(summary?.totalCourseFee || 118000)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center text-emerald-400 font-bold">
                <span className="font-sans text-xs">Amount Paid</span>
                <span>{formatINR(summary?.totalPaid || 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="font-sans text-slate-400">Balance Due</span>
                <span className={summary?.balanceDue === 0 ? 'text-slate-400' : 'text-amber-400 font-bold'}>
                  {formatINR(summary?.balanceDue || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Currency: INR (₹)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Calculated Accurately</span>
            </span>
          </div>
        </div>
      </div>

      {/* 4. Payment History (Section 6 Spec) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="eyebrow-text text-[11px] text-[#0F8F87] block">RECORDS & RECEIPTS</span>
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight mt-0.5">
              Payment History
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Complete transactional history and downloadable official receipts
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {payments.length} {payments.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {/* Empty State (Section 29 Spec) */}
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Connection Error"
            description="Failed to load your payment history."
            action={{ label: 'Retry', onClick: fetchPaymentsData }}
          />
        ) : payments.length === 0 && !loading ? (
          <div className="card-premium p-12 text-center space-y-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Receipt className="w-8 h-8" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h4 className="font-bold text-base text-slate-900">
                No payment records yet
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your payment details and receipts will appear here once a payment is recorded.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table (Section 6 & 30 Spec) */}
            <div className="card-premium overflow-hidden hidden md:block bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-5">Payment ID</th>
                      <th className="py-3.5 px-5">Payment Date</th>
                      <th className="py-3.5 px-5">Description</th>
                      <th className="py-3.5 px-5 text-right">Base Amount</th>
                      <th className="py-3.5 px-5 text-right">GST (18%)</th>
                      <th className="py-3.5 px-5 text-right">Total Amount</th>
                      <th className="py-3.5 px-5 text-center">Payment Method</th>
                      <th className="py-3.5 px-5 text-center">Status</th>
                      <th className="py-3.5 px-5 text-right">Receipt Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map((p) => {
                      const dateStr = new Date(p.paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                            {p.paymentId}
                          </td>
                          <td className="py-3.5 px-5 text-slate-500 font-medium">
                            {dateStr}
                          </td>
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-slate-900">{p.description}</p>
                            {p.transactionId && (
                              <p className="text-[10px] text-slate-500 font-mono">
                                Txn: {p.transactionId}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right font-medium text-slate-900">
                            {formatINR(p.baseAmount)}
                          </td>
                          <td className="py-3.5 px-5 text-right font-medium text-slate-900">
                            {formatINR(p.gstAmount)}
                          </td>
                          <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">
                            {formatINR(p.totalAmount)}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[11px] border border-slate-200">
                              {p.paymentMethod || 'Online'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            {getStatusBadge(p.status)}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleViewReceipt(p)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-[11px] transition flex items-center gap-1 shadow-sm bg-white"
                                title="View Receipt"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleDownloadDirect(p)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#0F8F87] hover:bg-[#0D7A73] text-white font-semibold text-[11px] transition flex items-center gap-1 shadow-sm"
                                title="Download PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Responsive Cards (Section 30 Spec) */}
            <div className="space-y-3.5 md:hidden">
              {payments.map((p) => {
                const dateStr = new Date(p.paymentDate).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div key={p._id} className="card-premium p-4 space-y-3 text-xs bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-mono font-bold text-slate-900 block">
                          {p.paymentId}
                        </span>
                        <span className="text-[11px] text-slate-500">{dateStr}</span>
                      </div>
                      {getStatusBadge(p.status)}
                    </div>

                    <div>
                      <p className="font-bold text-slate-900">{p.description}</p>
                      {p.transactionId && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Txn: {p.transactionId}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-[11px] border border-slate-200">
                      <div>
                        <span className="text-slate-500 block">Base</span>
                        <span className="font-semibold text-slate-900">{formatINR(p.baseAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">GST (18%)</span>
                        <span className="font-semibold text-slate-900">{formatINR(p.gstAmount)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Total</span>
                        <span className="font-extrabold text-[#0F8F87]">{formatINR(p.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500">
                        Method: <strong className="text-slate-900 font-semibold">{p.paymentMethod || 'Online'}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReceipt(p)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => handleDownloadDirect(p)}
                          className="px-3 py-1.5 rounded-lg bg-[#0F8F87] hover:bg-[#0D7A73] text-white font-semibold text-xs flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Official CEGS Receipt Modal (Section 7-14 Spec) */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
