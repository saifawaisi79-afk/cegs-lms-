import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Shield,
  GraduationCap,
  Sparkles,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';
import { INotification, UserRole } from '../../types/index.js';
import { StatusBadge } from '../ui/StatusBadge.js';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileSidebar,
  onOpenCommandPalette,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, role, logout, switchRoleDemo } = useAuthStore();
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/communication/notifications');
        if (res.data?.success) {
          setNotifications(res.data.data);
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // Fallback demo notifications
        setNotifications([
          {
            _id: 'n1',
            recipient: user?.id || '',
            title: 'Technical Round 2 Interview Scheduled',
            message: 'Cognizant Technology Solutions interview scheduled for Friday at 3:00 PM.',
            type: 'interview',
            link: '/interviews',
            isRead: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: 'n2',
            recipient: user?.id || '',
            title: 'Assessment Result Published',
            message: 'Week 9 Node.js Runtime Architecture: 96% score achieved.',
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
    } catch (err) {
      setUnreadCount(0);
    }
  };

  // Derive page title & breadcrumbs from path
  const getPageMeta = (pathname: string) => {
    switch (pathname) {
      case '/dashboard':
        return { category: 'Overview', title: 'Student Dashboard' };
      case '/mentor':
        return { category: 'Overview', title: 'Mentor Command Center' };
      case '/mentor/students':
        return { category: 'Students', title: 'My Students' };
      case '/mentor/mock-interviews':
        return { category: 'Training', title: 'Mock Interviews' };
      case '/admin':
        return { category: 'Overview', title: 'Admin Command Center' };
      case '/admin/students':
        return { category: 'People', title: 'Student Directory' };
      case '/admin/mentors':
        return { category: 'People', title: 'Mentors & Trainers' };
      case '/admin/batches':
        return { category: 'Program', title: 'Programs & Batches' };
      case '/admin/tracks':
        return { category: 'Program', title: '5 Program Tracks' };
      case '/admin/reports':
        return { category: 'Operations', title: 'Executive Reports' };
      case '/admin/audit-logs':
        return { category: 'Operations', title: 'System Audit Logs' };
      case '/learning':
        return { category: 'Learning', title: 'My Learning' };
      case '/assessments':
        return { category: 'Learning', title: 'Assessments & Quizzes' };
      case '/attendance':
        return { category: 'Progress', title: 'Attendance Central' };
      case '/mentorship':
        return { category: 'Career Development', title: 'Mentorship & SWOT' };
      case '/projects':
        return { category: 'Career Development', title: 'Live Projects' };
      case '/interviews':
        return { category: 'Career Development', title: 'Interviews & Drives' };
      case '/placement':
        return { category: 'Career Development', title: 'Placement Portal' };
      case '/certificates':
        return { category: 'Progress', title: 'Certificates & Credentials' };
      case '/stipends':
        return { category: 'Progress', title: 'Stipends & Incentives' };
      case '/calendar':
        return { category: 'Progress', title: 'Master Calendar' };
      case '/messages':
        return { category: 'Communication', title: 'Messages & Direct Chat' };
      case '/notifications':
        return { category: 'Communication', title: 'Notification Center' };
      case '/profile':
        return { category: 'Account', title: 'Profile & Portfolio' };
      case '/admin/settings':
        return { category: 'Account', title: 'System Settings' };
      default:
        return { category: 'CEGS LMS', title: 'Platform Portal' };
    }
  };

  const pageMeta = getPageMeta(location.pathname);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile Toggle + Breadcrumb & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <span>{pageMeta.category}</span>
            <span>/</span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            {pageMeta.title}
          </h2>
        </div>
      </div>

      {/* Right Controls: Command Search Trigger, Role switcher, Messages, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger (Ctrl + K) */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center gap-3 px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 hover:bg-slate-100 hover:text-slate-600 border border-slate-200/60 rounded-xl transition"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search anything...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md shadow-sm">
            Ctrl K
          </kbd>
        </button>

        {/* Search button mobile */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Role Switcher Badge / Quick Switch */}
        <div className="hidden xl:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => switchRoleDemo('student')}
            className={`px-2.5 py-1 rounded-lg transition ${
              role === 'student'
                ? 'bg-white text-brand-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student
          </button>
          <button
            onClick={() => switchRoleDemo('mentor')}
            className={`px-2.5 py-1 rounded-lg transition ${
              role === 'mentor'
                ? 'bg-white text-brand-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mentor
          </button>
          <button
            onClick={() => switchRoleDemo('admin')}
            className={`px-2.5 py-1 rounded-lg transition ${
              role === 'admin'
                ? 'bg-white text-brand-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Admin
          </button>
        </div>

        {/* Quick link to Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition relative"
          aria-label="Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <StatusBadge label={`${unreadCount} new`} variant="teal" size="sm" />
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => {
                        setShowNotifications(false);
                        if (n.link) navigate(n.link);
                      }}
                      className={`p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition flex items-start gap-2.5 ${
                        !n.isRead ? 'bg-brand-50/40' : ''
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/notifications');
                  }}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700"
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition"
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
              }
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
            <div className="hidden lg:block text-left">
              <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                {user?.name || 'Candidate'}
              </span>
              <span className="text-[10px] text-slate-400 block capitalize">
                {role || 'student'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <StatusBadge
                    label={role === 'admin' ? 'Administrator' : role === 'mentor' ? 'Trainer/Mentor' : 'Student Candidate'}
                    variant={role === 'admin' ? 'red' : role === 'mentor' ? 'blue' : 'teal'}
                    size="sm"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                Profile & Portfolio
              </button>

              {role === 'admin' && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  System Settings
                </button>
              )}

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
