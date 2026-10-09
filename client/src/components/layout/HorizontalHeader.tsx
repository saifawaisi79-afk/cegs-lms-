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
  Shield,
  GraduationCap,
  Sparkles,
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
  FileText,
  ExternalLink,
  Layers,
  Compass,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';
import { INotification } from '../../types/index.js';
import { StatusBadge } from '../ui/StatusBadge.js';

interface HorizontalHeaderProps {
  onOpenCommandPalette: () => void;
}

interface NavDropdownItem {
  label: string;
  path: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NavDropdownGroup {
  label: string;
  items: NavDropdownItem[];
}

export const HorizontalHeader: React.FC<HorizontalHeaderProps> = ({
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, switchRoleDemo } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveDropdown(null);
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
    setActiveDropdown(null);
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

  // Student Navigation: Exactly 5 items in the center bar
  const studentNav = [
    { label: 'Dashboard', path: '/dashboard' },
    {
      label: 'Learning',
      items: [
        { label: 'My Learning', path: '/learning', description: 'Curriculum, lessons & interactive player', icon: BookOpen },
        { label: '6-Month Career Journey', path: '/months', description: 'Month 1 to 6 visual roadmap & outcomes', icon: Compass },
        { label: '5 Career Tracks', path: '/career-tracks', description: 'Full Stack, AI, QA, Data, Cloud & DevOps', icon: Target },
        { label: 'Industry Exposure', path: '/industry-exposure', description: 'Mentorship, real projects & mock loops', icon: Layers },
      ],
    },
    { label: 'Assessments', path: '/assessments' },
    {
      label: 'Career',
      items: [
        { label: 'Mentorship & SWOT', path: '/mentorship', description: '1:1 mentor coaching & SWOT evaluations', icon: Users },
        { label: 'Live Projects', path: '/projects', description: 'Enterprise workspace, sprints & agile tasks', icon: FolderKanban },
        { label: 'Mock Interviews', path: '/interviews', description: 'Technical & HR interview preparation', icon: Video },
        { label: 'Placement Portal', path: '/placement', description: 'Training to offers journey & applications', icon: Briefcase },
        { label: 'Certificates & Credentials', path: '/certificates', description: 'Publicly verifiable completion certificates', icon: Award },
      ],
    },
    {
      label: 'Progress',
      items: [
        { label: 'Attendance', path: '/attendance', description: 'Biometric tracking & threshold verification', icon: Clock },
        { label: 'Master Calendar', path: '/calendar', description: 'Live classes, workshops & deadlines', icon: Calendar },
        { label: 'Stipends & Progression', path: '/stipends', description: 'Monthly progression (Months 1–4: ₹10K-12K, 5–6: ₹20K-22K)', icon: TrendingUp },
        { label: 'Program Packages', path: '/packages', description: 'Standard (₹1.2L) vs Advanced (₹1.5L) comparison', icon: Sparkles },
      ],
    },
  ];

  // Mentor Navigation
  const mentorNav = [
    { label: 'Dashboard', path: '/mentor' },
    { label: 'Students', path: '/mentor/students' },
    { label: 'Assessments', path: '/assessments' },
    { label: 'Mentorship', path: '/mentorship' },
    {
      label: 'Projects & Reviews',
      items: [
        { label: 'Live Projects', path: '/projects', description: 'Student submissions & agile sprints', icon: FolderKanban },
        { label: 'Mock Interviews', path: '/mentor/mock-interviews', description: 'Candidate technical evaluations', icon: Video },
        { label: 'Master Calendar', path: '/calendar', description: 'Mentoring sessions & milestone reviews', icon: Calendar },
      ],
    },
  ];

  // Admin Navigation
  const adminNav = [
    { label: 'Dashboard', path: '/admin' },
    {
      label: 'People',
      items: [
        { label: 'Students Directory', path: '/admin/students', description: 'Candidate records, cohorts & status', icon: Users },
        { label: 'Mentors & Trainers', path: '/admin/mentors', description: 'Mentor allocation & performance', icon: GraduationCap },
      ],
    },
    {
      label: 'Program',
      items: [
        { label: 'Programs & Batches', path: '/admin/batches', description: 'Cohorts, dates & batch schedules', icon: Calendar },
        { label: '5 Career Tracks', path: '/career-tracks', description: 'Curriculum definitions & track outcomes', icon: Target },
        { label: 'Curriculum & Modules', path: '/learning', description: 'Course content, syllabus & lessons', icon: BookOpen },
        { label: '6-Month Roadmap', path: '/months', description: 'Visual month breakdown & Friday rhythms', icon: Compass },
      ],
    },
    {
      label: 'Evaluation',
      items: [
        { label: 'Assessments & Quizzes', path: '/assessments', description: 'Weekly evaluations & test scores', icon: ClipboardCheck },
        { label: 'Attendance Central', path: '/attendance', description: 'Class logs, biometric sync & reports', icon: Clock },
      ],
    },
    {
      label: 'Operations',
      items: [
        { label: 'Payments & Revenue', path: '/admin/payments', description: 'Fee collections, GST receipts & logs', icon: CreditCard },
        { label: 'Stipends Central', path: '/stipends', description: 'Disbursement schedules & bank transfers', icon: TrendingUp },
        { label: 'Placement Funnel', path: '/placement', description: 'Candidate placement tracking', icon: Briefcase },
        { label: 'Issued Certificates', path: '/certificates', description: 'Certificate issuance & verification', icon: Award },
        { label: 'Executive Reports', path: '/admin/reports', description: 'Cohort analytics & placement KPIs', icon: FileText },
        { label: 'System Audit Logs', path: '/admin/audit-logs', description: 'Security, access & transaction audits', icon: Shield },
      ],
    },
  ];

  const currentNav = role === 'admin' ? adminNav : role === 'mentor' ? mentorNav : studentNav;

  return (
    <>
      <header className="sticky top-0 z-40 h-[68px] bg-white border-b border-[#E2E8E5] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors shadow-header select-none">
        {/* LEFT: CEGS LMS BRAND */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87] transition"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <NavLink
            to={role === 'admin' ? '/admin' : role === 'mentor' ? '/mentor' : '/dashboard'}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0F8F87] text-white font-black text-xs tracking-wider flex items-center justify-center shadow-subtle group-hover:bg-[#0D7A73] transition-colors">
              CEGS
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black tracking-tight text-[#17202A] uppercase leading-none">
                CEGS LMS
              </span>
              <span className="text-[10px] tracking-[0.14em] uppercase text-[#0F8F87] font-bold mt-0.5">
                Career Platform
              </span>
            </div>
          </NavLink>
        </div>

        {/* CENTER: DESKTOP HORIZONTAL NAVIGATION (EXACT 5 ITEMS, NO SCROLL) */}
        <nav ref={navRef} className="hidden lg:flex items-center gap-1 xl:gap-2 flex-shrink-0">
          {currentNav.map((item) => {
            if ('items' in item && item.items) {
              const isGroupActive = item.items.some((sub) => location.pathname === sub.path);
              const isOpen = activeDropdown === item.label;

              return (
                <div key={item.label} className="relative">
                  <button
                    onClick={() => setActiveDropdown(isOpen ? null : item.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                      isGroupActive || isOpen
                        ? 'text-[#0F8F87] bg-[#F2FBFA] font-semibold border-b-2 border-[#0F8F87]'
                        : 'text-[#52606D] hover:text-[#0F8F87] hover:bg-[#F2FBFA] font-medium'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#0F8F87]' : 'text-[#7B8794]'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div
                      className="absolute left-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-dropdown border border-[#E2E8E5] py-2 z-50 animate-in fade-in duration-150"
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      <div className="px-3.5 py-1.5 mb-1 border-b border-[#EDF1EF]">
                        <span className="text-[10px] font-bold text-[#7B8794] uppercase tracking-wider">
                          {item.label} Modules
                        </span>
                      </div>

                      <div className="px-1 space-y-0.5">
                        {item.items.map((sub) => {
                          const Icon = sub.icon;
                          const isSubActive = location.pathname === sub.path;

                          return (
                            <NavLink
                              key={sub.path}
                              to={sub.path}
                              onClick={() => setActiveDropdown(null)}
                              className={`flex items-start gap-3 p-2.5 rounded-lg text-xs transition-colors group ${
                                isSubActive
                                  ? 'bg-[#F2FBFA] text-[#0F8F87]'
                                  : 'hover:bg-[#F2FBFA] text-[#17202A]'
                              }`}
                            >
                              {Icon && (
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                    isSubActive
                                      ? 'bg-[#E8F7F5] text-[#0F8F87]'
                                      : 'bg-[#F1F4F2] text-[#52606D] group-hover:bg-[#E8F7F5] group-hover:text-[#0F8F87]'
                                  }`}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-semibold transition-colors ${
                                    isSubActive
                                      ? 'text-[#0F8F87]'
                                      : 'text-[#17202A] group-hover:text-[#0F8F87]'
                                  }`}
                                >
                                  {sub.label}
                                </div>
                                {sub.description && (
                                  <div className="text-[11px] text-[#7B8794] line-clamp-1 mt-0.5 font-normal">
                                    {sub.description}
                                  </div>
                                )}
                              </div>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-[13px] transition-all ${
                  isActive
                    ? 'text-[#0F8F87] bg-[#F2FBFA] font-semibold border-b-2 border-[#0F8F87]'
                    : 'text-[#52606D] hover:text-[#0F8F87] hover:bg-[#F2FBFA] font-medium'
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* RIGHT: SEARCH, MESSAGES, NOTIFICATIONS, ROLE, ACCOUNT */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Global Search Button */}
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-3 px-3 py-1.5 text-xs text-[#52606D] bg-[#F1F4F2] hover:bg-[#F2FBFA] hover:text-[#0F8F87] border border-[#E2E8E5] rounded-lg transition shadow-subtle"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-[#7B8794]" />
              <span>Search...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-[#17202A] bg-white border border-[#E2E8E5] rounded">
              Ctrl K
            </kbd>
          </button>

          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 rounded-lg text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87] transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Messages Link */}
          <NavLink
            to="/messages"
            className={`p-2 rounded-lg transition relative ${
              location.pathname === '/messages'
                ? 'bg-[#F2FBFA] text-[#0F8F87]'
                : 'text-[#52606D] hover:text-[#0F8F87] hover:bg-[#F2FBFA]'
            }`}
            aria-label="Messages"
            title="Messages"
          >
            <MessageSquare className="w-4 h-4" />
          </NavLink>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-lg transition relative ${
                showNotifications || location.pathname === '/notifications'
                  ? 'bg-[#F2FBFA] text-[#0F8F87]'
                  : 'text-[#52606D] hover:text-[#0F8F87] hover:bg-[#F2FBFA]'
              }`}
              aria-label="Notifications"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0F8F87] rounded-full ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-dropdown border border-[#E2E8E5] p-4 z-50 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-[#EDF1EF]">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#17202A]">
                      Notifications
                    </h4>
                    {unreadCount > 0 && (
                      <span className="badge-teal text-[10px] py-0 px-2">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-[#0F8F87] hover:text-[#0D7A73] font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#EDF1EF] max-h-80 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#7B8794]">
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
                        className={`p-3 rounded-lg text-xs cursor-pointer hover:bg-[#F2FBFA] transition ${
                          !n.isRead ? 'bg-[#F2FBFA]/60' : ''
                        }`}
                      >
                        <div className="font-semibold text-[#17202A]">{n.title}</div>
                        <div className="text-[11px] text-[#52606D] mt-1 leading-relaxed">
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-[#EDF1EF] mt-2 text-center">
                  <NavLink
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#0F8F87] hover:underline"
                  >
                    View All Notifications →
                  </NavLink>
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher Pill (Desktop) */}
          <div className="hidden xl:flex items-center bg-[#F1F4F2] p-1 rounded-lg border border-[#E2E8E5] text-xs font-semibold">
            <button
              onClick={() => switchRoleDemo('student')}
              className={`px-2.5 py-1 rounded-md transition ${
                role === 'student'
                  ? 'bg-white text-[#0F8F87] shadow-subtle font-bold'
                  : 'text-[#52606D] hover:text-[#17202A]'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchRoleDemo('mentor')}
              className={`px-2.5 py-1 rounded-md transition ${
                role === 'mentor'
                  ? 'bg-white text-[#0F8F87] shadow-subtle font-bold'
                  : 'text-[#52606D] hover:text-[#17202A]'
              }`}
            >
              Mentor
            </button>
            <button
              onClick={() => switchRoleDemo('admin')}
              className={`px-2.5 py-1 rounded-md transition ${
                role === 'admin'
                  ? 'bg-white text-[#0F8F87] shadow-subtle font-bold'
                  : 'text-[#52606D] hover:text-[#17202A]'
              }`}
            >
              Admin
            </button>
          </div>

          {/* User Profile / Account Dropdown */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-[#F2FBFA] transition text-left"
              aria-label="User account menu"
            >
              <div className="w-8 h-8 rounded-full bg-[#0F8F87] text-white font-bold text-xs flex items-center justify-center shadow-subtle">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7B8794] hidden sm:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dropdown border border-[#E2E8E5] p-2 z-50 animate-in fade-in duration-150">
                <div className="px-3 py-2 border-b border-[#EDF1EF]">
                  <div className="font-bold text-xs text-[#17202A] truncate">
                    {user?.name || 'Authorized User'}
                  </div>
                  <div className="text-[11px] text-[#7B8794] truncate">
                    {user?.email || 'user@careerexpertglobal.com'}
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="badge-teal text-[10px] py-0 px-2">
                      {(role || 'student').toUpperCase()}
                    </span>
                    <span className="text-[10px] text-[#7B8794]">ID: CEGS-0182</span>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87] transition text-left"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#7B8794]" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/payments');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87] transition text-left"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#7B8794]" />
                    <span>My Payments & Invoices</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87] transition text-left"
                  >
                    <Settings className="w-3.5 h-3.5 text-[#7B8794]" />
                    <span>Account Settings</span>
                  </button>

                  <div className="pt-1 border-t border-[#EDF1EF]">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-rose-700 hover:bg-rose-50 transition text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#17202A]/40 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r border-[#E2E8E5] p-5 shadow-dropdown flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EDF1EF]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0F8F87] text-white font-bold text-xs flex items-center justify-center">
                    CEGS
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-[#17202A] block uppercase">
                      CEGS LMS
                    </span>
                    <span className="text-[10px] text-[#0F8F87] font-bold tracking-wider uppercase">
                      {(role || 'student').toUpperCase()} PORTAL
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#7B8794] hover:text-[#17202A] hover:bg-[#F1F4F2]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="p-1 bg-[#F1F4F2] border border-[#E2E8E5] rounded-lg grid grid-cols-3 gap-1 text-xs text-center font-semibold">
                <button
                  onClick={() => {
                    switchRoleDemo('student');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-md ${
                    role === 'student' ? 'bg-white text-[#0F8F87] shadow-subtle' : 'text-[#52606D]'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => {
                    switchRoleDemo('mentor');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-md ${
                    role === 'mentor' ? 'bg-white text-[#0F8F87] shadow-subtle' : 'text-[#52606D]'
                  }`}
                >
                  Mentor
                </button>
                <button
                  onClick={() => {
                    switchRoleDemo('admin');
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-md ${
                    role === 'admin' ? 'bg-white text-[#0F8F87] shadow-subtle' : 'text-[#52606D]'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-4">
                {currentNav.map((item) => {
                  if ('items' in item && item.items) {
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#7B8794] px-2 py-1">
                          {item.label}
                        </div>
                        <div className="space-y-0.5">
                          {item.items.map((sub) => {
                            const Icon = sub.icon;
                            const isSubActive = location.pathname === sub.path;

                            return (
                              <NavLink
                                key={sub.path}
                                to={sub.path}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                                  isSubActive
                                    ? 'bg-[#F2FBFA] text-[#0F8F87]'
                                    : 'text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87]'
                                }`}
                              >
                                {Icon && <Icon className="w-4 h-4 text-[#7B8794]" />}
                                <span>{sub.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                        isActive
                          ? 'bg-[#F2FBFA] text-[#0F8F87]'
                          : 'text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87]'
                      }`}
                    >
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}

                {/* Additional Quick Links for Mobile */}
                <div className="pt-2 border-t border-[#EDF1EF] space-y-0.5">
                  <NavLink
                    to="/payments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87]"
                  >
                    <CreditCard className="w-4 h-4 text-[#7B8794]" />
                    <span>My Payments</span>
                  </NavLink>
                  <NavLink
                    to="/messages"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87]"
                  >
                    <MessageSquare className="w-4 h-4 text-[#7B8794]" />
                    <span>Direct Messages</span>
                  </NavLink>
                  <NavLink
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#17202A] hover:bg-[#F2FBFA] hover:text-[#0F8F87]"
                  >
                    <UserIcon className="w-4 h-4 text-[#7B8794]" />
                    <span>My Profile</span>
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-4 border-t border-[#EDF1EF]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-[#17202A]">{user?.name}</div>
                  <div className="text-[11px] text-[#7B8794]">{user?.email}</div>
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
