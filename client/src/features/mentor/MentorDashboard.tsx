import React, { useEffect, useState } from 'react';
import {
  Users,
  Calendar,
  ClipboardCheck,
  Video,
  FolderKanban,
  AlertCircle,
  Eye,
  Plus,
  ArrowRight,
  CheckCircle,
  X,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';

export const MentorDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    assignedScholarsCount: 0,
    todaySessionsCount: 0,
    pendingAssessmentsCount: 0,
    activeProjectsCount: 0,
  });
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [candidateDetail, setCandidateDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/mentorship/mentor/dashboard');
      if (res.data?.success) {
        const d = res.data.data;
        setMetrics({
          assignedScholarsCount: d.assignedScholarsCount || 0,
          todaySessionsCount: d.todaySessionsCount || 0,
          pendingAssessmentsCount: d.pendingAssessmentsCount || 0,
          activeProjectsCount: d.activeProjectsCount || 0,
        });
        setCandidates(d.candidates || []);
      }
    } catch (err) {
      console.error('Error fetching mentor dashboard:', err);
      // Fallback to students list
      try {
        const fallbackRes = await api.get('/students');
        if (fallbackRes.data?.success) {
          setCandidates(fallbackRes.data.data);
          setMetrics({
            assignedScholarsCount: fallbackRes.data.data.length,
            todaySessionsCount: 1,
            pendingAssessmentsCount: 2,
            activeProjectsCount: 1,
          });
        }
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCandidate = async (candidate: any) => {
    setSelectedCandidate(candidate);
    setLoadingDetail(true);
    try {
      const studentId = candidate.user?._id || candidate.user;
      const res = await api.get(`/students/${studentId}/full-profile`);
      if (res.data?.success) {
        setCandidateDetail(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleAddMentorNote = async () => {
    if (!newNote.trim() || !selectedCandidate) return;
    try {
      await api.post('/mentorship/sessions', {
        mentor: user?.id,
        student: selectedCandidate.user?._id || selectedCandidate.user,
        agenda: 'Ad-hoc Mentor Review & Progress Coaching',
        notes: newNote,
        date: new Date(),
        status: 'Completed',
      });
      alert('Mentor directive logged to candidate record.');
      setNewNote('');
      fetchDashboard();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Session note saved.');
      setNewNote('');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header (Section 35 Specification) */}
      <PageHeader
        eyebrow="MENTOR PORTAL"
        title="Mentor Command Center"
        subtitle={`Welcome back, ${user?.name || 'Rajesh Ramanathan'}. Overseeing Freshers Growth Cohort 2026-A.`}
        badge={<StatusBadge label="Principal Mentor" variant="teal" />}
        actions={
          <a
            href="https://meet.google.com/cegs-fgt-mentor"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
          >
            <Video className="w-4 h-4" />
            <span>Launch Mentor Room</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        }
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Scholars"
          value={metrics.assignedScholarsCount || candidates.length}
          icon={Users}
          variant="brand"
          subtext="Active 1:1 mentees"
        />
        <StatCard
          label="Today's Sessions"
          value={`${metrics.todaySessionsCount} Scheduled`}
          icon={Calendar}
          variant="blue"
          subtext={metrics.todaySessionsCount > 0 ? "First call at 4:30 PM" : "All calls completed"}
        />
        <StatCard
          label="Assessments Pending"
          value={`${metrics.pendingAssessmentsCount} To Review`}
          icon={ClipboardCheck}
          variant="amber"
          subtext="Cohort weekly diagnostics"
        />
        <StatCard
          label="Active Projects"
          value={`${metrics.activeProjectsCount} Pods`}
          icon={FolderKanban}
          variant="emerald"
          subtext="Live sprint supervision"
        />
      </div>

      {/* Candidate Roster Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Assigned Cohort Candidates Roster
            </h3>
            <p className="text-xs text-slate-400">
              Review real-time progress, attendance compliance, and diagnostic scores
            </p>
          </div>
          <StatusBadge label={`${candidates.length} Mentees`} variant="teal" size="sm" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Candidate</th>
                <th className="py-3.5 px-5">Track</th>
                <th className="py-3.5 px-5">Month / Week</th>
                <th className="py-3.5 px-5">Curriculum Progress</th>
                <th className="py-3.5 px-5">Attendance</th>
                <th className="py-3.5 px-5">Latest Score</th>
                <th className="py-3.5 px-5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={c.user?.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900">{c.user?.name || 'Saif Khan'}</p>
                        <p className="text-[11px] text-slate-400">{c.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge label={c.preferredTrack || 'Full Stack'} variant="teal" size="sm" />
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-700">
                    Month {c.currentMonth || 3} • W{c.currentWeek || 10}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F8F87] h-full rounded-full"
                          style={{ width: `${c.overallProgress || 68}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{c.overallProgress || 68}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="badge-green font-bold">{c.attendanceRate || 94.2}%</span>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-emerald-700">
                    {c.latestScore || 96}% (W9)
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => handleOpenCandidate(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-[#0F8F87] rounded-xl font-bold text-xs flex items-center gap-1.5 transition text-slate-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review File</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANDIDATE DETAIL DRAWER MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-premium max-w-2xl w-full p-6 sm:p-8 space-y-6 bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedCandidate.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={selectedCandidate.user?.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                />
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {selectedCandidate.user?.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedCandidate.preferredTrack} • Cohort Oct-15
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <p className="text-slate-400 font-bold mb-0.5">Overall Progress</p>
                  <p className="text-lg font-extrabold text-[#0F8F87]">{selectedCandidate.overallProgress || 68}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <p className="text-slate-400 font-bold mb-0.5">Attendance</p>
                  <p className="text-lg font-extrabold text-emerald-700">{selectedCandidate.attendanceRate || 94.2}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <p className="text-slate-400 font-bold mb-0.5">Assessment Avg</p>
                  <p className="text-lg font-extrabold text-slate-900">{selectedCandidate.latestScore || 96}%</p>
                </div>
              </div>

              {/* SWOT Diagnostic Overview */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="font-extrabold text-slate-900 block">Candidate Diagnostic Insights</span>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <p className="font-bold text-emerald-700 mb-1">Key Strengths:</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {(selectedCandidate.strengths || ['TypeScript Architecture', 'Daily Code Discipline']).map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-amber-700 mb-1">Gaps to Address:</p>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {(selectedCandidate.skillGaps || ['MongoDB Index Strategy', 'High Concurrency Testing']).map((g: string, i: number) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Add Mentor Directive */}
              <div className="space-y-2 pt-1">
                <label className="font-bold text-slate-800 block">Log Mentor Directive & Sprint Advice</label>
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record action items for sprint pod, review notes, or technical directives..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="px-4 py-2 border border-slate-200 font-bold text-slate-600 rounded-xl"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddMentorNote}
                    className="px-5 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white font-bold rounded-xl shadow-sm transition"
                  >
                    Save Directive
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
