import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ClipboardCheck,
  Award,
  BookOpen,
  Users,
  Video,
  FolderKanban,
  Target,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  PlayCircle,
  TrendingUp,
  RefreshCw,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Code2,
  Cpu,
  BarChart3,
  Cloud,
  Briefcase,
  ExternalLink,
  HelpCircle,
  Banknote,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';

interface WeekDetail {
  weekNum: number;
  title: string;
  focus: string;
  keyTopics: string[];
  handsOnLab: string;
  deliverable: string;
}

interface MonthData {
  monthNum: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  stageBadge: string;
  phaseCode: string;
  stipendAmount: string;
  facultyLead: string;
  facultyRole: string;
  gradient: string;
  weeks: WeekDetail[];
  fridayAssessment: {
    title: string;
    description: string;
    format: string;
    passingScore: number;
    durationMinutes: number;
  };
  outcome: string;
  trackHighlights: {
    track: string;
    focus: string;
    primaryTools: string[];
  }[];
}

export const MonthsExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentActiveMonth = user?.studentProfile?.currentMonth || 3;
  const [selectedMonth, setSelectedMonth] = useState<number>(currentActiveMonth);
  const [activeStageStep, setActiveStageStep] = useState<number>(3);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [dbModules, setDbModules] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setError(null);
        const res = await api.get('/curriculum/modules');
        if (res.data?.success) {
          setDbModules(res.data.data);
        } else {
          setError('Failed to fetch modules.');
        }
      } catch (err: any) {
        console.error('Error fetching modules:', err);
        setError(err?.response?.data?.error || 'Failed to fetch curriculum modules.');
      }
    };
    fetchCurriculum();
  }, []);

  // The Signature 10-Stage Continuous Learning Engine
  const pipelineStages = [
    { num: 1, name: 'ASSESS', label: 'Baseline Diagnostic', desc: 'Logic, coding primitives & problem-solving evaluation.' },
    { num: 2, name: 'PERSONALIZE', label: 'Pathway Alignment', desc: 'Custom curriculum pacing & dedicated mentor allocation.' },
    { num: 3, name: 'LEARN', label: 'Concept Input', desc: 'Senior faculty masterclasses & system architecture.' },
    { num: 4, name: 'PRACTICE', label: 'Sprint Coding Labs', desc: 'Daily hands-on problem solving, Git workflows & code drills.' },
    { num: 5, name: 'ASSESS', label: 'Friday Milestones', desc: 'Rigorous weekly timed benchmarks & rubric validation.' },
    { num: 6, name: 'BUILD', label: 'Live Capstone Pods', desc: 'Multi-tenant production software built in Agile squads.' },
    { num: 7, name: 'MENTOR', label: '1:1 SWOT Debrief', desc: 'Weekly senior mentor sessions & SWOT remediation.' },
    { num: 8, name: 'INTERVIEW', label: 'Rigorous Mock Panels', desc: 'Simulated technical whiteboards & behavioral HR loops.' },
    { num: 9, name: 'PLACEMENT', label: 'Corporate Hiring Drives', desc: 'Curated enterprise placement cycles & partner shortlists.' },
    { num: 10, name: 'CERTIFY', label: 'Verifiable Credential', desc: 'Cryptographically authenticated Job-Ready Industry Diploma.' },
  ];

  const baseMonths: MonthData[] = [
    {
      monthNum: 1,
      eyebrow: 'MONTH 01 · FOUNDATIONS & BASELINE DIAGNOSTICS',
      title: 'Foundations & Diagnostic Assessment',
      subtitle:
        'Establish core problem-solving capability, baseline skill diagnostics, and personalized engineering pathway orientation.',
      stageBadge: 'Starting Stage',
      phaseCode: 'PHASE 1: ORIENTATION & FOUNDATIONS',
      stipendAmount: '₹15,000 / Month',
      facultyLead: 'Dr. Vikram Seth',
      facultyRole: 'Lead Academic Architect',
      gradient: 'from-[#0F8F87]/90 via-[#0A615B] to-[#0F172A]',
      weeks: [
        {
          weekNum: 1,
          title: 'Orientation & Skill Assessment',
          focus: 'Baseline diagnostic evaluation of logic, reasoning, and programming fundamentals.',
          keyTopics: ['Platform Onboarding', 'Diagnostic Exam', 'Personal Development Plan'],
          handsOnLab: 'Lab 1.1: Algorithmic Logic & Flow Control Workbench',
          deliverable: 'Diagnostic Scorecard & Baseline Competency Matrix',
        },
        {
          weekNum: 2,
          title: 'Personalized Learning Path',
          focus: 'Track selection alignment, mentor mapping, and development environment setup.',
          keyTopics: ['Track Curriculum Alignment', 'Git & CLI Mastery', 'Dev Environment Setup'],
          handsOnLab: 'Lab 1.2: Enterprise Git Branching & Monorepo Setup',
          deliverable: 'Configured Local Workstation & Verified GitHub Profile',
        },
        {
          weekNum: 3,
          title: 'Track Fundamentals',
          focus: 'Core syntax, algorithmic thinking, and structural language primitives.',
          keyTopics: ['Data Structures & Logic', 'Clean Code Principles', 'Algorithmic Problem Solving'],
          handsOnLab: 'Lab 1.3: Data Structures Implementation in TypeScript/Python',
          deliverable: '5 Passed Algorithm Challenges with Clean PRs',
        },
        {
          weekNum: 4,
          title: 'Assessment & Feedback',
          focus: 'Foundations milestone evaluation with mentor feedback debrief.',
          keyTopics: ['Milestone Assessment', 'Mentor Diagnostic Review', 'Month 2 Readiness Checklist'],
          handsOnLab: 'Lab 1.4: Comprehensive Foundations Code Sandbox Exam',
          deliverable: 'Month 1 Milestone Assessment Cleared (≥70%)',
        },
      ],
      fridayAssessment: {
        title: 'Foundations Milestone Exam & Code Review',
        description: 'Evaluates core syntax understanding, logic formulation, and environment setup accuracy.',
        format: '25 Multiple Choice Questions + 2 Hands-on Coding Challenges',
        passingScore: 70,
        durationMinutes: 60,
      },
      outcome:
        'Clear direction, selected track, current skill level verified, and practical roadmap established for technical acceleration.',
      trackHighlights: [
        { track: 'Full Stack', focus: 'Modern JavaScript, ESNext, TypeScript Types & Node Runtime', primaryTools: ['TypeScript', 'Node.js', 'Git'] },
        { track: 'AI Engineer', focus: 'Python for Engineers, NumPy Vectorization & Linear Algebra', primaryTools: ['Python', 'NumPy', 'Jupyter'] },
        { track: 'QA Automation', focus: 'Test Design Fundamentals, Locators & Jest/PyTest Core', primaryTools: ['Jest', 'Selenium Basics', 'Git'] },
        { track: 'Data Analytics', focus: 'Relational Database Queries, Normalization & SQL Drills', primaryTools: ['PostgreSQL', 'SQL Workbench', 'Excel'] },
        { track: 'Cloud & DevOps', focus: 'Linux OS Internals, Bash Scripting & Network Topologies', primaryTools: ['Bash', 'Linux', 'SSH/Networking'] },
      ],
    },
    {
      monthNum: 2,
      eyebrow: 'MONTH 02 · COMMUNICATION & PERSONALITY DEVELOPMENT',
      title: 'Communication & Personality Development',
      subtitle:
        'Hone professional presence, executive verbal agility, comprehensive SWOT profiling, and first-round interview readiness.',
      stageBadge: 'Personality Polish',
      phaseCode: 'PHASE 2: EXECUTIVE PRESENCE & SWOT',
      stipendAmount: '₹15,000 / Month',
      facultyLead: 'Priya Sharma',
      facultyRole: 'Director of Talent & Leadership',
      gradient: 'from-[#0A615B] via-[#0F8F87]/80 to-[#1E293B]',
      weeks: [
        {
          weekNum: 1,
          title: 'Communication Foundations',
          focus: 'Spoken clarity, active listening, technical storytelling, and business email etiquette.',
          keyTopics: ['Technical Articulation', 'Active Listening in Pods', 'Professional Correspondence'],
          handsOnLab: 'Lab 2.1: 3-Minute Technical Architecture Elevator Pitch',
          deliverable: 'Recorded Loom Video Pitch + Peer Critique',
        },
        {
          weekNum: 2,
          title: 'Professional Presence',
          focus: 'Executive poise, virtual meeting etiquette, stance, and structured response frameworks.',
          keyTopics: ['STAR Framework Technique', 'Non-verbal Communication', 'Slide Deck Presentation'],
          handsOnLab: 'Lab 2.2: STAR Behavioral Situation Drill Simulations',
          deliverable: 'STAR Matrix with 6 Documented Enterprise Scenarios',
        },
        {
          weekNum: 3,
          title: 'SWOT + Mentor Deep Dive',
          focus: 'Comprehensive Strengths, Weaknesses, Opportunities, and Threats profiling with senior mentor.',
          keyTopics: ['Personal SWOT Matrix', 'Remediation Roadmap', 'Confidence Building Drills'],
          handsOnLab: 'Lab 2.3: 1:1 Executive Mentor SWOT Calibration Session',
          deliverable: 'Signed Mentor SWOT Matrix & Action Roadmap',
        },
        {
          weekNum: 4,
          title: 'Mock Interview Cycle 1',
          focus: 'First simulated behavioral and HR interview with detailed rubric scorecard.',
          keyTopics: ['Simulated HR Screening', 'Video Response Analysis', 'Feedback Rubric Review'],
          handsOnLab: 'Lab 2.4: 45-Minute Simulated HR Screen Panel',
          deliverable: 'Verified Rubric Scorecard (Communication ≥8/10)',
        },
      ],
      fridayAssessment: {
        title: 'Verbal & Situational Communication Drill',
        description: 'Assesses presentation delivery, behavioral answers under time pressure, and professional articulation.',
        format: 'Recorded 3-Minute Video Pitch + Situational Judgment Questions',
        passingScore: 75,
        durationMinutes: 45,
      },
      outcome:
        'Improved communication, heightened self-confidence, professional behavior, and foundational interview readiness.',
      trackHighlights: [
        { track: 'Full Stack', focus: 'Defending Frontend Architecture & Sprint Estimation Debriefs', primaryTools: ['Loom', 'Figma', 'Markdown PRs'] },
        { track: 'AI Engineer', focus: 'Explaining AI Probabilistic Output & Ethics to Non-Tech Stakeholders', primaryTools: ['Diagrams.net', 'Pitch Decks'] },
        { track: 'QA Automation', focus: 'Bug Triage Escalation & Quality Gate Defense Presentations', primaryTools: ['Jira Docs', 'Loom Demos'] },
        { track: 'Data Analytics', focus: 'Data Storytelling & Executive C-Suite Insight Briefings', primaryTools: ['PowerBI Stories', 'Slide Decks'] },
        { track: 'Cloud & DevOps', focus: 'Incident Post-Mortem Communication & SLA Negotiations', primaryTools: ['Postmortem Docs', 'PagerDuty Sims'] },
      ],
    },
    {
      monthNum: 3,
      eyebrow: 'MONTH 03 · CORE TECHNICAL IMMERSION',
      title: 'Core Technical Training & Deep Immersion',
      subtitle:
        'Deep technical immersion into track architectures, modern frameworks, data layer design, and advanced problem solving.',
      stageBadge: 'Core Technical Mastery',
      phaseCode: 'PHASE 3: ENTERPRISE ARCHITECTURE',
      stipendAmount: '₹16,500 / Month',
      facultyLead: 'Rajesh Ramanathan',
      facultyRole: 'Principal Technical Architect',
      gradient: 'from-[#0D7A73] via-[#0F8F87] to-[#0A2540]',
      weeks: [
        {
          weekNum: 1,
          title: 'Track Architecture Fundamentals',
          focus: 'Framework runtime internals, asynchronous event loops, component rendering lifecycle.',
          keyTopics: ['Component State Architecture', 'REST & GraphQL Patterns', 'Type Systems'],
          handsOnLab: 'Lab 3.1: High-Throughput Node.js Cluster & Event Loop Profiling',
          deliverable: 'Benchmark Latency Graph & Zero-Downtime Worker API',
        },
        {
          weekNum: 2,
          title: 'Implementation & Data Layer',
          focus: 'Database schema design, indexing strategies, API routing, and authentication security.',
          keyTopics: ['Relational & NoSQL Modeling', 'JWT & Session Security', 'Data Pipeline Aggregations'],
          handsOnLab: 'Lab 3.2: MongoDB Compound Indexes & Aggregation Pipeline',
          deliverable: 'Indexed Schema Passing 10,000 RPS Load Simulation',
        },
        {
          weekNum: 3,
          title: 'Advanced Specialization Skills',
          focus: 'Microservices principles, performance profiling, caching layers, and state optimizations.',
          keyTopics: ['Redis Caching Patterns', 'Memory Leak Profiling', 'Concurrency & Event Emitters'],
          handsOnLab: 'Lab 3.3: Redis In-Memory Cache with TTL & Cache Invalidation',
          deliverable: 'Sub-20ms Response Time API Benchmark Report',
        },
        {
          weekNum: 4,
          title: 'Technical Milestone Assessment',
          focus: 'End-of-month technical comprehensive evaluation simulating hiring tests of tier-1 tech firms.',
          keyTopics: ['Live System Architecture Exam', 'Code Quality Benchmark', 'Peer Code Reviews'],
          handsOnLab: 'Lab 3.4: 90-Minute Production Milestone System Build',
          deliverable: 'Technical Milestone Exam Certificate (Score ≥85%)',
        },
      ],
      fridayAssessment: {
        title: 'Technical Mastery & Architecture Exam',
        description: 'Evaluates database query optimization, framework lifecycle concepts, and API contract designs.',
        format: 'Timed Coding Implementation + Architectural Schema Review (60 mins)',
        passingScore: 75,
        durationMinutes: 60,
      },
      outcome:
        'Stronger technical foundations with practical application, enterprise code discipline, and verifiable track competencies.',
      trackHighlights: [
        { track: 'Full Stack', focus: 'React 18 Fiber, Express API Middleware, MongoDB Aggregations', primaryTools: ['React', 'Express', 'MongoDB', 'Redis'] },
        { track: 'AI Engineer', focus: 'PyTorch Model Training, Vector Embeddings & RAG Architectures', primaryTools: ['PyTorch', 'ChromaDB', 'LangChain'] },
        { track: 'QA Automation', focus: 'Playwright E2E Suite, Cross-Browser Testing & CI GitHub Actions', primaryTools: ['Playwright', 'Allure', 'Docker'] },
        { track: 'Data Analytics', focus: 'Complex Window Functions, Pandas Pipelines & ETL Pipelines', primaryTools: ['PostgreSQL', 'Pandas', 'dbt'] },
        { track: 'Cloud & DevOps', focus: 'Docker Multi-Stage Builds, Kubernetes Pods & Helm Charts', primaryTools: ['Docker', 'Kubernetes', 'Helm'] },
      ],
    },
    {
      monthNum: 4,
      eyebrow: 'MONTH 04 · LIVE CAPSTONES & EARLY INTERVIEWS',
      title: 'Live Projects & Early Corporate Interviews',
      subtitle:
        'Engage in production-style live client capstone sprints, Agile standups, professional workflows, and initial company interview loops.',
      stageBadge: 'Industry Sprints',
      phaseCode: 'PHASE 4: LIVE PRODUCTION CAPSTONES',
      stipendAmount: '₹16,500 / Month',
      facultyLead: 'Suresh Menon',
      facultyRole: 'VP of Engineering Partnerships',
      gradient: 'from-[#0F8F87] via-[#1D4ED8]/60 to-[#0F172A]',
      weeks: [
        {
          weekNum: 1,
          title: 'Project Kickoff & Architecture',
          focus: 'Client requirements briefing, user stories backlog, team role assignment, Git branch strategies.',
          keyTopics: ['PRD Breakdown & Estimation', 'Database Schema Approval', 'CI/CD Pipeline Setup'],
          handsOnLab: 'Lab 4.1: Capstone Pod Agile Board Setup & Repo Scaffolding',
          deliverable: 'Approved Architecture PRD & CI/CD Pipeline Active',
        },
        {
          weekNum: 2,
          title: 'Development Sprint 1',
          focus: 'Core feature delivery sprint, daily standup participation, and pull request code reviews.',
          keyTopics: ['Agile Kanban Execution', 'Feature Module Sprints', 'Automated Unit & E2E Testing'],
          handsOnLab: 'Lab 4.2: Sprint 1 MVP Feature Delivery & Automated Tests',
          deliverable: 'Sprint 1 Burndown Complete + Merged Pull Requests',
        },
        {
          weekNum: 3,
          title: 'Interview Cycle Exposure',
          focus: 'First corporate hiring partner interviews and external evaluator panels.',
          keyTopics: ['Company Partner Shortlists', 'Live Technical Coding Round', 'Debriefing & Gap Analysis'],
          handsOnLab: 'Lab 4.3: Real Partner Tech Screen Simulation & Panel Review',
          deliverable: 'Recruiter Feedback Report & Remediation Plan',
        },
        {
          weekNum: 4,
          title: 'Professional Workflows & Demo',
          focus: 'Enterprise workflows: Git pull request reviews, task management, sprint demos, and executive reporting.',
          keyTopics: ['Git Branch Merges & SemVer', 'Task Velocity Metrics', 'Stakeholder Demo Presentation'],
          handsOnLab: 'Lab 4.4: Executive Capstone Sprint Demo & Release Tag',
          deliverable: 'Live Deployed Staging URL + Release Notes v1.0',
        },
      ],
      fridayAssessment: {
        title: 'Sprint Deliverable & Pull Request Review',
        description: 'Evaluates production code quality, test coverage, pull request description clarity, and sprint adherence.',
        format: 'Pull Request Audit + Sprint Velocity Demonstration',
        passingScore: 80,
        durationMinutes: 60,
      },
      outcome:
        'Real project experience in Agile teams plus initial company interview exposure with actionable recruiter feedback.',
      trackHighlights: [
        { track: 'Full Stack', focus: 'Multi-Tenant Cloud SaaS Platform with Real-Time WebSockets', primaryTools: ['Next.js', 'Socket.io', 'PostgreSQL', 'Stripe'] },
        { track: 'AI Engineer', focus: 'Autonomous Customer Support Copilot with Vector Search RAG', primaryTools: ['FastAPI', 'Qdrant', 'OpenAI API'] },
        { track: 'QA Automation', focus: 'Automated Regression Framework with Parallel Execution', primaryTools: ['Playwright', 'GitHub Actions', 'BrowserStack'] },
        { track: 'Data Analytics', focus: 'End-to-End Financial Intelligence & Fraud Detection BI Dashboard', primaryTools: ['Snowflake', 'dbt', 'Tableau'] },
        { track: 'Cloud & DevOps', focus: 'Zero-Downtime Microservices Deployment on AWS EKS with Terraform', primaryTools: ['Terraform', 'AWS EKS', 'ArgoCD'] },
      ],
    },
    {
      monthNum: 5,
      eyebrow: 'MONTH 05 · PLACEMENT ACCELERATION & DRIVES',
      title: 'Interview Preparation & Placement Drives',
      subtitle:
        'Accelerate placement drives, polish personal brand assets, undergo rigorous mock loops, and attend direct company hiring drives.',
      stageBadge: 'Placement Acceleration',
      phaseCode: 'PHASE 5: PLACEMENT ACCELERATION',
      stipendAmount: '₹18,000 / Month',
      facultyLead: 'Rohit Verma',
      facultyRole: 'Head of Corporate Placement Cell',
      gradient: 'from-[#0A615B] via-[#D97706]/50 to-[#0F172A]',
      weeks: [
        {
          weekNum: 1,
          title: 'Advanced Interview Preparation',
          focus: 'High-frequency DSA problems, track-specific system design questions, and behavioural polish.',
          keyTopics: ['DSA Patterns Speed Drills', 'System Design Whiteboarding', 'Salary Negotiation Prep'],
          handsOnLab: 'Lab 5.1: System Design Whiteboard - Scalable Uber/Twitter Clone',
          deliverable: 'System Architecture Blueprint + Cost Estimation',
        },
        {
          weekNum: 2,
          title: 'Corporate Placement Drives',
          focus: 'Direct campus & virtual hiring drives with hiring partners and client pods.',
          keyTopics: ['Partner Drive Submissions', 'Aptitude & Technical Rounds', 'HR Cultural Fits'],
          handsOnLab: 'Lab 5.2: Live Campus Placement Drive Technical Challenge',
          deliverable: 'Hiring Partner Coding Assessment Submission',
        },
        {
          weekNum: 3,
          title: 'Project Defense + Mock Interviews',
          focus: 'Deep defense of capstone architecture against tough interviewer grilling questions.',
          keyTopics: ['Capstone Architectural Defense', 'Stress Interview Simulations', 'Targeted SWOT Revision'],
          handsOnLab: 'Lab 5.3: 60-Minute Tough Technical Defense Panel',
          deliverable: 'Senior Architect Interview Scorecard (≥8.5/10)',
        },
        {
          weekNum: 4,
          title: 'Placement Readiness & Portfolio Finalization',
          focus: 'ATS-tailored resume, LinkedIn personal brand, GitHub portfolio audit, and corporate onboarding polish.',
          keyTopics: ['ATS 95%+ Resume Score', 'GitHub Portfolio Showcase', 'Recruiter Outreach Scripts'],
          handsOnLab: 'Lab 5.4: Portfolio Showcase Deployment & Resume Polish',
          deliverable: 'Verified ATS Resume Score ≥95% & Published Portfolio',
        },
      ],
      fridayAssessment: {
        title: 'Comprehensive Placement Simulation Panel',
        description: 'Multi-stage interview simulation featuring live algorithmic problem solving and behavioral defense.',
        format: 'Simulated 45-Minute Panel Interview + Coding Whiteboard',
        passingScore: 80,
        durationMinutes: 60,
      },
      outcome:
        'Active interview participation with significantly stronger project articulation and interview performance.',
      trackHighlights: [
        { track: 'Full Stack', focus: 'System Design Scaling, Sharding, Micro-Frontends & Caching', primaryTools: ['Excalidraw', 'System Design', 'K6'] },
        { track: 'AI Engineer', focus: 'MLOps, Model Quantization, Latency Benchmarking & Evaluation', primaryTools: ['vLLM', 'Ollama', 'MLflow'] },
        { track: 'QA Automation', focus: 'Performance & Chaos Engineering, Load Stress Testing', primaryTools: ['JMeter', 'K6', 'Chaos Mesh'] },
        { track: 'Data Analytics', focus: 'Executive Data Case Interviews, Hypothesis Testing & A/B Tests', primaryTools: ['SciPy', 'Statsmodels', 'SQL'] },
        { track: 'Cloud & DevOps', focus: 'Security Auditing, SOC2 Compliance, Cost Optimization & FinOps', primaryTools: ['AWS Well-Architected', 'Infracost'] },
      ],
    },
    {
      monthNum: 6,
      eyebrow: 'MONTH 06 · JOB-READY CERTIFICATION & OFFERS',
      title: 'Final Drives, Offer Support & Job-Ready Certification',
      subtitle:
        'Managerial rounds, formal offer evaluation and onboarding support, culminating in the prestigious Job-Ready Industry Certification.',
      stageBadge: 'Offer & Certification',
      phaseCode: 'PHASE 6: OFFERS & EXIT CONFERRAL',
      stipendAmount: '₹18,000 / Month',
      facultyLead: 'Academic Director Board',
      facultyRole: 'Credential Governance Committee',
      gradient: 'from-[#0A615B] via-[#C9A227]/60 to-[#0F172A]',
      weeks: [
        {
          weekNum: 1,
          title: 'Final Placement Drives',
          focus: 'Ongoing company interview cycles, fast-track evaluations, and client interviews.',
          keyTopics: ['Executive Round Scheduling', 'Drive Prioritization', 'Offer Funnel Tracking'],
          handsOnLab: 'Lab 6.1: Partner Fast-Track Final Rounds Coordination',
          deliverable: 'Candidate Interview Funnel Tracker Active',
        },
        {
          weekNum: 2,
          title: 'Managerial & Leadership Rounds',
          focus: 'Director and VP level alignment discussions, cultural values, and problem ownership.',
          keyTopics: ['Director Level Interviews', 'Cross-functional Collaboration', 'Growth Mindset Defense'],
          handsOnLab: 'Lab 6.2: Leadership Round Defense Prep Simulation',
          deliverable: 'Executive Behavioral Endorsement Passed',
        },
        {
          weekNum: 3,
          title: 'Offer Evaluation & Support',
          focus: 'Compensation review, contract understanding, background verification prep, and corporate transition guidance.',
          keyTopics: ['Offer Letter Audit', 'Background Verification Prep', 'Corporate Transition Readiness'],
          handsOnLab: 'Lab 6.3: Compensation Offer Structure & Tax Optimization',
          deliverable: 'Formal Offer Evaluation Checklist Completed',
        },
        {
          weekNum: 4,
          title: 'Final Assessment & Job-Ready Certification',
          focus: 'Program completion evaluation and awarding of the tamper-proof CEGS Job-Ready Industry Credential.',
          keyTopics: ['Comprehensive Exit Evaluation', 'Credential Issuance', 'Alumni Network Onboarding'],
          handsOnLab: 'Lab 6.4: Grand Exit Defense & Cryptographic Key Generation',
          deliverable: 'Conferred Official Job-Ready Certification Diploma',
        },
      ],
      fridayAssessment: {
        title: 'Grand Exit Defense & Credential Validation',
        description: 'Final program evaluation certifying technical competence, project leadership, and career readiness.',
        format: 'Executive Committee Presentation + Credential Issuance',
        passingScore: 85,
        durationMinutes: 60,
      },
      outcome:
        'Program completion with verifiable corporate offers, enterprise placement outcomes, and industry-recognized Job-Ready Certification.',
      trackHighlights: [
        { track: 'Full Stack', focus: 'Official Conferral: Certified Full Stack Enterprise Architect', primaryTools: ['CEGS Diploma', 'GitHub Verified'] },
        { track: 'AI Engineer', focus: 'Official Conferral: Certified Applied AI & Machine Learning Engineer', primaryTools: ['CEGS Diploma', 'HuggingFace'] },
        { track: 'QA Automation', focus: 'Official Conferral: Certified Enterprise Quality Assurance Engineer', primaryTools: ['CEGS Diploma', 'Verified Test Suite'] },
        { track: 'Data Analytics', focus: 'Official Conferral: Certified Business Intelligence & Data Specialist', primaryTools: ['CEGS Diploma', 'Executive Portfolio'] },
        { track: 'Cloud & DevOps', focus: 'Official Conferral: Certified Production Cloud & DevOps Engineer', primaryTools: ['CEGS Diploma', 'Terraform Modules'] },
      ],
    },
  ];

  const months = baseMonths.map(m => {
    const match = dbModules.find(d => d.monthNumber === m.monthNum);
    if (match) {
      return { ...m, title: match.title, subtitle: match.description || m.subtitle };
    }
    return m;
  });

  const activeMonthData = months.find((m) => m.monthNum === selectedMonth) || months[2];

  if (error) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-rose-100 shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Failed to Load Curriculum</h3>
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Editorial Page Header */}
      <PageHeader
        eyebrow="CEGS 6-MONTH ACADEMIC CURRICULUM & ARCHITECTURE"
        title="6-Month Job-Ready Program Journey"
        subtitle="Explore the structured month-by-month progression designed around Career Expert Global Solutions' signature career acceleration engine: ASSESS → PERSONALIZE → LEARN → PRACTICE → ASSESS → BUILD → MENTOR → INTERVIEW → PLACEMENT → CERTIFY."
        badge={
          <StatusBadge
            label={`Current: Month ${currentActiveMonth} Active`}
            variant="teal"
          />
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/learning')}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#0F8F87]" />
              <span>Jump to Lessons</span>
            </button>
            <button
              onClick={() => navigate('/assessments')}
              className="px-4 py-2 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Friday Assessments</span>
            </button>
          </div>
        }
      />

      {/* =========================================================================
          SECTION 1: SIGNATURE 10-STAGE CONTINUOUS LEARNING ENGINE PIPELINE
          ========================================================================= */}
      <div className="card-premium rounded-2xl p-6 bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0F8F87] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0F8F87]">
                THE 10-STAGE CAREER ACCELERATION ENGINE
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
              How CEGS Transforms Ambitious Graduates Into Production-Ready Engineers
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            Click any stage to inspect its purpose & deliverables
          </span>
        </div>

        {/* Horizontal Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-1">
          {pipelineStages.map((stg) => {
            const isCurrent = stg.num === activeStageStep;
            const isCompleted = stg.num < activeStageStep;

            return (
              <button
                key={stg.num}
                onClick={() => setActiveStageStep(stg.num)}
                className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'border-[#0F8F87] bg-teal-50/70 shadow-sm ring-2 ring-[#0F8F87]/20'
                    : isCompleted
                    ? 'border-emerald-200/80 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[9px] font-black font-mono px-1.5 py-0.5 rounded ${
                        isCurrent
                          ? 'bg-[#0F8F87] text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      0{stg.num}
                    </span>
                    {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                    {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-[#0F8F87] animate-ping" />}
                  </div>
                  <h4 className={`text-[11px] font-extrabold tracking-tight ${isCurrent ? 'text-teal-950' : 'text-slate-900'}`}>
                    {stg.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-tight">
                    {stg.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Stage Spotlight Callout */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#0F8F87] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              0{activeStageStep}
            </div>
            <div>
              <strong className="text-slate-900 font-bold">
                Stage {activeStageStep}: {pipelineStages[activeStageStep - 1]?.name} — {pipelineStages[activeStageStep - 1]?.label}
              </strong>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {pipelineStages[activeStageStep - 1]?.desc}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-[#0F8F87] uppercase tracking-wider flex items-center gap-1 self-start sm:self-auto">
            <span>Core Program Guarantee</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: ULTRA-MODERN MONTH TABS SELECTOR (01 - 06)
          ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
            Select Curriculum Month
          </span>
          <span className="text-xs text-slate-500">
            Viewing <strong className="text-slate-900 font-bold">Month {selectedMonth} of 6</strong> ({activeMonthData.phaseCode})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {months.map((m) => {
            const isSelected = m.monthNum === selectedMonth;
            const isCurrent = m.monthNum === currentActiveMonth;
            const isCompleted = m.monthNum < currentActiveMonth;

            return (
              <button
                key={m.monthNum}
                onClick={() => setSelectedMonth(m.monthNum)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white border-[#0F8F87] shadow-md ring-2 ring-[#0F8F87]/20 scale-[1.01]'
                    : isCompleted
                    ? 'bg-white/95 border-emerald-200/80 hover:border-emerald-300 shadow-sm'
                    : 'bg-white/90 border-slate-200/80 hover:border-slate-300 hover:bg-white shadow-xs'
                }`}
              >
                {/* Active indicator bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#0F8F87]" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-[#0F8F87] text-white'
                          : isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      MONTH 0{m.monthNum}
                    </span>

                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cleared</span>
                      </span>
                    )}
                    {isCurrent && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[#0F8F87]">
                        <span className="w-2 h-2 rounded-full bg-[#0F8F87] animate-ping" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-1">
                    {m.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {m.stageBadge}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>4 Weeks</span>
                  <span className={isSelected ? 'text-[#0F8F87] font-bold' : ''}>
                    {m.stipendAmount.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: TWO-COLUMN EDITORIAL HERO FOR THE SELECTED MONTH
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (5 cols): Large Photography & Governance Panel */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Visual Gradient Card */}
          <div className="card-premium overflow-hidden text-white relative rounded-2xl shadow-xl min-h-[480px] flex flex-col justify-between p-7 border border-slate-800">
            {/* Background artistic texture and gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${activeMonthData.gradient} opacity-95`} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

            {/* Top header overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.14em] bg-white/15 text-white backdrop-blur-md border border-white/20">
                Month 0{activeMonthData.monthNum} of 06
              </span>
              <span className="text-[11px] font-semibold text-teal-200">
                {activeMonthData.stageBadge}
              </span>
            </div>

            {/* Middle visual focus badge */}
            <div className="relative z-10 my-auto py-6">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-300 mb-4 shadow-lg">
                <Sparkles className="w-7 h-7" />
              </div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-teal-300 font-extrabold mb-1">
                {activeMonthData.eyebrow}
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {activeMonthData.title}
              </h2>
              <p className="text-xs text-white/80 leading-relaxed mt-2.5 max-w-sm">
                {activeMonthData.subtitle}
              </p>
            </div>

            {/* Bottom summary indicator */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/85">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                <span>4 Weeks • 160 Hours Immersion</span>
              </span>
              <span className="text-teal-300 font-bold flex items-center gap-1">
                <span>Friday Exams</span>
                <Check className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Stipend & Governance Status Card */}
          <div className="card-premium rounded-2xl p-5 bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8F87]">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    MONTHLY ALLOWANCE
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    {activeMonthData.stipendAmount} Stipend Eligibility
                  </h4>
                </div>
              </div>
              <StatusBadge label="≥85% Required" variant="teal" size="sm" />
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Enrolled scholars receive this monthly training stipend subject to meeting weekly Friday exam pass marks and biometric/portal cohort attendance benchmarks.
            </p>
          </div>

          {/* Key Outcome & Milestone Deliverable Card */}
          <div className="card-premium rounded-2xl p-5 bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Award className="w-4 h-4 text-[#0F8F87]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-900">
                Verified Milestone Outcome
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {activeMonthData.outcome}
            </p>
          </div>

          {/* Assigned Faculty Lead Card */}
          <div className="card-premium rounded-2xl p-4 bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-800 font-bold">
                <Users className="w-5 h-5 text-[#0F8F87]" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Faculty Supervision Lead
                </p>
                <h4 className="font-bold text-slate-900 text-xs">
                  {activeMonthData.facultyLead}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {activeMonthData.facultyRole}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/mentorship')}
              className="text-[11px] font-bold text-[#0F8F87] hover:underline"
            >
              1:1 Debrief →
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Week-by-Week Content & Friday Assessment */}
        <div className="lg:col-span-7 space-y-6">
          {/* Eyebrow & Headline */}
          <div className="space-y-1">
            <span className="eyebrow-text">{activeMonthData.eyebrow}</span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Four-Week Curriculum Progression & Deliverables
            </h3>
            <p className="text-xs text-slate-500">
              Structured week-by-week syllabus engineered to produce verifiable engineering artifacts every 7 days.
            </p>
          </div>

          {/* 4 Weekly Breakdown Cards */}
          <div className="space-y-4">
            {activeMonthData.weeks.map((week) => {
              const isExpanded = expandedWeek === week.weekNum;

              return (
                <div
                  key={week.weekNum}
                  className="card-premium p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-teal-200 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-teal-50 text-[#0F8F87] border border-teal-200/80 font-mono">
                          WEEK 0{week.weekNum}
                        </span>
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {week.title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1">
                        {week.focus}
                      </p>
                    </div>

                    <button
                      onClick={() => navigate('/learning')}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-[#0F8F87] hover:text-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto border border-slate-200 shadow-2xs"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Open Lesson</span>
                    </button>
                  </div>

                  {/* Hands-on Lab Highlight */}
                  <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#0F8F87] uppercase tracking-wider flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5" />
                        <span>Hands-On Engineering Lab:</span>
                      </span>
                      <span className="text-slate-400 font-medium">Deliverable Required</span>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {week.handsOnLab}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <strong className="text-slate-700">Verified Output:</strong> {week.deliverable}
                    </p>
                  </div>

                  {/* Key Topics Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                      Core Topics:
                    </span>
                    {week.keyTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SIGNATURE FRIDAY ASSESSMENT SPOTLIGHT CARD */}
          <div className="card-premium p-6 bg-gradient-to-br from-teal-50/70 via-white to-emerald-50/40 border border-teal-200/90 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F8F87] text-white flex items-center justify-center shadow-sm">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0F8F87] block">
                    EVERY FRIDAY · MANDATORY MILESTONE DIAGNOSTIC
                  </span>
                  <h4 className="font-extrabold text-base text-slate-900">
                    {activeMonthData.fridayAssessment.title}
                  </h4>
                </div>
              </div>
              <StatusBadge label="Every Friday" variant="teal" size="sm" />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeMonthData.fridayAssessment.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-teal-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Format</span>
                <span className="font-bold text-slate-900">{activeMonthData.fridayAssessment.format}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-teal-100">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Benchmark</span>
                <span className="font-bold text-emerald-700">Min. {activeMonthData.fridayAssessment.passingScore}% to Pass</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-teal-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Duration</span>
                <span className="font-bold text-slate-900">{activeMonthData.fridayAssessment.durationMinutes} Minutes Timed</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500 italic">
                * Weekly assessment scores feed directly into your monthly stipend clearance & corporate placement drive portfolio.
              </p>
              <button
                onClick={() => navigate('/assessments')}
                className="px-5 py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm whitespace-nowrap self-start sm:self-auto"
              >
                <span>Take Weekly Assessment</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: SIGNATURE WEEKLY LEARNING RHYTHM (7-Day Continuous Engine)
          ========================================================================= */}
      <div className="card-premium rounded-2xl p-6 sm:p-8 bg-white border border-slate-100 shadow-sm space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-1">
          <p className="eyebrow-text">THE CEGS CONTINUOUS LEARNING CADENCE</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Every Friday turns learning into measurable progress.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The CEGS 7-day cyclical cadence ensures that concepts learned early in the week are practiced, verified through timed assessment, debriefed with mentors, and refined with zero knowledge debt.
          </p>
        </div>

        {/* 5-Step Visual Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2">
          {[
            {
              day: 'MONDAY',
              step: 'Learn',
              desc: 'Architectural concepts, theory, runtime internals and instructor-led masterclasses.',
              icon: BookOpen,
              badge: 'Concept Input',
            },
            {
              day: 'TUESDAY–THURSDAY',
              step: 'Practice',
              desc: 'Hands-on coding labs, algorithm challenges, pull requests, and live sprint builds.',
              icon: Zap,
              badge: 'Hands-on Labs',
            },
            {
              day: 'FRIDAY',
              step: 'Assess',
              desc: 'Rigorous weekly benchmark exam evaluating the full week’s syllabus and code skills.',
              icon: ClipboardCheck,
              badge: 'Verification Gate',
            },
            {
              day: 'SATURDAY',
              step: 'Review',
              desc: 'Detailed mentor debrief, score rubric analysis, strengths & gap identification.',
              icon: Users,
              badge: '1:1 Mentor Debrief',
            },
            {
              day: 'SUNDAY',
              step: 'Grow',
              desc: 'Personalized action items, targeted remediation coding, and next-week syllabus prep.',
              icon: TrendingUp,
              badge: 'Zero Knowledge Debt',
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isFriday = item.day === 'FRIDAY';

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isFriday
                    ? 'bg-teal-50/80 border-[#0F8F87] shadow-sm ring-1 ring-[#0F8F87]/20'
                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        isFriday
                          ? 'bg-[#0F8F87] text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {item.day}
                    </span>
                    <Icon
                      className={`w-4 h-4 ${
                        isFriday ? 'text-[#0F8F87]' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <h4
                    className={`font-black text-base ${
                      isFriday ? 'text-teal-950' : 'text-slate-900'
                    }`}
                  >
                    {item.step}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] font-semibold text-[#0F8F87]">
                  {item.badge}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: 5-TRACK SPECIALIZATION MAPPING FOR SELECTED MONTH
          ========================================================================= */}
      <div className="card-premium rounded-2xl p-6 sm:p-7 bg-white border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="eyebrow-text">MULTI-TRACK SPECIALIZATION ALIGNMENT</span>
            <h3 className="font-extrabold text-base text-slate-900 mt-0.5">
              How Month 0{activeMonthData.monthNum} Maps Across All 5 Engineering Tracks
            </h3>
            <p className="text-xs text-slate-500">
              Each specialized track executes tailored labs and assessments matching its target industry job profiles.
            </p>
          </div>
          <button
            onClick={() => navigate('/career-tracks')}
            className="text-xs font-bold text-[#0F8F87] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Explore 5 Career Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {activeMonthData.trackHighlights.map((th, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50/60 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0F8F87] block mb-1">
                  TRACK 0{idx + 1}
                </span>
                <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                  {th.track}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {th.focus}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block mb-1">Tools Active:</span>
                <div className="flex flex-wrap gap-1">
                  {th.primaryTools.map((tool, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-slate-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          SECTION 6: PROGRAM ADVISORY & CAREER ACTION FOOTER
          ========================================================================= */}
      <div className="card-premium rounded-2xl p-6 sm:p-8 bg-slate-50 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Academic Support Active
            </span>
            <span className="text-xs text-slate-500">Need clarification on Month 0{activeMonthData.monthNum} deliverables?</span>
          </div>
          <h4 className="font-extrabold text-lg text-slate-900">
            Have questions about your current sprint, weekly assessment, or stipend status?
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your assigned senior mentor and faculty leads review your weekly code commits, rubric scores, and attendance daily. Schedule your 1:1 mentorship session or submit ad-hoc questions anytime through the messaging hub.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate('/mentorship')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition shadow-sm"
          >
            Book 1:1 Mentor Review
          </button>
          <button
            onClick={() => navigate('/learning')}
            className="px-5 py-2.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <span>Start Active Lessons</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

