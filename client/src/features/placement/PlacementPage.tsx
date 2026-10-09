import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Video,
  Award,
  CheckCircle,
  Building,
  Calendar,
  ExternalLink,
  Download,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  Building2,
  FileText,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../../services/api.js';
import { IInterview, IOffer, IJobOpportunity } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { StatCard } from '../../components/ui/StatCard.js';

export const PlacementPage: React.FC = () => {
  const [interviews, setInterviews] = useState<IInterview[]>([]);
  const [offers, setOffers] = useState<IOffer[]>([]);
  const [jobs, setJobs] = useState<IJobOpportunity[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [studentStatus, setStudentStatus] = useState<string>('Training');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [intRes, offRes, jobsRes, statsRes, meRes] = await Promise.all([
          api.get('/placement/interviews'),
          api.get('/placement/offers'),
          api.get('/placement/jobs'),
          api.get('/placement/stats'),
          api.get('/students/me/dashboard').catch(() => null),
        ]);

        if (intRes.data?.success) setInterviews(intRes.data.data);
        if (offRes.data?.success) setOffers(offRes.data.data);
        if (jobsRes.data?.success) setJobs(jobsRes.data.data);
        if (statsRes.data?.success) setStats(statsRes.data.data);
        if (meRes?.data?.data?.student?.placementStatus) {
          setStudentStatus(meRes.data.data.student.placementStatus);
        }
      } catch (err) {
        console.error('Error fetching placement data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Compute 6 Career Journey Stages dynamically from real placement status
  const statusMap: Record<string, number> = {
    'Not Started': 1,
    'Training': 1,
    'In Progress': 2,
    'Interview Preparation': 3,
    'Interview Scheduled': 4,
    'Interview Completed': 4,
    'Interviewing': 4,
    'Awaiting Result': 4,
    'Selected': 4,
    'Offer Received': 5,
    'Offered': 5,
    'Offer Accepted': 6,
    'Placed': 6,
  };
  const currentStageNum = statusMap[studentStatus] || 2;

  const getStageStatus = (stageNum: number) => {
    if (stageNum < currentStageNum) return 'completed';
    if (stageNum === currentStageNum) return 'current';
    return 'upcoming';
  };

  const careerStages = [
    { num: 1, name: 'TRAINING', status: getStageStatus(1), desc: 'Core Technical Immersion' },
    { num: 2, name: 'PROJECTS', status: getStageStatus(2), desc: 'Live Client Capstone Pod' },
    { num: 3, name: 'INTERVIEW PREPARATION', status: getStageStatus(3), desc: 'Mock Loops & System Design' },
    { num: 4, name: 'INTERVIEWS', status: getStageStatus(4), desc: 'Corporate Hiring Drives' },
    { num: 5, name: 'OFFER', status: getStageStatus(5), desc: 'Offer Support & Package Review' },
    { num: 6, name: 'CERTIFICATION / NEXT STEP', status: getStageStatus(6), desc: 'Job-Ready Credential Award' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="CAREER ACCELERATION"
        title="Placement Portal"
        subtitle="Track corporate interview opportunities, evaluation stages, and extended employment offers."
        badge={<StatusBadge label="Placement Pipeline Active" variant="teal" />}
      />

      {/* TOP COMPONENT: CAREER JOURNEY VISUALIZATION (Section 32 Specification) */}
      <div className="card-premium p-6 sm:p-7 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="eyebrow-text">CAREER PROGRESSION</span>
            <h3 className="font-black text-base text-slate-900 tracking-tight mt-0.5">
              Placement Career Journey
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Progressive milestone pathway from technical foundations to corporate offers.
            </p>
          </div>
          <span className="badge-teal self-start sm:self-auto">
            Stage {currentStageNum} of 6 Active
          </span>
        </div>

        {/* Responsible Placement Note */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
          <strong className="text-slate-900 font-semibold">Program Advisory: </strong>
          CEGS provides high-intensity interview opportunities and continuous drive support; final selection is decided by partner companies based on candidate interview performance.
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {careerStages.map((st, i) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';

            return (
              <div
                key={st.num}
                className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-50/70 shadow-sm ring-2 ring-brand-200'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40 text-slate-800'
                    : 'border-slate-200 bg-slate-50/60 text-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        isCurrent
                          ? 'bg-brand-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      Stage {st.num}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />}
                  </div>
                  <p
                    className={`font-bold text-xs mt-1 ${
                      isCurrent ? 'text-brand-950 font-extrabold' : ''
                    }`}
                  >
                    {st.name}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-3 block">
                  {isCurrent ? 'Active Now' : isCompleted ? 'Completed' : 'Upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* OFFERS RECEIVED HIGHLIGHT */}
      {offers.length > 0 && (
        <div className="card-premium p-6 sm:p-7 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-brand-500/10 border-emerald-300 shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                  Official Offer Letter Extended
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {offers[0].companyName} – {offers[0].role}
                </h3>
              </div>
            </div>

            <StatusBadge label={`Status: ${offers[0].status}`} variant="green" size="md" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/80 shadow-subtle">
              <p className="text-slate-400 font-semibold mb-0.5">Annual CTC Package</p>
              <p className="text-lg font-extrabold text-emerald-700">{offers[0].compensation}</p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/80 shadow-subtle">
              <p className="text-slate-400 font-semibold mb-0.5">Job Location</p>
              <p className="text-sm font-bold text-slate-800">{offers[0].location}</p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/80 shadow-subtle">
              <p className="text-slate-400 font-semibold mb-0.5">Target Joining Date</p>
              <p className="text-sm font-bold text-slate-800">
                {offers[0].joiningDate ? new Date(offers[0].joiningDate).toLocaleDateString() : 'Immediate'}
              </p>
            </div>
            <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/80 shadow-subtle flex items-center justify-center">
              <button
                onClick={() => alert('Downloading official CEGS verified offer letter...')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Offer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TWO COLUMN SECTION: INTERVIEW ACTIVITY & PLACEMENT FUNNEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheduled Interviews (7 cols) */}
        <div className="lg:col-span-7 card-premium p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Scheduled Corporate Interviews
              </h3>
              <p className="text-xs text-slate-400">Official technical & HR rounds</p>
            </div>
            <StatusBadge label={`${interviews.length} Scheduled`} variant="teal" size="sm" />
          </div>

          <div className="space-y-3">
            {interviews.map((intv) => (
              <div
                key={intv._id}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-200 transition space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-extrabold text-sm text-slate-900 block">
                      {intv.companyName}
                    </span>
                    <span className="text-slate-600 font-medium">{intv.role}</span>
                  </div>
                  <StatusBadge label={intv.roundName} variant="blue" size="sm" />
                </div>

                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[11px] pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(intv.scheduledAt).toLocaleDateString()} at{' '}
                      {new Date(intv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                  <span>•</span>
                  <span>Mode: {intv.mode}</span>
                  {intv.interviewer && (
                    <>
                      <span>•</span>
                      <span>Panel: {intv.interviewer}</span>
                    </>
                  )}
                </div>

                {intv.meetingLink && (
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Status: {intv.status}</span>
                    <a
                      href={intv.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Launch Interview Room</span>
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Placement Drive Funnel Analytics (5 cols) */}
        <div className="lg:col-span-5 card-premium p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Placement Drive Funnel</h3>
            <p className="text-xs text-slate-400">Cohort progression toward full-time placement</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.funnel || [
                  { stage: 'Enrolled Candidates', count: 14 },
                  { stage: 'Job-Ready Certified', count: 12 },
                  { stage: 'Interviews Scheduled', count: 6 },
                  { stage: 'Offers Extended', count: 2 },
                  { stage: 'Offers Accepted', count: 1 },
                ]}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  tick={{ fontSize: 10, fill: '#334155' }}
                  width={90}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* PARTNER CORPORATE OPENINGS */}
      <div className="card-premium p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">Partner Corporate Openings</h3>
            <p className="text-xs text-slate-400">Direct hiring pipelines with CEGS partner organizations</p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">{jobs.length} Positions Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="p-5 rounded-2xl border border-slate-200/80 bg-white hover:border-brand-300 card-premium-hover transition space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{job.role}</h4>
                  <p className="text-slate-500 font-medium">
                    {job.company?.name || 'Enterprise Partner Network'}
                  </p>
                </div>
                <StatusBadge label={job.salaryRange || '₹5.5 - 7.5 LPA'} variant="teal" size="sm" />
              </div>

              <p className="text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {job.skills?.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
