import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Calendar,
  Users,
  MessageSquare,
  Bell,
  Briefcase,
  FolderKanban,
  Video,
  Award,
  Target,
  TrendingUp,
  Clock,
  Settings,
  GraduationCap,
  Shield,
  FileText,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Layers,
  Building2,
  CheckCircle2,
  CreditCard,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  onCloseMobile,
  collapsed,
  onToggleCollapse,
}) => {
  const { role, user } = useAuthStore();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Grouped Navigation per role according to Master Design Spec
  const studentGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Learning',
      items: [
        { label: 'My Learning', path: '/learning', icon: BookOpen },
        { label: 'Assessments', path: '/assessments', icon: ClipboardCheck },
      ],
    },
    {
      group: 'Career Development',
      items: [
        { label: 'Mentorship & SWOT', path: '/mentorship', icon: Users },
        { label: 'Live Projects', path: '/projects', icon: FolderKanban },
        { label: 'Interviews', path: '/interviews', icon: Video },
        { label: 'Placement', path: '/placement', icon: Briefcase },
      ],
    },
    {
      group: 'Progress',
      items: [
        { label: 'Attendance', path: '/attendance', icon: Clock },
        { label: 'Certificates', path: '/certificates', icon: Award },
        { label: 'Payments', path: '/payments', icon: CreditCard },
        { label: 'Stipends', path: '/stipends', icon: TrendingUp },
        { label: 'Calendar', path: '/calendar', icon: Calendar },
      ],
    },
    {
      group: 'Communication',
      items: [
        { label: 'Messages', path: '/messages', icon: MessageSquare },
        { label: 'Notifications', path: '/notifications', icon: Bell },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: 'Profile', path: '/profile', icon: GraduationCap },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const mentorGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/mentor', icon: LayoutDashboard },
      ],
    },
    {
      group: 'Students',
      items: [
        { label: 'My Students', path: '/mentor/students', icon: Users },
        { label: 'Student Progress', path: '/learning', icon: BookOpen },
      ],
    },
    {
      group: 'Training',
      items: [
        { label: 'Assessments', path: '/assessments', icon: ClipboardCheck },
        { label: 'Mentorship & SWOT', path: '/mentorship', icon: Users },
        { label: 'Mock Interviews', path: '/mentor/mock-interviews', icon: Video },
        { label: 'Projects Review', path: '/projects', icon: FolderKanban },
      ],
    },
    {
      group: 'Career',
      items: [
        { label: 'Interviews', path: '/interviews', icon: Briefcase },
        { label: 'Placement Funnel', path: '/placement', icon: Target },
      ],
    },
    {
      group: 'Communication',
      items: [
        { label: 'Calendar', path: '/calendar', icon: Calendar },
        { label: 'Messages', path: '/messages', icon: MessageSquare },
        { label: 'Notifications', path: '/notifications', icon: Bell },
      ],
    },
    {
      group: 'Account',
      items: [
        { label: 'Profile', path: '/profile', icon: GraduationCap },
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const adminGroups: NavGroup[] = [
    {
      group: 'Overview',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      group: 'People',
      items: [
        { label: 'Students', path: '/admin/students', icon: Users },
        { label: 'Mentors & Trainers', path: '/admin/mentors', icon: GraduationCap },
      ],
    },
    {
      group: 'Program',
      items: [
        { label: 'Programs & Batches', path: '/admin/batches', icon: Calendar },
        { label: '5 Program Tracks', path: '/admin/tracks', icon: Target },
        { label: 'Curriculum & Modules', path: '/learning', icon: BookOpen },
      ],
    },
    {
      group: 'Evaluation',
      items: [
        { label: 'Assessments', path: '/assessments', icon: ClipboardCheck },
        { label: 'Attendance Central', path: '/attendance', icon: Clock },
      ],
    },
    {
      group: 'Career',
      items: [
        { label: 'Mentorship & SWOT', path: '/mentorship', icon: Users },
        { label: 'Capstone Projects', path: '/projects', icon: FolderKanban },
        { label: 'Interviews & Drives', path: '/interviews', icon: Video },
        { label: 'Placement Funnel', path: '/placement', icon: Briefcase },
        { label: 'Issued Certificates', path: '/certificates', icon: Award },
      ],
    },
    {
      group: 'Operations',
      items: [
        { label: 'Payments & Revenue', path: '/admin/payments', icon: CreditCard },
        { label: 'Stipends Central', path: '/stipends', icon: TrendingUp },
        { label: 'Notifications', path: '/notifications', icon: Bell },
        { label: 'Reports', path: '/admin/reports', icon: FileText },
        { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
      ],
    },
    {
      group: 'System',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
      ],
    },
  ];

  const navGroups = role === 'admin' ? adminGroups : role === 'mentor' ? mentorGroups : studentGroups;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${collapsed ? 'w-20' : 'w-64'}`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Top Brand header */}
          <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-sm flex-shrink-0">
                CE
              </div>
              {!collapsed && (
                <div className="truncate animate-in fade-in duration-200">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                    CEGS LMS
                  </span>
                  <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">
                    {role ? `${role.toUpperCase()} PORTAL` : 'TRAINING PORTAL'}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Student Journey Mini-Indicator (when expanded and student role) */}
          {!collapsed && role === 'student' && (
            <div className="mx-3 mt-3 p-3 bg-gradient-to-r from-brand-50 to-teal-50/50 border border-brand-100/80 rounded-2xl">
              <div className="flex items-center justify-between text-xs font-bold text-brand-900 mb-1">
                <span>Month 3 of 6</span>
                <span className="text-brand-600 font-extrabold">68%</span>
              </div>
              <p className="text-[11px] text-brand-800 font-medium truncate">
                Core Technical Training
              </p>
              <div className="w-full bg-brand-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-500"
                  style={{ width: '68%' }}
                />
              </div>
            </div>
          )}

          {/* Navigation Groups */}
          <nav className="p-3 space-y-4">
            {navGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                {!collapsed ? (
                  <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                    {group.group}
                  </p>
                ) : (
                  <div className="h-px bg-slate-100 my-2 mx-2" />
                )}

                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                      <div
                        key={item.path}
                        className="relative"
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <NavLink
                          to={item.path}
                          onClick={() => onCloseMobile()}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                            isActive
                              ? 'bg-brand-50 text-brand-800 font-bold shadow-sm'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                          } ${collapsed ? 'justify-center px-0' : ''}`}
                        >
                          {/* Active border indicator on the left */}
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-brand-600 rounded-r-md" />
                          )}

                          <Icon
                            className={`w-4 h-4 flex-shrink-0 transition-colors ${
                              isActive
                                ? 'text-brand-600 font-bold'
                                : 'text-slate-400 group-hover:text-brand-600'
                            }`}
                          />

                          {!collapsed && (
                            <span className="truncate">{item.label}</span>
                          )}

                          {item.badge && !collapsed && (
                            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-100 text-brand-700">
                              {item.badge}
                            </span>
                          )}
                        </NavLink>

                        {/* Floating tooltip when collapsed */}
                        {collapsed && hoveredItem === item.path && (
                          <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg whitespace-nowrap animate-in fade-in duration-150">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 flex-shrink-0">
          <div
            className={`p-2.5 rounded-xl bg-white border border-slate-200/70 flex items-center ${
              collapsed ? 'justify-center p-2' : 'justify-between'
            }`}
          >
            <div className={`truncate ${collapsed ? 'hidden' : 'block'}`}>
              <p className="text-xs font-bold text-slate-800 truncate">
                {user?.name || 'Saif Khan'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">{role || 'student'}</p>
            </div>
            <div
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 ring-4 ring-emerald-100"
              title="System Online & Synchronized"
            />
          </div>
        </div>
      </aside>
    </>
  );
};
