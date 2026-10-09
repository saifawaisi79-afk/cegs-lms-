import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FolderKanban,
  Users,
  Calendar,
  CreditCard,
  MessageSquare,
  Award,
  Sun,
  Moon,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';

interface GrowlySlimDockProps {
  onToggleProfileCard?: () => void;
  isProfileCardOpen?: boolean;
}

export const GrowlySlimDock: React.FC<GrowlySlimDockProps> = ({
  onToggleProfileCard,
  isProfileCardOpen = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const [isDark, setIsDark] = React.useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/learning', label: 'Courses & Curriculum', icon: BookOpen },
    { path: '/assessments', label: 'Assessments', icon: ClipboardCheck },
    { path: '/projects', label: 'Live Projects', icon: FolderKanban },
    { path: '/mentorship', label: 'Mentorship & SWOT', icon: Users },
    { path: '/calendar', label: 'Cohort Calendar', icon: Calendar },
    { path: '/certificates', label: 'Certificates', icon: Award },
    { path: '/payments', label: 'Payments & Fee', icon: CreditCard },
  ];

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-[74px] h-screen sticky top-0 bg-[#111625] text-slate-400 py-5 z-30 select-none shadow-2xl border-r border-[#1C2336] flex-shrink-0 transition-all duration-300">
      {/* Top: CEGS / Growly Brand Monogram */}
      <div className="flex flex-col items-center gap-4">
        <NavLink
          to="/dashboard"
          className="group relative flex items-center justify-center"
          title="CEGS LMS"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0F8F87] to-[#14A59C] flex items-center justify-center text-white font-black text-sm shadow-[0_0_20px_rgba(15,143,135,0.4)] group-hover:scale-105 transition-transform duration-200">
            <span className="tracking-tighter">G</span>
          </div>
          {/* Tooltip */}
          <span className="absolute left-[82px] scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 z-50 whitespace-nowrap border border-slate-700">
            CEGS LMS
          </span>
        </NavLink>

        <div className="w-8 h-[1px] bg-slate-800/80 my-1" />
      </div>

      {/* Center: Slim Nav Icons */}
      <nav className="flex flex-col items-center gap-2 my-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/10 text-white shadow-sm ring-1 ring-white/15'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {/* Active Left Indicator Pill */}
              {isActive && (
                <span className="absolute -left-[17px] w-1.5 h-6 bg-[#0F8F87] rounded-r-full shadow-[0_0_10px_#0F8F87]" />
              )}

              <Icon className="w-5 h-5 transition-transform duration-150 group-hover:scale-110" />

              {/* Tooltip */}
              <span className="absolute left-[68px] scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 z-50 whitespace-nowrap border border-slate-700 pointer-events-none">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom: Quick Messages, Theme Toggle & Growly Profile Preview */}
      <div className="flex flex-col items-center gap-3 pt-3 border-t border-slate-800/80 w-full">
        {/* Messages with notification dot */}
        <NavLink
          to="/messages"
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0F8F87] ring-2 ring-[#111625]" />
          <span className="absolute left-[68px] scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 z-50 whitespace-nowrap border border-slate-700 pointer-events-none">
            Messages & Cohort
          </span>
        </NavLink>

        {/* Toggle Growly Mobile Phone Card */}
        {onToggleProfileCard && (
          <button
            onClick={onToggleProfileCard}
            className={`group relative flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
              isProfileCardOpen
                ? 'bg-[#0F8F87]/20 text-[#0F8F87] ring-1 ring-[#0F8F87]/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Growly Profile Card"
          >
            <Smartphone className="w-4 h-4" />
            <span className="absolute left-[68px] scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 z-50 whitespace-nowrap border border-slate-700 pointer-events-none">
              Growly Profile Card
            </span>
          </button>
        )}

        {/* Theme Toggle Icon */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Toggle Theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-90" />
          ) : (
            <Moon className="w-4 h-4 text-slate-400 transition-transform hover:-rotate-12" />
          )}
          <span className="absolute left-[68px] scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 z-50 whitespace-nowrap border border-slate-700 pointer-events-none">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* User Avatar with Online Dot */}
        <div
          onClick={() => navigate('/profile')}
          className="group relative cursor-pointer mt-1"
          title="User Profile"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-[#0F8F87]/60 group-hover:ring-[#0F8F87] transition-all">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              alt={user?.name || 'User'}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-[#111625]" />
          <span className="absolute left-[68px] scale-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-xl transition-all group-hover:scale-100 z-50 whitespace-nowrap border border-slate-700 pointer-events-none">
            {user?.name || 'My Profile'}
          </span>
        </div>
      </div>
    </aside>
  );
};
