import React, { useEffect, useState } from 'react';
import {
  FolderKanban,
  CheckCircle,
  Clock,
  Plus,
  Github,
  FileText,
  AlertCircle,
  Layers,
  ArrowRight,
  Users,
  Code2,
  Calendar,
  Sparkles,
  CheckCircle2,
  GitBranch,
  FileCode,
  MessageSquare,
  ShieldCheck,
  Download,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api.js';
import { IProject, ITask } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [selectedProject, setSelectedProject] = useState<IProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'sprints' | 'files' | 'feedback'>('overview');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [taskActionError, setTaskActionError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectData();
  }, []);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      const projRes = await api.get('/projects');
      if (projRes.data?.success && projRes.data.data.length > 0) {
        setProjects(projRes.data.data);
        const activeProj = projRes.data.data[0];
        setSelectedProject(activeProj);

        const tasksRes = await api.get(`/projects/tasks/all?projectId=${activeProj._id}`);
        if (tasksRes.data?.success) {
          setTasks(tasksRes.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching project data:', err);
      setError('Failed to load project data.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: 'TODO' | 'IN PROGRESS' | 'REVIEW' | 'COMPLETED') => {
    try {
      setTaskActionError(null);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      const res = await api.put(`/projects/tasks/${taskId}`, { status: newStatus });
      if (!res.data?.success) throw new Error('Update failed');
    } catch (err: any) {
      console.error('Error updating task status:', err);
      setTaskActionError(err?.response?.data?.error || 'Failed to update task status.');
      fetchProjectData(); // Revert on fail
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !newTaskTitle.trim()) return;

    try {
      setTaskActionError(null);
      const res = await api.post('/projects/tasks', {
        project: selectedProject._id,
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        sprintNumber: 2,
      });

      if (res.data?.success) {
        setTasks((prev) => [res.data.data, ...prev]);
        setShowNewTaskModal(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
      } else {
        throw new Error('Create failed');
      }
    } catch (err: any) {
      console.error(err);
      setTaskActionError(err?.response?.data?.error || 'Failed to create work item.');
    }
  };

  const completedTasksCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const projectProgress = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 65;

  const taskColumns: ('TODO' | 'IN PROGRESS' | 'REVIEW' | 'COMPLETED')[] = [
    'TODO',
    'IN PROGRESS',
    'REVIEW',
    'COMPLETED',
  ];

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'red' as const;
      case 'High':
        return 'orange' as const;
      case 'Medium':
        return 'teal' as const;
      default:
        return 'neutral' as const;
    }
  };

  if (error && projects.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to Load Projects"
        description={error}
        action={{ label: 'Retry', onClick: fetchProjectData }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {taskActionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-between">
          <span>{taskActionError}</span>
          <button onClick={() => setTaskActionError(null)} className="text-rose-500 hover:text-rose-700">✕</button>
        </div>
      )}

      {/* Top Action & Project Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-teal-50 text-[#0F8F87] border border-teal-200">
            Sprint 2 of 4 Active
          </span>
          <span className="text-xs text-slate-400 font-medium">Enterprise Capstone Workspace</span>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="h-10 px-4 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-2 shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Work Item</span>
        </button>
      </div>

      {/* PROJECT SUMMARY HERO CARD (Phenomenon Studio Style) */}
      {selectedProject && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-teal-50 text-[#0F8F87] border border-teal-200 uppercase">
                  Enterprise Capstone
                </span>
                <span className="text-xs text-slate-400">
                  Client: <strong className="text-slate-900 font-semibold">{selectedProject.clientOrCompany || 'Global Talent Cloud Inc.'}</strong>
                </span>
                <span className="text-xs text-slate-300">•</span>
                <span className="text-xs text-[#0F8F87] font-bold">Sprint 2 Active</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedProject.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {selectedProject.description}
              </p>

              {/* Technologies */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {((selectedProject.techStack || selectedProject.technologies || ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Docker', 'Redis']) as string[]).map(
                  (tech: string) => (
                    <span
                      key={tech}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-50 text-slate-700 border border-slate-200/80 text-[11px] font-semibold"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Links and Progress */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-4 min-w-[240px]">
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Sprint Progress</span>
                  <span className="text-[#0F8F87]">{projectProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0F8F87] rounded-full transition-all duration-500"
                    style={{ width: `${projectProgress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={selectedProject.repositoryUrl || 'https://github.com/careerexpertglobal/cegs-lms'}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>Repository</span>
                </a>
                <a
                  href={selectedProject.documentationUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="h-9 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition bg-white shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Docs</span>
                </a>
              </div>
            </div>
          </div>

          {/* Sprints Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-emerald-950">
                  Sprint 1: System Baseline & Auth Services
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                  Completed
                </span>
              </div>
              <p className="text-[11px] text-emerald-700">
                Delivered database models, JWT authentication, and automated integration test suites.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F2FBFA] border border-teal-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-teal-950">
                  Sprint 2: Candidate Pipeline & State Engine
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">
                  In Progress
                </span>
              </div>
              <p className="text-[11px] text-teal-700">
                Active sprint. Delivering real-time state updates, drag-and-drop board, and audit trails.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 30 SPEC: WORKSPACE TABS (Overview, Tasks, Sprints, Files, Feedback) */}
      <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs font-bold w-fit border border-slate-200/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'tasks'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('sprints')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'sprints'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sprints
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'files'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`px-4 py-2 rounded-lg transition whitespace-nowrap ${
            activeTab === 'feedback'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Feedback
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-premium p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
              <span className="eyebrow-text">OBJECTIVE</span>
              <h4 className="font-bold text-sm text-slate-900">Project Objective</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Build a production-grade multi-tenant SaaS application that mirrors high-concurrency enterprise requirements, using clean separation of concerns and robust API contracts.
              </p>
            </div>

            <div className="card-premium p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
              <span className="eyebrow-text">ENGINEERING POD</span>
              <h4 className="font-bold text-sm text-slate-900">Assigned Team</h4>
              <div className="space-y-2 text-xs text-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                    SK
                  </div>
                  <span>Saif Khan (Lead Full Stack Developer)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center">
                    PD
                  </div>
                  <span>Pooja Deshmukh (Frontend Developer)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] font-bold flex items-center justify-center">
                    RR
                  </div>
                  <span>Rajesh Ramanathan (Principal Reviewer)</span>
                </div>
              </div>
            </div>

            <div className="card-premium p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
              <span className="eyebrow-text">DELIVERABLES</span>
              <h4 className="font-bold text-sm text-slate-900">Key Milestone Outputs</h4>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Production Docker compose deploy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>90%+ Jest test suite code coverage</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>OpenAPI Swagger schema definition</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {taskColumns.map((colStatus) => {
            const colTasks = tasks.filter((t) => t.status === colStatus);

            // Section 25: Soft gray, Soft teal, Soft amber, Soft green
            const colStyle = {
              'TODO': {
                bg: 'bg-[#F1F4F2]',
                border: 'border-[#E2E8E5]',
                badge: 'bg-white text-[#52606D] border-[#E2E8E5]',
                headerText: 'text-[#17202A]',
              },
              'IN PROGRESS': {
                bg: 'bg-[#E8F7F5]/70',
                border: 'border-[#C5EDE8]',
                badge: 'bg-white text-[#0F8F87] border-[#C5EDE8]',
                headerText: 'text-[#0F8F87]',
              },
              'REVIEW': {
                bg: 'bg-[#FFF7E8]/70',
                border: 'border-[#FED7AA]',
                badge: 'bg-white text-[#D97706] border-[#FED7AA]',
                headerText: 'text-[#D97706]',
              },
              'COMPLETED': {
                bg: 'bg-[#ECF9F0]/70',
                border: 'border-[#BBF7D0]',
                badge: 'bg-white text-[#16A34A] border-[#BBF7D0]',
                headerText: 'text-[#16A34A]',
              },
            }[colStatus];

            return (
              <div
                key={colStatus}
                className={`${colStyle.bg} p-4 rounded-xl border ${colStyle.border} flex flex-col space-y-3 min-h-[460px]`}
              >
                <div className={`flex items-center justify-between pb-2 border-b ${colStyle.border}`}>
                  <span className={`font-black text-xs ${colStyle.headerText} uppercase tracking-wider`}>
                    {colStatus}
                  </span>
                  <span className={`w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center border ${colStyle.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {colTasks.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-[11px] text-foreground-muted italic">
                      No tasks in {colStatus.toLowerCase()}
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task._id}
                        className="card-editorial p-4 space-y-2.5 text-xs bg-white border border-border shadow-card"
                      >
                        <div className="flex items-center justify-between">
                          <StatusBadge
                            label={task.priority}
                            variant={getPriorityBadgeVariant(task.priority)}
                            size="sm"
                          />
                          <span className="text-[10px] text-foreground-muted font-mono">
                            Sprint {task.sprintNumber || 2}
                          </span>
                        </div>

                        <h4 className="font-bold text-[#17202A] leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-[10px] text-foreground-muted">Assigned: Saif</span>

                          <div className="flex items-center gap-1">
                            {taskColumns
                              .filter((c) => c !== colStatus)
                              .map((targetCol) => (
                                <button
                                  key={targetCol}
                                  onClick={() => handleUpdateTaskStatus(task._id, targetCol)}
                                  className="px-1.5 py-0.5 bg-surface-muted hover:bg-[#F2FBFA] hover:text-[#0F8F87] font-bold rounded text-[9px] text-[#17202A] border border-border transition"
                                >
                                  {targetCol === 'IN PROGRESS' ? 'PROGRESS' : targetCol.slice(0, 4)}
                                </button>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: SPRINTS */}
      {activeTab === 'sprints' && (
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-black text-base text-slate-900">Sprint Delivery Schedule</h3>
          <div className="space-y-3">
            {[
              { num: 1, title: 'Sprint 1: Architecture Baseline & Authentication', weeks: 'Weeks 13–14', status: 'Completed', variant: 'green' as const, desc: 'Multi-tenant database collections, token validation, user authorization.' },
              { num: 2, title: 'Sprint 2: Workflow Kanban Board & State Engine', weeks: 'Weeks 15–16', status: 'In Progress', variant: 'teal' as const, desc: 'Drag-and-drop state, candidate stages, and real-time event updates.' },
              { num: 3, title: 'Sprint 3: Analytics Dashboard & Executive Exports', weeks: 'Weeks 17–18', status: 'Upcoming', variant: 'neutral' as const, desc: 'Recharts visual analytics, metrics calculation, and GST receipt integration.' },
              { num: 4, title: 'Sprint 4: CI/CD Deployment & Capstone Defense', weeks: 'Weeks 19–20', status: 'Upcoming', variant: 'neutral' as const, desc: 'Docker containerization, production smoke tests, and mentor presentation.' },
            ].map((sp) => (
              <div key={sp.num} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{sp.title}</span>
                    <StatusBadge label={sp.status} variant={sp.variant} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{sp.desc}</p>
                </div>
                <span className="text-xs text-slate-500 font-bold flex-shrink-0">{sp.weeks}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: FILES */}
      {activeTab === 'files' && (
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-slate-900">Project Artifacts & Specifications</h3>
              <p className="text-xs text-slate-500">Architectural documents, schemas, and PR guidelines</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Download Bundle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Architecture_System_Design.pdf', size: '2.4 MB', type: 'System Architecture Specification' },
              { name: 'Database_ERD_Schema.png', size: '1.1 MB', type: 'MongoDB Collection Relationship Diagram' },
              { name: 'OpenAPI_Swagger_v2.json', size: '480 KB', type: 'REST Endpoint Contract' },
              { name: 'Sprint_2_Code_Review_Checklist.docx', size: '890 KB', type: 'Peer Review Rubric Guidelines' },
            ].map((f, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0F8F87]">
                    <FileCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{f.name}</div>
                    <div className="text-[11px] text-slate-500">{f.type} • {f.size}</div>
                  </div>
                </div>
                <button className="text-xs text-[#0F8F87] font-bold hover:underline">View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="card-premium p-6 sm:p-7 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-black text-base text-slate-900">Mentor & Code Review Feedback</h3>
              <p className="text-xs text-slate-500">Continuous evaluation by assigned engineering leads</p>
            </div>
            <StatusBadge label="Sprint 1 Approved" variant="green" size="sm" />
          </div>

          <div className="space-y-3">
            {[
              {
                author: 'Rajesh Ramanathan (Principal Reviewer)',
                date: '3 days ago',
                note: 'Clean controller-service abstraction on the authentication route. Recommend moving transaction commit checks inside a shared database session hook for Sprint 2.',
                score: '4.8 / 5.0',
              },
              {
                author: 'Priya Sharma (Engineering Lead)',
                date: '1 week ago',
                note: 'Excellent pull request description and test coverage on the multi-tenant middleware. Approved for staging integration.',
                score: '5.0 / 5.0',
              },
            ].map((fb, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{fb.author}</span>
                  <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {fb.score}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  "{fb.note}"
                </p>
                <div className="text-[10px] text-slate-400">{fb.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW TASK MODAL */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-premium max-w-md w-full p-6 space-y-4 bg-white border border-slate-100 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">Create New Sprint Task</h3>
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement schema compound index"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Technical acceptance criteria and edge cases"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e: any) => setNewTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0F8F87] hover:bg-[#0D7A73] text-white font-bold"
                >
                  Create Work Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
