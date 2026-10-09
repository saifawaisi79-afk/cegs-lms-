import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Clock,
  Video,
  ClipboardCheck,
  Award,
  TrendingUp,
  ExternalLink,
  FolderKanban,
  Briefcase,
  Megaphone,
  CheckCheck,
} from 'lucide-react';
import api from '../../services/api.js';
import { INotification } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { AlertCircle } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);



  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/communication/notifications');
      if (res.data?.success && res.data.data.length > 0) {
        setNotifications(res.data.data);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      setError(true);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = async () => {
    try {
      await api.put('/communication/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const categories = [
    'All',
    'Assessment',
    'Mentorship',
    'Project',
    'Interview',
    'Placement',
    'Certificate',
  ];

  const filtered = notifications.filter((n) => {
    if (activeCategory === 'All') return true;
    return n.type.toLowerCase() === activeCategory.toLowerCase();
  });

  const getCategoryMeta = (type: string) => {
    switch (type.toLowerCase()) {
      case 'interview':
        return { icon: Video, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'Interview' };
      case 'assessment':
        return { icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'Assessment' };
      case 'mentorship':
      case 'mentor':
        return { icon: Clock, color: 'text-sky-600', bg: 'bg-sky-50', badge: 'Mentorship' };
      case 'project':
        return { icon: FolderKanban, color: 'text-purple-600', bg: 'bg-purple-50', badge: 'Project Pod' };
      case 'placement':
        return { icon: Briefcase, color: 'text-teal-600', bg: 'bg-teal-50', badge: 'Placement' };
      case 'certificate':
        return { icon: Award, color: 'text-brand-600', bg: 'bg-brand-50', badge: 'Certificate' };
      default:
        return { icon: Megaphone, color: 'text-slate-600', bg: 'bg-slate-50', badge: 'Announcement' };
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="SYSTEM UPDATES & ANNOUNCEMENTS"
        title="Notification & Activity Center"
        subtitle="Real-time updates regarding new assessments, scheduled mentor discussions, and placement milestones."
        badge={
          unreadCount > 0 ? (
            <StatusBadge label={`${unreadCount} Unread`} variant="orange" />
          ) : (
            <StatusBadge label="All Caught Up" variant="green" />
          )
        }
        actions={
          <button
            onClick={handleMarkAll}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-sm bg-white"
          >
            <CheckCheck className="w-4 h-4 text-[#0F8F87]" />
            <span>Mark All as Read</span>
          </button>
        }
      />

      {/* Categories Filter Tabs (Phase 22 Spec) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notifications List Card */}
      <div className="card-premium p-6 sm:p-7 space-y-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="eyebrow-text text-[11px] text-[#0F8F87] block">REAL-TIME STREAM</span>
            <h3 className="font-extrabold text-sm text-slate-900 mt-0.5">Activity Stream</h3>
          </div>
          <span className="text-xs text-slate-500 font-normal">
            {filtered.length} Notifications
          </span>
        </div>

        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Connection Error"
            description="Failed to load notifications."
            action={{ label: 'Retry', onClick: fetchNotifications }}
          />
        ) : filtered.length === 0 && !loading ? (
          <EmptyState
            icon={Bell}
            title="No notifications in this category"
            description="You are all caught up with your scheduled reminders and alerts."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const meta = getCategoryMeta(n.type);
              const Icon = meta.icon;

              return (
                <div
                  key={n._id}
                  onClick={() => {
                    if (n.link) navigate(n.link);
                  }}
                  className={`py-4 px-3 rounded-xl flex items-start gap-4 transition cursor-pointer group ${
                    !n.isRead ? 'bg-brand-50/40 hover:bg-brand-50/70' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform shadow-subtle`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {meta.badge}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(n.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-brand-700 transition">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {n.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
