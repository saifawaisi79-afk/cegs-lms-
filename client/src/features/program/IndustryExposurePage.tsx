import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  Video,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Calendar,
  Building2,
  Check,
  Target,
  FileCode2,
  GitBranch,
  Award,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import api from '../../services/api.js';

export const IndustryExposurePage: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Mentorship Ratio', value: '1:1', sub: 'Dedicated Lead Engineer' },
    { label: 'Agile Capstones', value: '3 Sprints', sub: 'Enterprise Architecture' },
    { label: 'Mock Interview Loops', value: '4 Rounds', sub: 'Technical & HR Rubrics' },
    { label: 'Corporate Exposure', value: '100%', sub: 'Production Workflow Parity' },
  ];

  const [durationMonths, setDurationMonths] = useState<number>(6);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/curriculum/programs');
        if (res.data?.success && res.data.data.length > 0) {
          setDurationMonths(res.data.data[0].durationMonths || 6);
        }
      } catch (err) {
        console.error('Error fetching programs:', err);
      }
    };
    fetchPrograms();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="CAREER ACCELERATION ARCHITECTURE"
        title="Industry Exposure & Enterprise Workflows"
        subtitle="Bridge the gap between academic theory and enterprise engineering. Experience the standards, standups, and code quality demands of top-tier technology companies before day one."
        badge={<StatusBadge label="Enterprise Alignment Engine" variant="teal" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/months')}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition border border-slate-200 shadow-sm flex items-center gap-1.5"
            >
              <span>{durationMonths}-Month Roadmap</span>
            </button>
            <button
              onClick={() => navigate('/career-tracks')}
              className="px-3.5 py-2 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <span>5 Career Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-subtle flex flex-col justify-between"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {item.label}
            </span>
            <div className="my-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {item.value}
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#0F8F87] flex items-center gap-1">
              <Check className="w-3 h-3 text-[#0F8F87]" />
              {item.sub}
            </span>
          </div>
        ))}
      </div>

      {/* 4 REFINED EDITORIAL SECTIONS (Section 25 Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. 1:1 MENTORSHIP */}
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-subtle hover:border-[#0F8F87]/40 transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0F8F87] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                PILLAR 01 · 1-ON-1 GUIDANCE
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8F87]">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                1:1 MENTORSHIP
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct individual engagement with veteran engineering managers, tech leads, and specialized practitioner mentors.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { title: 'Personalized guidance', desc: 'Custom milestone pacing tailored to individual candidate learning curves.' },
                { title: 'Performance feedback', desc: 'Actionable code quality audits, pull request reviews, and rubric scoring.' },
                { title: 'Career direction', desc: 'Continuous SWOT profiling and targeted alignment to tier-1 enterprise roles.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/60 transition">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0F8F87]" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-5 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/mentorship')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#0F8F87] hover:text-white text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 group"
          >
            <span>Open Mentorship Hub</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 2. REAL PROJECTS */}
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-subtle hover:border-[#0F8F87]/40 transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0F8F87] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                PILLAR 02 · PRODUCTION DELIVERABLES
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8F87]">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                REAL PROJECTS
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Production-grade multi-tenant software systems built collaboratively in cross-functional agile pods mimicking real tech teams.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { title: 'Team assignments', desc: 'Real engineering squad dynamics with frontend, backend, database, and QA roles.' },
                { title: 'Development sprints', desc: 'Bi-weekly Agile iterations, backlog grooming, velocity tracking, and sprint reviews.' },
                { title: 'Workflows & Git', desc: 'GitHub pull request reviews, feature branching, merge policies, and CI linting.' },
                { title: 'Code reviews', desc: 'Rigorous peer audits and lead architect sign-offs before code deployment.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/60 transition">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-[#0F8F87]" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-5 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#0F8F87] hover:text-white text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 group"
          >
            <span>Open Projects Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 3. MOCK INTERVIEWS */}
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-subtle hover:border-[#0F8F87]/40 transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0F8F87] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                PILLAR 03 · HIRING SIMULATION
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8F87]">
                <Video className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                MOCK INTERVIEWS
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Realistic simulations recreating top tech firm hiring panels to eliminate interview nervousness and sharpen real-time delivery.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { title: 'Technical Rounds', desc: 'Live algorithmic DSA coding and system architecture whiteboarding sessions.' },
                { title: 'HR & Cultural Fits', desc: 'Behavioral queries, STAR framework drills, and culture contribution assessment.' },
                { title: 'Communication Polish', desc: 'Clarity, conciseness, vocal pacing, and confident corporate executive presence.' },
                { title: 'Detailed Feedback', desc: 'Rubric-backed scorecard pinpointing exact gaps before actual company drives.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/60 transition">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-[#0F8F87]" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-5 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/interviews')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#0F8F87] hover:text-white text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 group"
          >
            <span>Review Mock Interviews</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 4. INDUSTRY EXPOSURE & WORKFLOWS */}
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-200/80 rounded-2xl shadow-subtle hover:border-[#0F8F87]/40 transition flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#0F8F87] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                PILLAR 04 · CORPORATE ONBOARDING
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8F87]">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                INDUSTRY EXPOSURE
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Direct exposure to hiring partners, enterprise tools, standup rituals, and corporate delivery standards.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { title: 'Company interview opportunities', desc: 'Curated recruitment drives with tech product enterprises and IT services firms.' },
                { title: 'Professional workflows', desc: 'Jira-style ticketing, sprint retrospectives, and standup reporting.' },
                { title: 'Guest sessions & webinars', desc: 'Selected industry experts may join webinars and technical masterclasses.' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100/90 hover:bg-slate-100/60 transition">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#0F8F87]" />
                    <span>{item.title}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 pl-5 leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => navigate('/placement')}
            className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-[#0F8F87] hover:text-white text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-2 group"
          >
            <span>View Placement Opportunities</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* CAREFUL NOTE ON INDUSTRY EXPERTS (Preserving prompt requirement 25) */}
      <div className="card-premium p-5 bg-teal-50/50 border border-teal-200/90 rounded-2xl flex items-start gap-3.5 shadow-subtle">
        <div className="w-6 h-6 rounded-lg bg-teal-100 flex items-center justify-center text-[#0F8F87] flex-shrink-0 mt-0.5">
          <Info className="w-3.5 h-3.5" />
        </div>
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-900 font-bold">Important Program Note: </strong>
          Selected industry experts and corporate leaders may join webinars and interactive technical sessions based on guest availability, but specific session frequency is not guaranteed as part of fixed schedule deliverables.
        </div>
      </div>
    </div>
  );
};
