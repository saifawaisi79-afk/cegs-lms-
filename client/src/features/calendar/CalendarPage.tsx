import React, { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Users,
  ClipboardCheck,
  ArrowRight,
  ExternalLink,
  FolderKanban,
  Briefcase,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import api from '../../services/api.js';
import { ICalendarEvent } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<ICalendarEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'agenda' | 'month'>('agenda');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/communication/calendar/events');
        if (res.data?.success && res.data.data.length > 0) {
          setEvents(res.data.data);
        } else {
          // Default realistic events
          setEvents([
            {
              _id: 'ev-1',
              title: 'Masterclass: Distributed Systems & MongoDB Indexing',
              description: 'Live interactive engineering lecture with lead architect.',
              eventType: 'Training',
              startDate: new Date(2026, 9, 2, 10, 0).toISOString(),
              endDate: new Date(2026, 9, 2, 12, 0).toISOString(),
              meetingLink: 'https://meet.google.com/cegs-fgt-class',
            } as any,
            {
              _id: 'ev-2',
              title: '1:1 Mentorship Session with Rajesh Ramanathan',
              description: 'Sprint 2 deliverable review and architectural feedback.',
              eventType: 'Mentorship',
              startDate: new Date(2026, 9, 2, 16, 30).toISOString(),
              endDate: new Date(2026, 9, 2, 17, 15).toISOString(),
              meetingLink: 'https://meet.google.com/cegs-fgt-mentor',
            } as any,
            {
              _id: 'ev-3',
              title: 'Week 10 Milestone Assessment: MongoDB Aggregations',
              description: '45-minute timed examination evaluating database query mastery.',
              eventType: 'Assessment',
              startDate: new Date(2026, 9, 3, 18, 0).toISOString(),
              endDate: new Date(2026, 9, 3, 18, 45).toISOString(),
            } as any,
            {
              _id: 'ev-4',
              title: 'Cognizant Technology Solutions – Technical Round 2',
              description: 'Live coding and distributed architecture interview loop.',
              eventType: 'Interview',
              startDate: new Date(2026, 9, 6, 15, 0).toISOString(),
              endDate: new Date(2026, 9, 6, 16, 0).toISOString(),
              meetingLink: 'https://meet.google.com/cegs-cognizant-round2',
            } as any,
            {
              _id: 'ev-5',
              title: 'Capstone Sprint 2 Code Freeze & Deliverables Review',
              description: 'Final pull request verification and team demo submission.',
              eventType: 'Project',
              startDate: new Date(2026, 9, 9, 23, 59).toISOString(),
              endDate: new Date(2026, 9, 9, 23, 59).toISOString(),
            } as any,
          ]);
        }
      } catch (err) {
        console.error('Error fetching calendar events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const eventCategories = [
    { label: 'All Events', type: 'All' },
    { label: 'Training', type: 'Training' },
    { label: 'Assessment', type: 'Assessment' },
    { label: 'Mentorship', type: 'Mentorship' },
    { label: 'Project', type: 'Project' },
    { label: 'Interview', type: 'Interview' },
  ];

  const filteredEvents =
    activeFilter === 'All'
      ? events
      : events.filter(
          (e) =>
            e.eventType.toLowerCase() === activeFilter.toLowerCase() ||
            (activeFilter === 'Training' && e.eventType === 'Class') ||
            (activeFilter === 'Mentorship' && e.eventType === 'MentorSession')
        );

  const getCategoryBadge = (type: string) => {
    switch (type) {
      case 'Training':
      case 'Class':
        return <StatusBadge label="Training" variant="teal" size="sm" />;
      case 'Assessment':
        return <StatusBadge label="Assessment" variant="orange" size="sm" />;
      case 'Mentorship':
      case 'MentorSession':
        return <StatusBadge label="Mentorship" variant="blue" size="sm" />;
      case 'Project':
      case 'ProjectDeadline':
        return <StatusBadge label="Project Sprint" variant="red" size="sm" />;
      case 'Interview':
      case 'CompanyInterview':
      case 'MockInterview':
        return <StatusBadge label="Interview Loop" variant="green" size="sm" />;
      default:
        return <StatusBadge label={type} variant="neutral" size="sm" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="COHORT SCHEDULE & MILESTONES"
        title="Master Calendar & Schedules"
        subtitle="Synchronized live masterclasses, mentor sessions, milestone exams, and corporate placement drives."
        badge={<StatusBadge label="October 2026" variant="teal" />}
        actions={
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-semibold">
            <button
              onClick={() => setViewMode('agenda')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'agenda'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Agenda List
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'month'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month Grid
            </button>
          </div>
        }
      />

      {/* Category Filter Chips (Phase 24 Spec) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {eventCategories.map((cat) => (
          <button
            key={cat.type}
            onClick={() => setActiveFilter(cat.type)}
            className={`px-3.5 py-1.5 rounded-xl border transition whitespace-nowrap ${
              activeFilter === cat.type
                ? 'bg-[#0F8F87] border-[#0F8F87] text-white shadow-sm font-bold'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* AGENDA VIEW */}
      {viewMode === 'agenda' && (
        <div className="card-premium p-6 sm:p-7 space-y-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="eyebrow-text text-[11px] text-[#0F8F87] block">UPCOMING AGENDA</span>
              <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">
                Upcoming Scheduled Sessions & Milestones
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-normal">
              {filteredEvents.length} Events Listed
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredEvents.map((evt) => (
              <div
                key={evt._id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex flex-col items-center justify-center text-teal-900 flex-shrink-0 group-hover:scale-105 transition-transform">
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      {new Date(evt.startDate).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-base font-extrabold leading-none">
                      {new Date(evt.startDate).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getCategoryBadge(evt.eventType)}
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>
                          {new Date(evt.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                          {new Date(evt.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#0F8F87] transition">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">{evt.description}</p>
                  </div>
                </div>

                {evt.meetingLink && (
                  <a
                    href={evt.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-semibold transition flex items-center gap-2 shadow-sm whitespace-nowrap self-start md:self-auto flex-shrink-0"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Session</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MONTH GRID VIEW */}
      {viewMode === 'month' && (
        <div className="card-premium p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">October 2026 Calendar Grid</h3>
            <span className="text-xs text-slate-400">All Times IST</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-center font-bold text-slate-400 py-1 uppercase tracking-wider">
                {day}
              </div>
            ))}

            {/* October 1 2026 starts Thursday */}
            <div className="p-2 rounded-xl bg-slate-50/20" />
            <div className="p-2 rounded-xl bg-slate-50/20" />
            <div className="p-2 rounded-xl bg-slate-50/20" />

            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasEvents = day === 2 || day === 3 || day === 6 || day === 9;

              return (
                <div
                  key={day}
                  className={`p-2 rounded-xl border min-h-[70px] flex flex-col justify-between transition ${
                    hasEvents
                      ? 'border-brand-200 bg-brand-50/30'
                      : 'border-slate-200/60 bg-white hover:bg-slate-50/60'
                  }`}
                >
                  <span className="font-bold text-xs text-slate-800">{day}</span>
                  {hasEvents && (
                    <div className="space-y-1">
                      {day === 2 && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-100 text-brand-800 truncate">
                          Masterclass + 1:1
                        </div>
                      )}
                      {day === 3 && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 truncate">
                          Assessment Due
                        </div>
                      )}
                      {day === 6 && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 truncate">
                          Cognizant R2
                        </div>
                      )}
                      {day === 9 && (
                        <div className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 truncate">
                          Sprint Freeze
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
