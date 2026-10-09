import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TeamPerformanceWidget: React.FC = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: 'Frontend Architecture', sub: 'React, TS & Tailwind', score: 4.8, percent: 96, color: 'bg-teal-500' },
    { label: 'Backend APIs', sub: 'Node.js & Express', score: 4.5, percent: 90, color: 'bg-teal-500' },
    { label: 'Database Design', sub: 'MongoDB & SQL Schema', score: 4.6, percent: 92, color: 'bg-emerald-500' },
    { label: 'System Design', sub: 'Microservices & Scale', score: 4.2, percent: 84, color: 'bg-amber-400' },
    { label: 'Problem Solving', sub: 'DSA & Algorithms', score: 4.0, percent: 80, color: 'bg-amber-400' },
    { label: 'Executive Poise', sub: 'Mock Interviews & SWOT', score: 4.7, percent: 94, color: 'bg-teal-500' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
          Competency Matrix
        </h3>
        <button
          onClick={() => navigate('/assessments')}
          className="text-slate-400 hover:text-[#0F8F87] transition-colors p-1 rounded-lg hover:bg-slate-50"
          title="View Assessment Breakdown"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Horizontal Bar List */}
      <div className="space-y-3.5 my-auto py-2">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-slate-800 text-[11px]">{m.label}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">· {m.sub}</span>
              </div>
              <span className="font-black text-slate-900 font-mono text-[11px] ml-1">
                {m.score.toFixed(1)}
              </span>
            </div>
            {/* Smooth Rounded Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                style={{ width: `${m.percent}%` }}
                className={`h-full ${m.color} rounded-full transition-all duration-500`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          Frontend & DB skills meet benchmark. DSA optimization targeted for Week 11.
        </p>
      </div>
    </div>
  );
};
