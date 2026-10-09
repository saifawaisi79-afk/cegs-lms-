import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Users,
  Award,
  Video,
  Target,
  TrendingUp,
  Shield,
  Layers,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [verifyCertId, setVerifyCertId] = useState('');

  const tracks = [
    {
      name: 'Full Stack Development',
      badge: 'High Demand',
      description: 'Master React, TypeScript, Node.js, Express, MongoDB, and Cloud Web Architecture.',
      tech: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker'],
      color: 'border-teal-500/30 bg-teal-50/30',
      badgeColor: 'badge-teal',
    },
    {
      name: 'AI Engineer',
      badge: 'Next-Gen AI',
      description: 'Machine learning fundamentals, deep neural nets, NLP transformers, and GenAI LLM engineering.',
      tech: ['Python', 'PyTorch', 'Transformers', 'LangChain', 'FastAPI'],
      color: 'border-purple-500/30 bg-purple-50/30',
      badgeColor: 'badge-blue',
    },
    {
      name: 'Automation Testing',
      badge: 'Quality Engineering',
      description: 'Enterprise test frameworks with Selenium WebDriver, Playwright, API testing, and CI pipelines.',
      tech: ['Selenium', 'Playwright', 'Java', 'Postman', 'TestNG'],
      color: 'border-emerald-500/30 bg-emerald-50/30',
      badgeColor: 'badge-green',
    },
    {
      name: 'Data Analytics',
      badge: 'Business Intelligence',
      description: 'Modern data workflows with SQL, Python data wrangling, Power BI, and executive analytics.',
      tech: ['SQL', 'Python', 'Power BI', 'Tableau', 'Excel'],
      color: 'border-amber-500/30 bg-amber-50/30',
      badgeColor: 'badge-orange',
    },
    {
      name: 'Cloud & DevOps',
      badge: 'Enterprise Infrastructure',
      description: 'Design resilient architectures with AWS, Azure, Docker containers, Kubernetes, and CI/CD.',
      tech: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform'],
      color: 'border-sky-500/30 bg-sky-50/30',
      badgeColor: 'badge-blue',
    },
  ];

  const journeySteps = [
    { step: '01', title: 'ASSESS', desc: 'Baseline diagnostic assessment of logic and fundamentals' },
    { step: '02', title: 'PERSONALIZE', desc: 'Customized learning milestones and track selection' },
    { step: '03', title: 'LEARN', desc: 'Expert instructor-led sessions and interactive deep dives' },
    { step: '04', title: 'PRACTICE', desc: 'Daily coding labs and architectural challenge problems' },
    { step: '05', title: 'ASSESS', desc: 'Weekly rigorous milestone evaluations with mentor review' },
    { step: '06', title: 'BUILD', desc: 'Enterprise live client capstone projects and Agile sprints' },
    { step: '07', title: 'MENTOR', desc: '1-on-1 career coaching, SWOT analysis, and personality polish' },
    { step: '08', title: 'INTERVIEW', desc: 'HR and Technical mock interview loops with rubric feedback' },
    { step: '09', title: 'PLACEMENT', desc: 'Direct placement drives with partner hiring companies' },
    { step: '10', title: 'CERTIFY', desc: 'Job-Ready Industry Credential with public tamper-proof verification' },
  ];

  const monthsRoadmap = [
    {
      month: 'Month 1',
      title: 'Foundations & Diagnostic Assessment',
      weeks: 'Weeks 1–4',
      items: ['Orientation & Baseline Evaluation', 'Personalized Learning Path', 'Track Fundamentals', 'Assessment & Feedback'],
    },
    {
      month: 'Month 2',
      title: 'Communication & Personality Development',
      weeks: 'Weeks 5–8',
      items: ['Spoken & Written Articulation', 'Executive Presence & Poise', 'SWOT Development & Mentorship', 'First Mock Interview Round'],
    },
    {
      month: 'Month 3',
      title: 'Core Technical Training',
      weeks: 'Weeks 9–12',
      items: ['Core Internal Architecture', 'Intermediate Problem Solving', 'Advanced Specialization Skills', 'Technical Milestone Assessment'],
    },
    {
      month: 'Month 4',
      title: 'Live Projects & Early Interviews',
      weeks: 'Weeks 13–16',
      items: ['Client Capstone Project Kickoff', 'Agile Sprints & Kanban Execution', 'Initial Placement Screening', 'Professional Code Reviews'],
    },
    {
      month: 'Month 5',
      title: 'Interview Preparation & Placement Drives',
      weeks: 'Weeks 17–20',
      items: ['Intensive System Design Prep', 'Corporate Placement Drive Round 1', 'Advanced Project Polish', 'Placement Readiness Coaching'],
    },
    {
      month: 'Month 6',
      title: 'Placement Drive & Job-Ready Certification',
      weeks: 'Weeks 21–24',
      items: ['Final Placement Partner Drives', 'Offer Evaluation & Joining Support', 'Exit Technical Assessment', 'Verified Certification Award'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-[#0F8F87] selection:text-white">
      {/* Public Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0F8F87] flex items-center justify-center text-white font-black text-xs shadow-sm">
            CEGS
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-slate-900 uppercase block leading-tight">
              CAREER EXPERT GLOBAL SOLUTIONS
            </span>
            <span className="text-[10px] font-bold text-[#0F8F87] tracking-[0.14em] uppercase block">
              Learning Management System
            </span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <a href="#journey" className="hover:text-[#0F8F87] transition">6-Month Journey</a>
          <a href="#tracks" className="hover:text-[#0F8F87] transition">5 Program Tracks</a>
          <a href="#roadmap" className="hover:text-[#0F8F87] transition">Curriculum Roadmap</a>
          <a href="#verify" className="hover:text-[#0F8F87] transition">Verify Certificate</a>
          <a href="#packages" className="hover:text-[#0F8F87] transition">Stipend & Packages</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-[#0F8F87] transition"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0F8F87] hover:bg-[#0D7A73] rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <span>Candidate Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6 text-center bg-white border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>Official 6-Month Freshers Growth Training Program</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Build Skills. Gain Experience. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Become Job-Ready.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A structured 6-month learning journey combining technical training, mentorship, practical projects, assessments, and interview preparation.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl font-bold text-sm shadow-md shadow-[#0F8F87]/20 flex items-center justify-center gap-2 transition"
            >
              <span>Explore Candidate LMS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#journey"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-bold text-sm shadow-subtle flex items-center justify-center transition"
            >
              Explore 6-Month Journey
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
              <p className="text-2xl font-extrabold text-brand-700">6 Months</p>
              <p className="text-xs text-slate-500 font-medium">Structured Growth Path</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
              <p className="text-2xl font-extrabold text-brand-700">24 Weeks</p>
              <p className="text-xs text-slate-500 font-medium">Weekly Assessments</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
              <p className="text-2xl font-extrabold text-brand-700">5 Tracks</p>
              <p className="text-xs text-slate-500 font-medium">Industry Specializations</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-subtle">
              <p className="text-2xl font-extrabold text-brand-700">1-on-1</p>
              <p className="text-xs text-slate-500 font-medium">Executive Mentorship</p>
            </div>
          </div>
        </div>
      </section>

      {/* The 10-Stage Career Journey Section */}
      <section id="journey" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="badge-teal">Structured Progression</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            The Complete 10-Stage Journey
          </h2>
          <p className="text-sm text-slate-600">
            Carefully architected to transform ambitious graduates into production-ready engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {journeySteps.map((s, idx) => (
            <div
              key={s.step}
              className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:border-brand-300 hover:shadow-card-hover transition relative group"
            >
              <span className="text-[11px] font-extrabold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block mb-3">
                {s.step}
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 tracking-wide mb-1 group-hover:text-brand-600 transition">
                {s.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5 Program Tracks Section */}
      <section id="tracks" className="py-20 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="badge-blue">Industry Alignments</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Five High-Impact Engineering Tracks
            </h2>
            <p className="text-sm text-slate-600">
              Each track is database-driven and maintained by CEGS technical leads with hands-on projects and weekly assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((t) => (
              <div
                key={t.name}
                className="p-6 rounded-2xl bg-white border border-slate-200 shadow-subtle hover:shadow-card-hover transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={t.badgeColor}>{t.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{t.name}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{t.description}</p>
                </div>

                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Core Technologies
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.tech.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 font-medium rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6 Months Roadmap Breakdown */}
      <section id="roadmap" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="badge-orange">Curriculum Architecture</span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            6-Month Program Curriculum
          </h2>
          <p className="text-sm text-slate-600">
            A week-by-week progressive framework designed for holistic technical and professional development.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {monthsRoadmap.map((m) => (
            <div
              key={m.month}
              className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-subtle hover:border-brand-200 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
                  {m.month}
                </span>
                <span className="text-xs font-semibold text-slate-400">{m.weeks}</span>
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">{m.title}</h3>
              <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                {m.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-brand-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Certificate Verification Box */}
      <section id="verify" className="py-16 px-6 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto mb-2">
            <Award className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Verify Candidate Certification
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Employers, recruiters, and institutions can instantly authenticate certificate validity issued by Career Expert Global Solutions.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (verifyCertId.trim()) {
                navigate(`/verify-certificate/${verifyCertId.trim()}`);
              }
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-4"
          >
            <input
              type="text"
              value={verifyCertId}
              onChange={(e) => setVerifyCertId(e.target.value)}
              placeholder="e.g. CEGS-2025-FGT-0182"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition"
            >
              <Search className="w-4 h-4" />
              <span>Verify Now</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            Sample verified certificate: <span className="text-brand-400 font-mono">CEGS-2025-FGT-0182</span>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12 space-y-2">
          <span className="badge-teal">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1.5">What is the structure of the training program?</h4>
            <p className="text-slate-600 leading-relaxed">
              The Freshers Growth Training Program runs for 6 calendar months (24 structured weeks), integrating foundational evaluation, communication coaching, technical immersion, live team capstone development, mock interviews, and placement drives.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1.5">How are weekly assessments evaluated?</h4>
            <p className="text-slate-600 leading-relaxed">
              The platform contains an integrated assessment engine supporting multiple choice, multi-select, and technical problem solving. Results generate real-time performance analytics tracking candidate progress over the 24 weeks.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1.5">What is the monthly training stipend?</h4>
            <p className="text-slate-600 leading-relaxed">
              As outlined in the organizational documentation, eligible candidates receive a monthly training stipend of ₹15,000–₹18,000 during their enrollment, subject to program terms and attendance benchmarks.
            </p>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1.5">How does certification verification work?</h4>
            <p className="text-slate-600 leading-relaxed">
              Each certificate carries a unique tamper-proof identifier. Anyone can verify candidate credential authenticity directly through our public verification URL.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
              CE
            </div>
            <div>
              <p className="font-bold text-white text-sm">Career Expert Global Solutions</p>
              <p className="text-[11px] text-slate-500">Learning Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <button onClick={() => navigate('/login')} className="hover:text-white transition">Candidate Portal</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition">Trainer & Mentor Login</button>
            <button onClick={() => navigate('/login')} className="hover:text-white transition">Admin Console</button>
          </div>

          <p className="text-slate-500 text-[11px]">
            &copy; 2025–2026 Career Expert Global Solutions. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
