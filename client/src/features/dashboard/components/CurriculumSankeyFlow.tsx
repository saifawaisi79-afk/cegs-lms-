import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CurriculumSankeyFlow: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
          Curriculum & Lab Hours
        </h3>
        <button
          onClick={() => navigate('/learning')}
          className="text-slate-400 hover:text-[#0F8F87] transition-colors p-1 rounded-lg hover:bg-slate-50"
          title="View Curriculum Modules"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top 3 KPI Stats */}
      <div className="grid grid-cols-3 gap-2 py-2.5 border-b border-slate-100">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Hours
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate">
            480 hrs
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Completed
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate text-[#0F8F87]">
            265 hrs
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Practical Labs
          </span>
          <span className="text-xs sm:text-sm font-black text-slate-900 mt-0.5 block truncate">
            215 hrs
          </span>
        </div>
      </div>

      {/* Sankey Flow Ribbons Visualization */}
      <div className="my-auto py-3">
        <div className="flex items-center justify-between gap-2 relative min-h-[170px]">
          {/* Left Flow Categories */}
          <div className="w-[110px] sm:w-[130px] flex-shrink-0 space-y-5 text-left z-10">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-slate-900">38%</span>
                <span className="text-[11px] text-slate-700 font-semibold">Core Modules</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Full Stack Architecture</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-slate-900">42%</span>
                <span className="text-[11px] text-slate-700 font-semibold">Live Sprints</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Enterprise Capstones</span>
            </div>

            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-slate-900">20%</span>
                <span className="text-[11px] text-slate-700 font-semibold">Mock Loops</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Placement Prep</span>
            </div>
          </div>

          {/* Center SVG Curved Flow Ribbons (Dynamic Fluid Béziers) */}
          <div className="flex-1 h-[165px] relative">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0F8F87" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="flowGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="flowGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.18" />
                </linearGradient>
              </defs>

              <path
                d="M 0 14 C 45 14, 55 16, 100 16 L 100 32 C 55 32, 45 30, 0 30 Z"
                fill="url(#flowGrad1)"
              />
              <path
                d="M 0 48 C 45 48, 55 52, 100 52 L 100 66 C 55 66, 45 62, 0 62 Z"
                fill="url(#flowGrad2)"
              />
              <path
                d="M 0 80 C 45 80, 55 86, 100 86 L 100 98 C 55 98, 45 92, 0 92 Z"
                fill="url(#flowGrad3)"
              />
            </svg>
          </div>

          {/* Right Targets / Milestones */}
          <div className="w-[85px] sm:w-[95px] flex-shrink-0 space-y-5 text-right z-10">
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-black text-slate-900 font-mono">182 hrs</span>
              <span className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-black text-slate-900 font-mono">202 hrs</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 shadow-2xs">
              <span className="text-[11px] font-black text-slate-900 font-mono">96 hrs</span>
              <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          55% of hands-on lab milestones completed. On track for Month 3 benchmark.
        </p>
      </div>
    </div>
  );
};
