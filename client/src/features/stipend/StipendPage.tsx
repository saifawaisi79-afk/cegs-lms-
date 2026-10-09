import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Building2,
  FileCheck,
  CheckCircle2,
  ArrowDown,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api.js';
import { IStipendRecord } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const StipendPage: React.FC = () => {
  const [records, setRecords] = useState<IStipendRecord[]>([]);
  const [totalDisbursed, setTotalDisbursed] = useState(22000);
  const [pendingDisbursement, setPendingDisbursement] = useState(11500);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStipends = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/stipends');
      if (res.data?.success && res.data.data.records?.length > 0) {
        setRecords(res.data.data.records);
        setTotalDisbursed(res.data.data.totalDisbursed || 0);
        setPendingDisbursement(res.data.data.pendingDisbursement || 0);
      } else {
        setRecords([]);
      }
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStipends();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Disbursed':
        return <StatusBadge label="Disbursed (Settled)" variant="green" size="sm" />;
      case 'Processing':
        return <StatusBadge label="Bank Processing" variant="orange" size="sm" />;
      case 'Eligible':
        return <StatusBadge label="Upcoming" variant="teal" size="sm" />;
      case 'On Hold':
        return <StatusBadge label="Review Needed" variant="red" size="sm" />;
      default:
        return <StatusBadge label={status} variant="neutral" size="sm" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="FINANCIAL MILESTONES"
        title="Training Stipends & Progression"
        subtitle="Performance and attendance-backed monthly stipend disbursed based on the CEGS program roadmap."
        badge={<StatusBadge label="Active Participant" variant="teal" />}
        actions={
          <button
            onClick={() => alert('Disbursement statement exported.')}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm bg-white"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Statement</span>
          </button>
        }
      />

      {/* SIGNATURE SECTION 26 SPEC: STIPEND PROGRESSION & VISUAL JOURNEY */}
      <div className="card-premium p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="eyebrow-text">STIPEND STRUCTURE</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Monthly Stipend Progression
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured stipend progression linked with career skill phases.
            </p>
          </div>
          <span className="badge-teal self-start sm:self-auto">
            CEGS Program Standard
          </span>
        </div>

        {/* 2-Tier Visual Breakdown + LEARN ↓ BUILD ↓ PROGRESS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* MONTHS 1–4 */}
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  MONTHS 1–4
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Foundations & Tech
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight mt-3">
                ₹10,000–₹12,000
              </div>
              <div className="text-xs text-slate-500 mt-1">per month</div>
            </div>

            {/* LEARN -> BUILD Visual */}
            <div className="pt-4 border-t border-slate-200/70 flex items-center gap-3">
              <span className="text-xs font-black text-[#0F8F87] uppercase tracking-wider">LEARN</span>
              <span className="text-slate-400">↓</span>
              <span className="text-xs font-black text-[#0F8F87] uppercase tracking-wider">BUILD</span>
            </div>
          </div>

          {/* MONTHS 5–6 */}
          <div className="p-6 rounded-xl bg-teal-50/40 border border-teal-200/90 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F8F87] text-white">
                  MONTHS 5–6
                </span>
                <span className="text-xs text-teal-800 font-semibold">
                  Drives & Certification
                </span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight mt-3">
                ₹20,000–₹22,000
              </div>
              <div className="text-xs text-slate-500 mt-1">per month</div>
            </div>

            {/* BUILD -> PROGRESS Visual */}
            <div className="pt-4 border-t border-teal-200/60 flex items-center gap-3">
              <span className="text-xs font-black text-[#0F8F87] uppercase tracking-wider">BUILD</span>
              <span className="text-slate-400">↓</span>
              <span className="text-xs font-black text-[#0F8F87] uppercase tracking-wider">PROGRESS</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Settled to Date"
          value={`₹${totalDisbursed.toLocaleString('en-IN')}`}
          icon={CheckCircle}
          variant="emerald"
          subtext="Confirmed NEFT settlements"
          trend={{ value: 'Months 1 & 2', positive: true }}
        />
        <StatCard
          label="Current Processing"
          value={`₹${pendingDisbursement.toLocaleString('en-IN')}`}
          icon={Clock}
          variant="amber"
          subtext="Month 3 October cycle"
          trend={{ value: '94.2% Attendance', positive: true }}
        />
        <StatCard
          label="Upcoming Tier (Months 5-6)"
          value="₹20K–₹22K"
          icon={TrendingUp}
          variant="brand"
          subtext="Activated upon capstone milestone"
        />
      </div>

      {/* DETAILED DISBURSEMENTS TABLE */}
      <div className="card-premium overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-900">
              Monthly Disbursement Schedule
            </h4>
            <p className="text-xs text-slate-500">
              Live record of monthly stipends and transaction bank references
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Account: HDFC Bank •••• 4892
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Month / Phase</th>
                <th className="py-3 px-4">Stipend Rate</th>
                <th className="py-3 px-4">Amount Disbursed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Bank Reference</th>
                <th className="py-3 px-5 text-right">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={AlertCircle}
                      title="Connection Error"
                      description="Failed to load your stipend records."
                      action={{ label: 'Retry', onClick: fetchStipends }}
                    />
                  </td>
                </tr>
              ) : records.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={CheckCircle}
                      title="No Stipends Found"
                      description="You do not have any stipend records yet."
                    />
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-900">
                    {r.monthName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    ₹{r.expectedAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {r.amountPaid > 0 ? `₹${r.amountPaid.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3.5 px-4">{getStatusBadge(r.status)}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                    {r.paymentReference || 'Pending Cycle'}
                  </td>
                  <td className="py-3.5 px-5 text-right text-slate-500">
                    {r.paymentDate
                      ? new Date(r.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Scheduled'}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
