import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  Award,
  Users,
  Video,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const PackagesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="PROGRAM ENROLLMENT & TIERS"
        title="Packages & Stipend Progression"
        subtitle="Transparent curriculum tiers and performance-linked financial stipend milestones designed for career acceleration."
        badge={<StatusBadge label="Transparent Pricing" variant="teal" />}
      />

      {/* 1. STIPEND PROGRESSION CARD (Section 26 & 27 Specification) */}
      <div className="card-premium p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="eyebrow-text">FINANCIAL SUPPORT</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Stipend Progression
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Performance and attendance-backed monthly stipend support during your 6-month growth tenure.
            </p>
          </div>
          <button
            onClick={() => navigate('/stipends')}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View My Disbursements</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0F8F87]" />
          </button>
        </div>

        {/* 2 Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Months 1-4 */}
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                  Months 1–4
                </span>
                <span className="text-xs text-slate-500 font-medium">Foundations & Tech</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                ₹10,000–₹12,000
              </div>
              <p className="text-xs text-slate-500 mt-1">per month</p>

              <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8F87] flex-shrink-0" />
                  <span>Subject to maintaining 85%+ monthly attendance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8F87] flex-shrink-0" />
                  <span>Successful completion of weekly Friday assessments</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] font-bold text-[#0F8F87] uppercase tracking-wide">
              LEARN ↓ BUILD
            </div>
          </div>

          {/* Months 5-6 */}
          <div className="p-5 rounded-xl bg-teal-50/40 border border-teal-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-[#0F8F87] text-white px-2 py-0.5 rounded">
                  Months 5–6
                </span>
                <span className="text-xs text-teal-800 font-semibold">Drives & Certification</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                ₹20,000–₹22,000
              </div>
              <p className="text-xs text-slate-500 mt-1">per month</p>

              <div className="mt-4 pt-3 border-t border-teal-200/60 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8F87] flex-shrink-0" />
                  <span>Live company interview participation & sprints</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8F87] flex-shrink-0" />
                  <span>Placement drive readiness & mentor endorsement</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-teal-200/60 text-[11px] font-bold text-[#0F8F87] uppercase tracking-wide">
              PROGRESS ↓ JOB-READY
            </div>
          </div>
        </div>
      </div>

      {/* 2. PROGRAM TIERS: STANDARD VS ADVANCED (Section 27 Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* STANDARD PACKAGE */}
        <div className="card-premium p-6 sm:p-8 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                CORE CURRICULUM TIER
              </span>
              <StatusBadge label="Popular" variant="neutral" size="sm" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                STANDARD
              </h3>
              <div className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                ₹1.2 LAKH
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                + applicable 18% GST (Total: ₹1,41,600)
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Complete full-stack or specialization training with core project labs and group mentoring.
            </p>

            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Included Features
              </span>
              {[
                'Full 6-Month Specialization Track Curriculum',
                'Weekly Friday Assessments & Automated Scoring',
                'Live Agile Capstone Project Experience',
                'Group Mentorship & General SWOT Profiling',
                'HR & Technical Mock Interview Loops (2 Rounds)',
                'Standard Corporate Placement Drive Access',
                'Job-Ready Industry Credential & Public Verification',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-800">
                  <Check className="w-3.5 h-3.5 text-[#0F8F87] flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => navigate('/payments')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>View Fee & Payment Details</span>
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* ADVANCED PACKAGE */}
        <div className="card-premium p-6 sm:p-8 bg-white border-2 border-[#0F8F87] ring-4 ring-[#0F8F87]/10 rounded-2xl shadow-md flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-teal-100">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0F8F87]">
                EXECUTIVE IMMERSION TIER
              </span>
              <StatusBadge label="Enterprise Recommended" variant="teal" size="sm" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                ADVANCED
              </h3>
              <div className="text-3xl font-black text-[#0F8F87] tracking-tight mt-1">
                ₹1.5 LAKH
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                + applicable 18% GST (Total: ₹1,77,000)
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Accelerated high-touch career incubation with dedicated 1:1 senior industry mentors and priority hiring drives.
            </p>

            <div className="space-y-2.5 pt-3 border-t border-teal-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Everything in Standard, plus:
              </span>
              {[
                'Dedicated 1:1 Senior Engineering Director Mentorship',
                'Comprehensive 4-Stage SWOT Diagnostic & Remediation Plan',
                'Multi-Tier Capstone Defense with External Evaluators',
                'Extended Mock Interview Loops (Technical + Executive HR)',
                'Priority Shortlisting in Tier-1 Enterprise Placement Drives',
                'Advanced Architecture & Microservices Masterclass Access',
                'Alumni Executive Network & Post-Placement Career Advisory',
              ].map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                  <Check className="w-3.5 h-3.5 text-[#0F8F87] flex-shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-teal-100">
            <button
              onClick={() => navigate('/payments')}
              className="w-full py-2.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Manage Enrollment & Installments</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
