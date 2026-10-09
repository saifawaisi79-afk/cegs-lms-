import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Award,
  CheckCircle,
  ExternalLink,
  Edit,
  ShieldCheck,
  Code,
  FolderKanban,
  Video,
  CheckCircle2,
  CreditCard,
  Receipt,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useParams } from 'react-router-dom';
import api from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { formatINR } from '../../utils/currency.js';
import { ReceiptModal } from '../../components/payments/ReceiptModal.js';
import { downloadReceiptPdf } from '../../utils/pdfGenerator.js';
import { IReceiptData } from '../../types/index.js';

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [displayUser, setDisplayUser] = useState<any>(user || null);
  const [activeTab, setActiveTab] = useState<'overview' | 'education' | 'skills' | 'projects' | 'interviews' | 'credentials' | 'payments'>('overview');
  const [paymentsSummary, setPaymentsSummary] = useState<any>(null);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<IReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        if (id) {
          const res = await api.get(`/students/${id}/full-profile`);
          if (res.data?.success) {
            setProfile(res.data.data.profile);
            setDisplayUser(res.data.data.user);
          } else {
            setError('Failed to load profile.');
          }
        } else {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data.user.studentProfile) {
            setProfile(res.data.user.studentProfile);
            setDisplayUser(res.data.user);
          } else {
            setError('Failed to load your profile.');
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch profile', err);
        setError(err?.response?.data?.error || 'Failed to fetch profile data.');
      } finally {
        setLoading(false);
      }
    };

    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/me');
        if (res.data?.success) {
          setPaymentsSummary(res.data.data.summary);
          setPaymentsList(res.data.data.payments);
        }
      } catch (err: any) {
        console.error(err);
        // Only set error if not already set, or just log.
      }
    };

    fetchProfile();
    fetchPayments();
  }, []);

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to Load Profile"
        description={error}
        action={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header (Section 34 Specification) */}
      <PageHeader
        eyebrow="CAREER RECORD"
        title="Student Profile & Portfolio"
        subtitle="Comprehensive verified academic, technical skill, project credential, and interview record."
        badge={<StatusBadge label="Placement Verified" variant="teal" />}
      />

      {/* HERO PROFILE CARD */}
      <div className="card-premium rounded-2xl p-6 sm:p-8 bg-white border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <img
            src={displayUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=180'}
            alt={displayUser?.name}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#0F8F87] shadow-sm flex-shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {displayUser?.name}
              </h2>
              <StatusBadge label="Full Stack Track" variant="teal" size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold">
              {profile?.targetRole || 'Full Stack Software Engineer'} • Roll No: {profile?.rollNumber || 'CEGS-2026-001'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted pt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-foreground-muted" />
                <span>{displayUser?.email}</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-foreground-muted" />
                <span>{profile?.phone || '+91 98765 43210'}</span>
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-foreground-muted" />
                <span>{profile?.city || 'Hyderabad'}, {profile?.state || 'Telangana'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Completion Meter */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm text-xs space-y-2 w-full lg:w-64">
          <div className="flex items-center justify-between font-bold">
            <span className="text-slate-500">Profile Verification</span>
            <span className="text-[#0F8F87] font-black">100% Verified</span>
          </div>
          <ProgressBar value={100} variant="emerald" size="sm" />
          <p className="text-[10px] text-slate-500 text-center font-medium">
            ✓ Ready for Corporate Placement Drives
          </p>
        </div>
      </div>

      {/* SECTION TABS (Section 34 Specification) */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-bold w-fit border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          About
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'education'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Education
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'skills'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Skills
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'interviews'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Interviews
        </button>
        <button
          onClick={() => setActiveTab('credentials')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Certificates
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
            activeTab === 'payments'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Payments
        </button>
      </div>

      {/* OVERVIEW / PERSONAL & CAREER */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-[#0F8F87]" />
              <h3 className="font-extrabold text-sm text-slate-900">Career Objectives & Trajectory</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Enrolled Program Track</p>
                <p className="font-bold text-teal-900">{profile?.preferredTrack || 'Full Stack Development'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Target Corporate Role</p>
                <p className="font-bold text-slate-900">{profile?.targetRole || 'Full Stack Software Engineer'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Career Statement</p>
                <p className="text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  "{profile?.careerGoals || 'Passionate software engineer building resilient, scalable multi-tier web applications.'}"
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Program Enrollment Details</h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Program Batch</span>
                <span className="font-bold text-slate-900">CEGS-OCT15</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Program Stage</span>
                <span className="font-bold text-[#0F8F87]">Month 3 of 6</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Assigned Mentor</span>
                <span className="font-bold text-slate-900">Rajesh Ramanathan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placement Drive Eligibility</span>
                <span className="font-bold text-emerald-700">✓ Fully Qualified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDUCATION */}
      {activeTab === 'education' && (
        <div className="card-premium p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <GraduationCap className="w-4 h-4 text-brand-600" />
            <h3 className="font-extrabold text-sm text-slate-900">Academic Background</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <p className="text-slate-400 font-semibold mb-1">Degree & Major</p>
              <p className="font-bold text-slate-900 text-sm">
                {profile?.degree || 'B.Tech in Computer Science & Engineering'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <p className="text-slate-400 font-semibold mb-1">University / Institute</p>
              <p className="font-bold text-slate-900 text-sm">
                {profile?.college || 'Jawaharlal Nehru Technological University'}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <p className="text-slate-400 font-semibold mb-1">Graduation Year</p>
              <p className="font-bold text-slate-900 text-sm">{profile?.graduationYear || 2024}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
              <p className="text-slate-400 font-semibold mb-1">Academic Standing</p>
              <p className="font-bold text-emerald-700 text-sm">First Class with Distinction</p>
            </div>
          </div>
        </div>
      )}

      {/* SKILLS */}
      {activeTab === 'skills' && (
        <div className="card-premium p-6 sm:p-7 space-y-6">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Verified Technical Competencies</h3>
            <p className="text-xs text-slate-400">Validated through weekly milestone exams & live coding reviews</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5">
                Core Engineering & Architecture
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'React 18 & TypeScript',
                  'Node.js & Express.js',
                  'MongoDB Aggregation Pipelines',
                  'State Management (Zustand / Redux)',
                  'RESTful API Contract Design',
                  'Docker Containerization',
                  'Git Flow & Code Reviews',
                ].map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-bold border border-brand-200"
                  >
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2.5">
                Communication & Leadership Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'STAR Method Interview Technique',
                  'Architectural Standup Presentation',
                  'Cross-functional Team Collaboration',
                  'Professional Writing & Documentation',
                ].map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-bold border border-sky-200"
                  >
                    ★ {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CAPSTONE PROJECTS */}
      {activeTab === 'projects' && (
        <div className="card-premium p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Industry Capstone Project</h3>
          <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">
                Enterprise Multi-Tenant HR & Cloud Platform
              </h4>
              <StatusBadge label="Sprint 2 Active" variant="teal" size="sm" />
            </div>
            <p className="text-slate-600 leading-relaxed">
              Recruitment tracking pipeline built using React, TypeScript, Node.js, and MongoDB with multi-tenant database routing and JWT authentication.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-white border border-slate-200 font-semibold text-slate-700">
                Lead Full Stack Developer
              </span>
            </div>
          </div>
        </div>
      )}

      {/* INTERVIEWS (Section 34 Specification) */}
      {activeTab === 'interviews' && (
        <div className="card-premium p-6 space-y-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-sm text-slate-900">Mock Interview & Performance Record</h3>
              <p className="text-xs text-slate-500">Evaluations conducted across Technical, Architecture, and HR rounds</p>
            </div>
            <StatusBadge label="Score: 92% Average" variant="teal" size="sm" />
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900">HR Behavioral & Communication Round</span>
                  <p className="text-[11px] text-slate-500">Evaluator: Priya Sharma (Senior HR Lead)</p>
                </div>
                <StatusBadge label="Score: 92%" variant="green" size="sm" />
              </div>
              <p className="text-slate-600 leading-relaxed">
                "Excellent poise and articulate communication. Answered behavioral questions clearly using the STAR methodology. Demonstrated high cultural readiness for enterprise client pods."
              </p>
            </div>

            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-slate-900">Technical & Distributed Systems Round</span>
                  <p className="text-[11px] text-slate-500">Evaluator: Rajesh Ramanathan (Principal Architect)</p>
                </div>
                <StatusBadge label="Scheduled" variant="teal" size="sm" />
              </div>
              <p className="text-slate-600 leading-relaxed">
                Upcoming simulation focusing on MongoDB aggregate pipelines, Redis caching layers, and React state reconciliation algorithms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CREDENTIALS */}
      {activeTab === 'credentials' && (
        <div className="card-premium p-6 space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900">Conferred Program Certifications</h3>
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="font-bold text-sm text-slate-900">
                  6-Month Freshers Growth Training Program
                </p>
                <p className="text-slate-500 font-mono text-[11px]">CEGS-2025-FGT-0182</p>
              </div>
            </div>
            <StatusBadge label="Distinction (Top 5%)" variant="green" size="sm" />
          </div>
        </div>
      )}

      {/* PAYMENTS & RECEIPTS (SECTION 18 SPEC) */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-400 block font-medium text-[11px]">Course Fee</span>
              <span className="font-extrabold text-slate-900 block text-sm mt-0.5">
                {formatINR(paymentsSummary?.baseCourseFee || 100000)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-400 block font-medium text-[11px]">GST @ 18%</span>
              <span className="font-extrabold text-slate-900 block text-sm mt-0.5">
                {formatINR(paymentsSummary?.gstAmount || 18000)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-400 block font-medium text-[11px]">Total Payable</span>
              <span className="font-extrabold text-brand-700 block text-sm mt-0.5">
                {formatINR(paymentsSummary?.totalCourseFee || 118000)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs">
              <span className="text-emerald-700 block font-medium text-[11px]">Total Paid</span>
              <span className="font-extrabold text-emerald-800 block text-sm mt-0.5">
                {formatINR(paymentsSummary?.totalPaid || 0)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-400 block font-medium text-[11px]">Balance</span>
              <span className={`font-extrabold block text-sm mt-0.5 ${paymentsSummary?.balanceDue > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                {formatINR(paymentsSummary?.balanceDue || 0)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
              <span className="text-slate-400 block font-medium text-[11px]">Payment Status</span>
              <div className="mt-1">
                <StatusBadge
                  label={paymentsSummary?.paymentStatus || 'Pending'}
                  variant={paymentsSummary?.paymentStatus === 'Paid' ? 'green' : paymentsSummary?.paymentStatus === 'Partially Paid' ? 'orange' : 'neutral'}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Payment History & Receipts */}
          <div className="card-premium p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-600" />
                <h3 className="font-extrabold text-sm text-slate-900">
                  Payment History & Downloadable Receipts
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-bold">
                {paymentsList.length} Transactions
              </span>
            </div>

            {paymentsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No payment transactions recorded yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Receipt / ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Base Amount</th>
                      <th className="py-2.5 px-3 text-right">GST</th>
                      <th className="py-2.5 px-3 text-right">Total Amount</th>
                      <th className="py-2.5 px-3 text-center">Method</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Receipt Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsList.map((p) => {
                      const dateStr = new Date(p.paymentDate).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                      const receiptData: IReceiptData = {
                        payment: p,
                        student: {
                          name: user?.name || 'Candidate',
                          email: user?.email || '',
                          phone: profile?.phone || '+91 98765 43210',
                          rollNumber: profile?.rollNumber || 'CEGS-2025-0182',
                          batchCode: profile?.batch?.code || 'CEGS-FGT-OCT15',
                          trackName: profile?.preferredTrack || 'Full Stack Development',
                          programTitle: '6-Month Job-Ready Training Program',
                        },
                        verificationUrl: `http://localhost:5173/verify-receipt/${p.receiptNumber}`,
                      };

                      return (
                        <tr key={p._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {p.receiptNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{dateStr}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{p.description}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(p.baseAmount)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{formatINR(p.gstAmount)}</td>
                          <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">{formatINR(p.totalAmount)}</td>
                          <td className="py-2.5 px-3 text-center">{p.paymentMethod}</td>
                          <td className="py-2.5 px-3 text-center">
                            <StatusBadge
                              label={p.status}
                              variant={p.status === 'Paid' ? 'green' : 'orange'}
                              size="sm"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedReceipt(receiptData)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 shadow-sm"
                              >
                                <Eye className="w-3 h-3 text-slate-500" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => downloadReceiptPdf(receiptData)}
                                className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-[11px] font-bold flex items-center gap-1 shadow-sm"
                              >
                                <Download className="w-3 h-3 text-brand-600" />
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
            )}
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
