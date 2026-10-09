import React, { useEffect, useState } from 'react';
import {
  Users,
  Video,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Award,
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  Shield,
  FileCheck2,
  CalendarPlus,
} from 'lucide-react';
import api from '../../services/api.js';
import { IMentorshipSession, ISWOTReview } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { StatCard } from '../../components/ui/StatCard.js';

export const MentorshipPage: React.FC = () => {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<IMentorshipSession[]>([]);
  const [swotReviews, setSwotReviews] = useState<ISWOTReview[]>([]);
  const [activeStage, setActiveStage] = useState<string>('Month 2 Review');
  const [loading, setLoading] = useState(true);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const [bookingForm, setBookingForm] = useState({
    agenda: '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '16:30',
    notes: '',
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessRes, swotRes] = await Promise.all([
        api.get('/mentorship/sessions'),
        api.get(`/mentorship/swot/${user?.id || 'me'}`),
      ]);

      if (sessRes.data?.success) setSessions(sessRes.data.data);
      if (swotRes.data?.success) {
        setSwotReviews(swotRes.data.data);
        if (swotRes.data.data.length > 0) {
          setActiveStage(swotRes.data.data[swotRes.data.data.length - 1].reviewStage);
        }
      }
    } catch (err) {
      console.error('Error fetching mentorship:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleBookSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.agenda.trim()) return;
    try {
      setBookingLoading(true);
      await api.post('/mentorship/sessions', {
        agenda: bookingForm.agenda,
        date: new Date(`${bookingForm.date}T${bookingForm.time || '10:00'}:00`),
        durationMinutes: 45,
        status: 'Scheduled',
        notes: bookingForm.notes,
      });
      alert('Mentorship session scheduled successfully in database!');
      setBookingModalOpen(false);
      setBookingForm({
        agenda: '',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '16:30',
        notes: '',
      });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to book session');
    } finally {
      setBookingLoading(false);
    }
  };

  const stages = ['Initial Review', 'Month 2 Review', 'Month 4 Review', 'Final Review'];
  const currentSWOT = swotReviews.find((r) => r.reviewStage === activeStage) || swotReviews[0] || {
    strengths: [
      'Strong conceptual clarity in TypeScript and React component lifecycles',
      'Consistent daily problem-solving discipline on GitHub',
      'Clear, articulate verbal articulation during technical standups',
    ],
    weaknesses: [
      'Reluctance to push complex MongoDB aggregation pipelines to production without handholding',
      'Needs more practice with Docker containerization under high concurrency',
    ],
    opportunities: [
      'Cognizant and TCS technical hiring drives scheduled for Months 5 & 6',
      'Potential lead architect role in Capstone Sprint 2 HR Cloud team',
    ],
    threats: [
      'High competition in Full Stack market requires distinct live project portfolio',
      'Punctuality score must strictly stay ≥85% for placement drive entry',
    ],
    mentorAdvice:
      'Focus the next two weeks on mastering MongoDB compound indexes and distributed query performance. Your mock interview technical responses are exceptionally sharp.',
  };

  // Real scheduled upcoming sessions from MongoDB
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'Scheduled' || new Date(s.date) >= new Date()
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* TOP CARD: YOUR MENTOR (Phenomenon Studio Style) */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-5">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200"
            alt="Rajesh Ramanathan"
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-[#0F8F87]/20 shadow-sm flex-shrink-0"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Assigned Principal Mentor
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-[#0F8F87] border border-teal-200">
                1:1 Coaching Active
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Rajesh Ramanathan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Specialization: Distributed Systems, Full Stack Architecture & Enterprise SaaS
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1 font-semibold text-[#0F8F87]">
                <Clock className="w-3.5 h-3.5 text-[#0F8F87]" />
                <span>
                  {upcomingSessions.length > 0
                    ? `Next Session: ${new Date(upcomingSessions[0].date).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })} at ${new Date(upcomingSessions[0].date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`
                    : 'Next Milestone: Sprint 2 Architecture Review'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Book Session & Join Call */}
        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setBookingModalOpen(true)}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4 text-[#0F8F87]" />
            <span>Schedule 1:1</span>
          </button>
          <a
            href="https://meet.google.com/cegs-fgt-mentor"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <Video className="w-4 h-4 fill-current" />
            <span>Launch Meeting Room</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* UPCOMING SESSIONS TIMELINE */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0F8F87]" />
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
              Upcoming 1:1 Mentorship Sessions
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Google Meet Integrated</span>
        </div>

        {upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingSessions.map((s) => (
              <div
                key={s._id}
                className="p-5 rounded-xl border border-slate-100 bg-[#F2FBFA]/30 hover:bg-white hover:border-teal-200 transition space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F8F87]">
                    {new Date(s.date).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-[#0F8F87] border border-teal-200">
                    {s.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{s.agenda}</h4>
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                    {s.durationMinutes || 45} mins
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    With {(s.mentor as any)?.name || 'Assigned Mentor'}
                  </span>
                  <a
                    href="https://meet.google.com/cegs-fgt-mentor"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0F8F87] hover:text-[#0D7A73]"
                  >
                    <span>Launch Call</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-3">
            <p className="text-sm font-bold text-slate-900">No Upcoming Mentorship Sessions Scheduled</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Schedule your next 1:1 architectural milestone review, code review, or career strategy session with your assigned mentor.
            </p>
            <button
              onClick={() => setBookingModalOpen(true)}
              className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold shadow-2xs transition"
            >
              Book 1:1 Session Now
            </button>
          </div>
        )}
      </div>

      {/* BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-premium max-w-md w-full p-6 space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-brand-600" />
                <h3 className="font-extrabold text-base text-slate-900">Schedule 1:1 Mentorship</h3>
              </div>
              <button
                onClick={() => setBookingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSession} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Session Agenda / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 2 Architecture Review & MongoDB Indexes"
                  value={bookingForm.agenda}
                  onChange={(e) => setBookingForm({ ...bookingForm, agenda: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    required
                    value={bookingForm.date}
                    onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Time (IST)</label>
                  <input
                    type="time"
                    required
                    value={bookingForm.time}
                    onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Discussion Points / Notes (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Specific questions, GitHub PR link, or blockers..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 font-bold text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-sm transition"
                >
                  {bookingLoading ? 'Booking...' : 'Confirm Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PHASE 13: VISUAL SWOT BOARD (STRENGTHS, WEAKNESSES, OPPORTUNITIES, THREATS) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0F8F87]" />
              <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                Candidate SWOT Development Board
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Evaluated across milestone intervals to track your technical maturity
            </p>
          </div>

          {/* Timeline stage switcher: Initial, Month 2, Month 4, Final */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold w-fit">
            {stages.map((st) => (
              <button
                key={st}
                onClick={() => setActiveStage(st)}
                className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeStage === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Elegant Quadrant Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                  Strengths (Internal Levers)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                Validated
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {currentSWOT.strengths.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span className="font-extrabold text-xs text-rose-950 uppercase tracking-wider">
                  Weaknesses (Areas for Growth)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">
                Focus
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {currentSWOT.weaknesses.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-sky-600" />
                <span className="font-extrabold text-xs text-sky-950 uppercase tracking-wider">
                  Opportunities (External Trajectory)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800">
                High Value
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {currentSWOT.opportunities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                  Threats (Mitigation Protocol)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                Mitigate
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              {currentSWOT.threats.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Mentor Directive / Action Items */}
        {currentSWOT?.mentorAdvice && (
          <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-xs space-y-2">
            <p className="font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0F8F87]" />
              Principal Mentor Directive & Action Items:
            </p>
            <p className="text-teal-900 leading-relaxed italic">
              "{currentSWOT.mentorAdvice}"
            </p>
          </div>
        )}
      </div>

      {/* PAST SESSIONS & ACTION ITEMS */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Past Session Logs & Feedback</h3>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((sess) => (
              <div
                key={sess._id}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{sess.agenda}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      sess.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {sess.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                  <span>
                    Date: {new Date(sess.date).toLocaleDateString()} at{' '}
                    {new Date(sess.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>•</span>
                  <span>Duration: {sess.durationMinutes} mins</span>
                </div>
                {sess.notes && (
                  <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100 mt-1">
                    <strong className="text-slate-800">Action Items:</strong> {sess.notes}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Week 8 Mock Technical Diagnostic & SWOT</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Completed
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">Held on Sept 24 • 45 minutes</p>
              <p className="text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                <strong className="text-slate-800">Action Items:</strong> Refactor React custom hooks and review state management patterns with Zustand before the next sprint deadline.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
