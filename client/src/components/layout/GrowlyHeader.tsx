import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  MessageSquare,
  LogOut,
  User as UserIcon,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Users,
  Briefcase,
  FolderKanban,
  Video,
  Award,
  TrendingUp,
  Clock,
  Settings,
  CreditCard,
  Target,
  Compass,
  Moon,
  Sun,
  Share2,
  Smartphone,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';
import { INotification } from '../../types/index.js';

interface GrowlyHeaderProps {
  onOpenCommandPalette: () => void;
  onToggleProfileCard?: () => void;
  isProfileCardOpen?: boolean;
}

export const GrowlyHeader: React.FC<GrowlyHeaderProps> = ({
  onOpenCommandPalette,
  onToggleProfileCard,
  isProfileCardOpen = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, switchRoleDemo } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/communication/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        setNotifications([
          {
            _id: 'n1',
            recipient: user?.id || '',
            title: 'Technical Round 2 Scheduled',
            message: 'Cognizant Technology Solutions interview scheduled for Friday at 3:00 PM.',
            type: 'interview',
            link: '/interviews',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'n2',
            recipient: user?.id || '',
            title: 'Friday Assessment Result Published',
            message: 'Week 10 MongoDB Aggregations Assessment: 96% score achieved.',
            type: 'assessment',
            link: '/assessments',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
        ]);
        setUnreadCount(2);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/communication/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      setUnreadCount(0);
    }
  };

  // Determine dynamic title and subtitle based on route
  const getHeaderInfo = () => {
    const p = location.pathname;
    const firstName = user?.name?.split(' ')[0] || 'Saif';

    if (p === '/dashboard' || p === '/') {
      return {
        title: `Good Morning, ${firstName}`,
        subtitle: 'Track your curriculum progress, assessments and placement readiness',
      };
    }
    if (p.startsWith('/learning')) {
      return {
        title: 'Courses & Curriculum',
        subtitle: 'Explore active modules, watch video lessons and track milestones',
      };
    }
    if (p.startsWith('/months')) {
      return {
        title: '6-Month Career Journey',
        subtitle: 'Stage-by-stage progression from Foundations to Job-Ready certification',
      };
    }
    if (p.startsWith('/career-tracks')) {
      return {
        title: '5 Core Career Tracks',
        subtitle: 'Curriculum definitions, skills matrices and track outcomes',
      };
    }
    if (p.startsWith('/assessments')) {
      return {
        title: 'Assessments & Quizzes',
        subtitle: 'Weekly evaluations, algorithmic tests and performance analytics',
      };
    }
    if (p.startsWith('/mentorship')) {
      return {
        title: '1:1 Mentorship & SWOT',
        subtitle: 'Personal coaching sessions, SWOT analysis and mentor feedback',
      };
    }
    if (p.startsWith('/projects')) {
      return {
        title: 'Live Projects & Sprints',
        subtitle: 'Enterprise collaborative workspaces, git repos and sprint tasks',
      };
    }
    if (p.startsWith('/industry-exposure')) {
      return {
        title: 'Industry Exposure & Masterclasses',
        subtitle: 'Corporate expert sessions, guest lectures and tech summits',
      };
    }
    if (p.startsWith('/notifications')) {
      return {
        title: 'Notifications & Alerts',
        subtitle: 'System updates, milestone badges and review feedback',
      };
    }
    if (p.startsWith('/settings') && !p.startsWith('/admin/settings')) {
      return {
        title: 'Platform & Account Settings',
        subtitle: 'Preferences, security credentials, notification channels and integrations',
      };
    }
    if (p.startsWith('/mock-interviews') || p.startsWith('/interviews')) {
      return {
        title: 'Mock Interviews',
        subtitle: 'Technical mock panels, HR evaluations and behavioral coaching',
      };
    }
    if (p.startsWith('/placement')) {
      return {
        title: 'Placement Portal',
        subtitle: 'Company drives, candidate shortlists and job offers journey',
      };
    }
    if (p.startsWith('/calendar')) {
      return {
        title: 'Cohort Master Calendar',
        subtitle: 'Scheduled masterclasses, review loops and submission deadlines',
      };
    }
    if (p.startsWith('/attendance')) {
      return {
        title: 'Attendance Central',
        subtitle: 'Biometric tracking, class presence and 85% threshold verification',
      };
    }
    if (p.startsWith('/stipends')) {
      return {
        title: 'Stipends & Progression',
        subtitle: 'Monthly stipend disbursement tiers (Months 1–4: ₹10K-12K, Months 5–6: ₹20K-22K)',
      };
    }
    if (p.startsWith('/packages')) {
      return {
        title: 'Program Packages',
        subtitle: 'Standard (₹1.2L) vs Advanced (₹1.5L) package comparison',
      };
    }
    if (p.startsWith('/certificates')) {
      return {
        title: 'Credentials & Certificates',
        subtitle: 'Publicly verifiable blockchain-ready completion credentials',
      };
    }
    if (p.startsWith('/payments')) {
      return {
        title: 'Fee Payments & Receipts',
        subtitle: 'Tuition fees, payment milestones and downloadable GST invoices',
      };
    }
    if (p.startsWith('/messages')) {
      return {
        title: 'Direct Messages & Cohort',
        subtitle: 'Real-time discussions with trainers, mentors and cohort peers',
      };
    }
    if (p.startsWith('/profile')) {
      return {
        title: 'Candidate Profile & Portfolio',
        subtitle: 'Your public career portfolio, verified skills and resume link',
      };
    }
    if (p.startsWith('/mentor/mock-interviews')) {
      return {
        title: 'Mentor Mock Interview Panels',
        subtitle: 'Evaluate student technical competencies, behavioral scoring and provide structured feedback',
      };
    }
    if (p.startsWith('/mentor/students')) {
      return {
        title: 'Assigned Scholars & Mentees',
        subtitle: 'Review student code portfolios, SWOT progress and weekly milestones',
      };
    }
    if (p.startsWith('/mentor')) {
      return {
        title: 'Senior Mentor Workspace',
        subtitle: 'Student evaluations, code reviews and SWOT assessment logs',
      };
    }
    if (p.startsWith('/admin/students')) {
      return {
        title: 'Scholar & Cohort Registry',
        subtitle: 'Enrolled student profiles, tracking metrics and batch allocations',
      };
    }
    if (p.startsWith('/admin/batches')) {
      return {
        title: 'Cohort & Batch Management',
        subtitle: 'Batch timelines, student allocations and mentor assignments',
      };
    }
    if (p.startsWith('/admin/mentors')) {
      return {
        title: 'Faculty & Mentor Management',
        subtitle: 'Active mentors, student allocation load and review tracking',
      };
    }
    if (p.startsWith('/admin/payments')) {
      return {
        title: 'Institutional Fee Ledger',
        subtitle: 'Student payment milestones, receipt audits and GST reconciliations',
      };
    }
    if (p.startsWith('/admin/reports')) {
      return {
        title: 'Executive Analytics & Reports',
        subtitle: 'Cohort outcomes, placement metrics and attendance reports',
      };
    }
    if (p.startsWith('/admin/audit-logs')) {
      return {
        title: 'System Audit Logs',
        subtitle: 'Immutable activity timestamps, security and permission logs',
      };
    }
    if (p.startsWith('/admin/settings')) {
      return {
        title: 'System Administration Settings',
        subtitle: 'Global platform configurations, role permissions and academic calendar settings',
      };
    }
    if (p.startsWith('/admin')) {
      return {
        title: 'Executive Admin Dashboard',
        subtitle: 'Cohort operations, financials, mentor allocations and placement funnel',
      };
    }

    return {
      title: 'CEGS LMS Workspace',
      subtitle: 'Career Expert Global Solutions Learning Platform',
    };
  };

  const { title, subtitle } = getHeaderInfo();

  // Navigation Links for Mobile Drawer
  const mobileNavLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: BookOpen },
    { label: 'Curriculum & Courses', path: '/learning', icon: BookOpen },
    { label: '6-Month Career Journey', path: '/months', icon: Compass },
    { label: '5 Career Tracks', path: '/career-tracks', icon: Target },
    { label: 'Assessments', path: '/assessments', icon: ClipboardCheck },
    { label: '1:1 Mentorship', path: '/mentorship', icon: Users },
    { label: 'Live Projects', path: '/projects', icon: FolderKanban },
    { label: 'Mock Interviews', path: '/interviews', icon: Video },
    { label: 'Placement Portal', path: '/placement', icon: Briefcase },
    { label: 'Master Calendar', path: '/calendar', icon: Calendar },
    { label: 'Attendance', path: '/attendance', icon: Clock },
    { label: 'Stipends & Progression', path: '/stipends', icon: TrendingUp },
    { label: 'Certificates', path: '/certificates', icon: Award },
    { label: 'Payments & Fee', path: '/payments', icon: CreditCard },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#F7F9F8]/95 backdrop-blur-md select-none transition-colors border-b border-slate-100/80">
        {/* Exact same container width and padding as the content canvas below */}
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3 min-h-[52px]">
            {/* =========================================================================
                LEFT: TITLE + SUBTITLE (aligned flush with left cards)
                ========================================================================= */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Mobile Drawer Trigger (md:hidden) */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#0F8F87] transition shadow-2xs flex-shrink-0"
                aria-label="Open Navigation"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
                  {title}
                </h1>
                <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
                  {subtitle}
                </p>
              </div>
            </div>

            {/* =========================================================================
                RIGHT: CONTROLS — never wrap, hide lower-priority items at breakpoints
                ========================================================================= */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Search Bar with ⌘K Shortcut */}
              <div className="relative hidden sm:block w-44 lg:w-56 xl:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  readOnly
                  onClick={onOpenCommandPalette}
                  placeholder="Search..."
                  className="w-full h-9 pl-8 pr-9 text-xs bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 focus:outline-none shadow-2xs text-slate-700 transition"
                />
                <kbd
                  onClick={onOpenCommandPalette}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-50 border border-slate-200 rounded cursor-pointer"
                >
                  ⌘K
                </kbd>
              </div>

              {/* Mobile Search Icon */}
              <button
                onClick={onOpenCommandPalette}
                className="sm:hidden w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#0F8F87] transition shadow-2xs"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition shadow-2xs relative ${
                    showNotifications
                      ? 'text-[#0F8F87] border-[#0F8F87]'
                      : 'text-slate-500 hover:text-[#0F8F87] hover:bg-slate-50'
                  }`}
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0F8F87] rounded-full ring-2 ring-white" />
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
                          Notifications
                        </h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-teal-50 text-[#0F8F87] border border-teal-200">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-[#0F8F87] hover:text-[#0D7A73] font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400 font-medium">
                          No new notifications
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (n.link) navigate(n.link);
                              setShowNotifications(false);
                            }}
                            className={`p-3 rounded-xl text-xs cursor-pointer hover:bg-slate-50 transition ${
                              !n.isRead ? 'bg-teal-50/40' : ''
                            }`}
                          >
                            <div className="font-bold text-slate-900">{n.title}</div>
                            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              {n.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Role Switcher Pill — only show on xl+ */}
              <div className="hidden xl:flex items-center h-9 bg-white p-0.5 rounded-xl border border-slate-200 shadow-2xs text-[11px] font-bold">
                <button
                  onClick={() => switchRoleDemo('student')}
                  className={`h-full px-2.5 rounded-lg transition ${
                    role === 'student'
                      ? 'bg-[#0F8F87] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => switchRoleDemo('mentor')}
                  className={`h-full px-2.5 rounded-lg transition ${
                    role === 'mentor'
                      ? 'bg-[#0F8F87] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Mentor
                </button>
                <button
                  onClick={() => switchRoleDemo('admin')}
                  className={`h-full px-2.5 rounded-lg transition ${
                    role === 'admin'
                      ? 'bg-[#0F8F87] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={() => setIsDark(!isDark)}
                className="hidden md:flex w-9 h-9 rounded-xl bg-white border border-slate-200 items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                title="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-90" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500 transition-transform hover:-rotate-12" />
                )}
              </button>

              {/* Share Button — hidden on md and below */}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.href);
                  alert('Workspace URL copied to clipboard!');
                }}
                className="hidden lg:flex h-9 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs items-center gap-1.5"
                title="Share Link"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Share</span>
              </button>

              {/* Oliver Cranston Phone Card Toggle — hidden on md and below */}
              {onToggleProfileCard && (
                <button
                  onClick={onToggleProfileCard}
                  className={`hidden lg:flex h-9 px-3 rounded-xl text-xs font-bold transition shadow-2xs items-center gap-1.5 ${
                    isProfileCardOpen
                      ? 'bg-[#0F8F87] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-[#0F8F87] hover:bg-teal-50'
                  }`}
                  title="Toggle Growly Phone Profile Mockup"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Profile</span>
                </button>
              )}

              {/* User Profile Avatar with Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="h-9 flex items-center gap-1.5 p-1 pr-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition shadow-2xs text-left"
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#0F8F87] text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {user?.name || 'Saif Khan'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {user?.email || 'student@careerexpertglobal.com'}
                      </div>
                      <div className="mt-1.5 flex items-center justify-between">
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-teal-50 text-[#0F8F87] border border-teal-200 uppercase">
                          {(role || 'student').toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: CEGS-0182</span>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0F8F87] transition text-left font-medium"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/payments');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0F8F87] transition text-left font-medium"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Payments & Fee</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 hover:bg-slate-50 hover:text-[#0F8F87] transition text-left font-medium"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Account Settings</span>
                      </button>

                      {/* Role Switcher in dropdown for lg and below */}
                      <div className="pt-1 border-t border-slate-100 xl:hidden">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Switch Role
                        </div>
                        <div className="flex gap-1 px-3 pb-1">
                          {(['student', 'mentor', 'admin'] as const).map((r) => (
                            <button
                              key={r}
                              onClick={() => { switchRoleDemo(r); setShowUserMenu(false); }}
                              className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition capitalize ${
                                role === r
                                  ? 'bg-[#0F8F87] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            logout();
                            navigate('/login');
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-600 hover:bg-rose-50 transition text-left font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r border-slate-200 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F8F87] to-[#14A59C] text-white font-black text-sm flex items-center justify-center shadow-sm">
                    G
                  </div>
                  <div>
                    <span className="font-black text-sm text-slate-900 block uppercase tracking-tight">
                      CEGS LMS
                    </span>
                    <span className="text-[10px] text-[#0F8F87] font-bold tracking-wider uppercase">
                      {(role || 'student').toUpperCase()} PORTAL
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="p-1 bg-slate-100 border border-slate-200 rounded-xl grid grid-cols-3 gap-1 text-xs text-center font-bold">
                <button
                  onClick={() => {
                    switchRoleDemo('student');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-lg ${
                    role === 'student' ? 'bg-[#0F8F87] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => {
                    switchRoleDemo('mentor');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-lg ${
                    role === 'mentor' ? 'bg-[#0F8F87] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Mentor
                </button>
                <button
                  onClick={() => {
                    switchRoleDemo('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-lg ${
                    role === 'admin' ? 'bg-[#0F8F87] text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Workspace Modules
                </div>
                {mobileNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#F2FBFA] text-[#0F8F87]'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-[#0F8F87]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900">{user?.name}</div>
                  <div className="text-[11px] text-slate-500">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
