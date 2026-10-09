import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  CheckCheck,
  BarChart3,
  Cloud,
  Sparkles,
  BookOpen,
  Compass,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';

interface TrackItem {
  number: string;
  name: string;
  tagline: string;
  role: string;
  tools: string[];
  outcome: string;
  detailedOutcome: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const CareerTracksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const studentTrack =
    (user?.studentProfile?.track as any)?.name ||
    user?.studentProfile?.preferredTrack ||
    'Full Stack Development';

  const [selectedTrack, setSelectedTrack] = useState<string>(studentTrack);
  const [dbTracks, setDbTracks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setError(null);
        const res = await api.get('/curriculum/tracks');
        if (res.data?.success) {
          setDbTracks(res.data.data);
        } else {
          setError('Failed to fetch tracks.');
        }
      } catch (err: any) {
        console.error('Error fetching tracks:', err);
        setError(err?.response?.data?.error || 'Failed to fetch career tracks.');
      }
    };
    fetchTracks();
  }, []);

  const baseTracks: TrackItem[] = [
    {
      number: '01',
      name: 'FULL STACK DEVELOPMENT',
      tagline: 'Modern Web Architecture & Enterprise APIs',
      role: 'Product-facing web builder',
      tools: ['React', 'Node.js', 'Databases', 'TypeScript', 'Express', 'MongoDB'],
      outcome: 'SHIP A RESPONSIVE FULL-STACK APPLICATION',
      detailedOutcome:
        'Architect, construct, and deploy a complete production-grade web application featuring modern state management, high-performance database aggregations, and enterprise JWT authorization.',
      icon: Code2,
    },
    {
      number: '02',
      name: 'AI ENGINEER',
      tagline: 'Machine Learning, Deep Learning & LLM Workflows',
      role: 'Applied AI problem-solver',
      tools: ['Python', 'Machine Learning', 'Deep Learning', 'NLP', 'Transformers', 'FastAPI'],
      outcome: 'PROTOTYPE AND EXPLAIN AN AI WORKFLOW',
      detailedOutcome:
        'Design, evaluate, and deploy an end-to-end intelligent AI system capable of parsing unstructured data, running inference models, and communicating business explanations with verifiable accuracy.',
      icon: Cpu,
    },
    {
      number: '03',
      name: 'AUTOMATION TESTING',
      tagline: 'Enterprise QA Frameworks & Continuous Verification',
      role: 'Quality and automation engineer',
      tools: ['Selenium', 'Testing Frameworks', 'API Testing', 'Playwright', 'Postman', 'CI/CD'],
      outcome: 'BUILD A RELIABLE AUTOMATED TEST SUITE',
      detailedOutcome:
        'Construct robust test automation suites including UI regression scripts, asynchronous API integration suites, and performance load tests integrated directly into enterprise delivery pipelines.',
      icon: CheckCheck,
    },
    {
      number: '04',
      name: 'DATA ANALYTICS',
      tagline: 'Business Intelligence, Statistical Insight & Reporting',
      role: 'Insight and reporting analyst',
      tools: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel', 'Pandas'],
      outcome: 'TURN DATA INTO A DECISION-READY DASHBOARD',
      detailedOutcome:
        'Wrangle large datasets, formulate complex analytical queries, build statistical predictive views, and craft executive dashboards that drive key corporate business decisions.',
      icon: BarChart3,
    },
    {
      number: '05',
      name: 'CLOUD & DEVOPS',
      tagline: 'Scalable Infrastructure, Containerization & CI/CD Pipelines',
      role: 'Cloud delivery engineer',
      tools: ['AWS', 'Azure', 'CI/CD', 'Docker', 'Kubernetes', 'Terraform'],
      outcome: 'DEPLOY AND MONITOR A PRODUCTION-STYLE SERVICE',
      detailedOutcome:
        'Provision resilient multi-region cloud infrastructures with Docker container clusters, automated deployment pipelines, health monitoring, and zero-downtime rolling updates.',
      icon: Cloud,
    },
  ];
  const displayTracks = baseTracks.map(bt => {
    const dbMatch = dbTracks.find(dt => dt.name.toLowerCase().includes(bt.name.toLowerCase()) || bt.name.toLowerCase().includes(dt.name.toLowerCase()));
    if (dbMatch) {
      return {
        ...bt,
        name: dbMatch.name,
        tagline: dbMatch.description || bt.tagline,
        tools: dbMatch.technologies?.length > 0 ? dbMatch.technologies : bt.tools
      };
    }
    return bt;
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-rose-100 shadow-sm text-center">
          <Compass className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Tracks</h3>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="SPECIALIZATION DOMAINS"
        title="5 Industry Career Tracks"
        subtitle="Rigorous specialized pathways crafted to align candidate competencies with high-growth engineering and technology roles in modern tech enterprises."
        badge={
          <StatusBadge
            label={`Your Enrolled Track: ${studentTrack}`}
            variant="teal"
          />
        }
        actions={
          <button
            onClick={() => navigate('/months')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-2 border border-slate-200"
          >
            <Compass className="w-4 h-4 text-[#0F8F87]" />
            <span>6-Month Roadmap</span>
          </button>
        }
      />

      {/* 5 EDITORIAL TRACK CARDS (Section 24 Specification) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayTracks.map((track) => {
          const Icon = track.icon;
          const isEnrolled = track.name.toLowerCase() === studentTrack.toLowerCase();

          return (
            <div
              key={track.number}
              onClick={() => setSelectedTrack(track.name)}
              className={`card-premium p-6 rounded-2xl flex flex-col justify-between transition-all cursor-pointer shadow-sm ${
                isEnrolled
                  ? 'border-2 border-[#0F8F87] ring-4 ring-[#0F8F87]/10 bg-white'
                  : 'border border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              <div>
                {/* Track Number & Icon */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <span className="text-xl font-black text-[#0F8F87] tracking-tight">
                    {track.number}
                  </span>
                  <div className="flex items-center gap-2">
                    {isEnrolled && (
                      <span className="badge-teal text-[10px] font-bold">
                        Enrolled Track
                      </span>
                    )}
                    <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Track Name & Role */}
                <h3 className="font-black text-base tracking-tight text-slate-900 uppercase">
                  {track.name}
                </h3>
                <p className="text-xs font-medium text-[#0F8F87] mt-1">
                  {track.role}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {track.tagline}
                </p>

                {/* Technology Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Primary Stack & Tools
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {track.tools.map((t: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-50 text-slate-800 border border-slate-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expected Outcome Box */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 block mb-1">
                  Expected Benchmark Outcome
                </span>
                <p className="text-xs font-black text-slate-900 tracking-wide uppercase leading-snug">
                  {track.outcome}
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed mt-2">
                  {track.detailedOutcome}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer Banner */}
      <div className="card-premium p-6 sm:p-7 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1 max-w-xl">
          <span className="eyebrow-text">PERSONALIZED CAREER MAPPING</span>
          <h4 className="font-extrabold text-base text-slate-900">
            Want to review your track progress or switch specialization?
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Candidates undergo diagnostic profiling in Month 1 to lock their final track. Discuss any realignment with your assigned mentor during your scheduled 1:1 session.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mentorship')}
            className="px-4 py-2 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <span>Book Mentor Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
