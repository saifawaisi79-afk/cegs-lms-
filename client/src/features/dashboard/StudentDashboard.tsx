import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ClipboardCheck,
  Users,
  Video,
  FolderKanban,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  PlayCircle,
  Briefcase,
  ChevronRight,
  ShieldCheck,
  Flame,
  Compass,
  Search,
  Share2,
  Moon,
  Sun,
  Smartphone,
  X,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';
import { SkeletonDashboard } from '../../components/ui/LoadingSkeleton.js';
import { ActiveLearningProgramsWidget } from './components/ActiveLearningProgramsWidget.js';
import { GrowStatusDonut } from './components/GrowStatusDonut.js';
import { TeamPerformanceWidget } from './components/TeamPerformanceWidget.js';
import { CurriculumSankeyFlow } from './components/CurriculumSankeyFlow.js';
import { LearningTimeEqualizer } from './components/LearningTimeEqualizer.js';
import { LearningCompletionRateCard } from './components/LearningCompletionRateCard.js';
import { GrowlyProfilePhoneCard } from './components/GrowlyProfilePhoneCard.js';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPhoneCard, setShowPhoneCard] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/students/me/dashboard');
        if (res.data?.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpis = dashboardData?.kpis || {
    overallProgress: user?.studentProfile?.overallProgress || 76,
    attendanceRate: 95.0,
    averageAssessmentScore: 88,
    currentStreak: user?.studentProfile?.currentStreak || 14,
  };

  const currentProgram = dashboardData?.currentProgram || {
    title: '6-Month Job-Ready Program',
    trackName:
      (user?.studentProfile?.track as any)?.name ||
      user?.studentProfile?.preferredTrack ||
      'Full Stack Development',
    currentMonth: user?.studentProfile?.currentMonth || 3,
    currentWeek: user?.studentProfile?.currentWeek || 10,
    stageTitle: 'Month 3 — Core Technical Training',
    progress: kpis.overallProgress,
  };

  const currentMonthNum = currentProgram.currentMonth || 3;

  const roadmapMonths = [
    {
      num: 1,
      title: 'Foundations',
      status: currentMonthNum > 1 ? 'completed' : currentMonthNum === 1 ? 'current' : 'upcoming',
      timeline: 'Weeks 1–4',
      stage: 'STARTING',
      description: 'Orientation, diagnostics & track fundamentals',
    },
    {
      num: 2,
      title: 'Communication & Personality',
      status: currentMonthNum > 2 ? 'completed' : currentMonthNum === 2 ? 'current' : 'upcoming',
      timeline: 'Weeks 5–8',
      stage: 'STARTING',
      description: 'Verbal agility, SWOT & professional presence',
    },
    {
      num: 3,
      title: 'Core Technical Training',
      status: currentMonthNum > 3 ? 'completed' : currentMonthNum === 3 ? 'current' : 'upcoming',
      timeline: 'Weeks 9–12',
      stage: 'BUILDING',
      description: 'Architecture, schema design & advanced frameworks',
    },
    {
      num: 4,
      title: 'Live Projects & Early Interviews',
      status: currentMonthNum > 4 ? 'completed' : currentMonthNum === 4 ? 'current' : 'upcoming',
      timeline: 'Weeks 13–16',
      stage: 'BUILDING',
      description: 'Client capstone, agile sprints & partner interviews',
    },
    {
      num: 5,
      title: 'Interview Preparation & Placement',
      status: currentMonthNum > 5 ? 'completed' : currentMonthNum === 5 ? 'current' : 'upcoming',
      timeline: 'Weeks 17–20',
      stage: 'INTERVIEW READY',
      description: 'Mock panels, resume polish & placement drives',
    },
    {
      num: 6,
      title: 'Placement & Certification',
      status: currentMonthNum > 6 ? 'completed' : currentMonthNum === 6 ? 'current' : 'upcoming',
      timeline: 'Weeks 21–24',
      stage: 'JOB READY',
      description: 'Managerial rounds, offers & job-ready credentials',
    },
  ];

  const upcomingActivities = [
    {
      id: 'act-1',
      title: 'Friday Technical Assessment: MongoDB Aggregations',
      category: 'Weekly Evaluation',
      date: 'This Friday',
      time: '60 mins',
      cta: 'View Briefing',
      link: '/assessments',
      icon: ClipboardCheck,
    },
    {
      id: 'act-2',
      title: '1:1 Milestone & SWOT Review with Senior Mentor',
      category: 'Mentorship',
      date: 'Tomorrow',
      time: '4:30 PM IST',
      cta: 'Join Session',
      link: '/mentorship',
      icon: Users,
    },
    {
      id: 'act-3',
      title: 'Sprint 2 Milestone Code Review & Pull Request Audit',
      category: 'Live Project',
      date: 'Sprint End',
      time: '23:59 IST',
      cta: 'Open Project',
      link: '/projects',
      icon: FolderKanban,
    },
    {
      id: 'act-4',
      title: 'Cognizant Technology Solutions – Technical Round 2',
      category: 'Company Interview',
      date: 'Next Week',
      time: '3:00 PM IST',
      cta: 'View Prep',
      link: '/interviews',
      icon: Video,
    },
  ];

  if (loading && !dashboardData) {
    return <SkeletonDashboard />;
  }

  const candidateFirstName = user?.name?.split(' ')[0] || 'Alan';

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* =========================================================================
          SIGNATURE GROWLY 6-WIDGET DASHBOARD GRID (Exact Phenomenon Studio layout)
          ========================================================================= */}
      <div className="space-y-5">
        {/* ROW 1: Active Learning Programs (7 cols) + Grow Status Overview (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 1. Active Learning Programs Widget */}
          <div className="lg:col-span-7 flex flex-col">
            <ActiveLearningProgramsWidget />
          </div>

          {/* 2. Grow Status Overview Widget */}
          <div className="lg:col-span-5 flex flex-col">
            <GrowStatusDonut />
          </div>
        </div>

        {/* ROW 2: Team Performance (3 cols) + Spending Overview (4 cols) + Learning Time & Rate (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 3. Team Performance (3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            <TeamPerformanceWidget />
          </div>

          {/* 4. Spending Overview / Curriculum Flow (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <CurriculumSankeyFlow />
          </div>

          {/* 5 & 6. Learning Time + Learning Completion Rate (5 cols, stacked vertically) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-5">
            <div className="flex-1 flex flex-col">
              <LearningTimeEqualizer />
            </div>
            <div className="flex-1 flex flex-col">
              <LearningCompletionRateCard
                completedPercent={kpis.overallProgress}
                inProgressPercent={100 - kpis.overallProgress}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTINUE LEARNING HERO BANNER
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-[#0F8F87] flex-shrink-0">
            <PlayCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="badge-teal">Month 3 / Week 10</span>
              <span className="text-xs text-slate-400">Estimated: 45 mins</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              MongoDB Schema Design Patterns & Indexing Strategies
            </h3>
            <p className="text-xs text-slate-500">
              Continue where you left off at 45% completion in Lesson 3.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-shrink-0">
          <button
            onClick={() => navigate('/learning')}
            className="px-5 py-2.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
          >
            <span>Continue Learning</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          6-MONTH CAREER GROWTH ROADMAP (Foundations to Certification)
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0F8F87] block">
              CAREER PROGRESSION
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              6-Month Career Growth Roadmap
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Visual roadmap communicating STARTING → BUILDING → INTERVIEW READY → JOB READY.
            </p>
          </div>

          <button
            onClick={() => navigate('/months')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold transition border border-slate-200 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Explore Month 1–6 Details</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#0F8F87]" />
          </button>
        </div>

        {/* 6 Month Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {roadmapMonths.map((m) => {
            const isCompleted = m.status === 'completed';
            const isCurrent = m.status === 'current';

            return (
              <div
                key={m.num}
                onClick={() => navigate('/months')}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#0F8F87] bg-teal-50/40 shadow-sm ring-1 ring-[#0F8F87]/30'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-slate-100 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-[#0F8F87] text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      0{m.num}
                    </span>
                    {isCompleted && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    )}
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#0F8F87] animate-pulse" />
                    )}
                  </div>

                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0F8F87]">
                    MONTH {m.num}
                  </div>
                  <h3
                    className={`font-extrabold text-xs leading-snug mt-1 ${
                      isCurrent
                        ? 'text-slate-950 font-black'
                        : isCompleted
                        ? 'text-slate-900'
                        : 'text-slate-500'
                    }`}
                  >
                    {m.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {m.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                  <span>{m.timeline}</span>
                  {isCurrent && <span className="text-[#0F8F87] font-bold">In Progress</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          UPCOMING ACTIVITIES & MILESTONES
          ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0F8F87] block">
              SCHEDULE & COHORT
            </span>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight mt-0.5">
              Upcoming Milestones
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">4 Active Items</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {upcomingActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                onClick={() => navigate(act.link)}
                className="p-4 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-teal-300 hover:bg-white transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[#0F8F87] flex-shrink-0 group-hover:bg-teal-50 transition-colors shadow-2xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-[#0F8F87] uppercase tracking-wide">
                        {act.category}
                      </span>
                      <span>{act.date}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#0F8F87] transition-colors">
                      {act.title}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span>{act.time}</span>
                      <span className="text-[#0F8F87] font-bold group-hover:translate-x-0.5 transition-transform">
                        {act.cta} →
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
