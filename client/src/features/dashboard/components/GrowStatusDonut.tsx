import React, { useState } from 'react';
import { ArrowUpRight, Award, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StatusCategory {
  label: string;
  count: number;
  color: string;
  percentage: number;
}

export const GrowStatusDonut: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const categories: StatusCategory[] = [
    { label: 'Drive Ready', count: 76, color: '#0F8F87', percentage: 52 },
    { label: 'Capstone Stage', count: 38, color: '#3B82F6', percentage: 26 },
    { label: 'Technical Prep', count: 22, color: '#F59E0B', percentage: 15 },
    { label: 'Foundations', count: 10, color: '#8B5CF6', percentage: 7 },
  ];

  const totalMembers = 146;

  // Calculate SVG stroke dashes for SVG donut
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  let accumulatedPercent = 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
          Placement Readiness Breakdown
        </h3>
        <button
          onClick={() => navigate('/placement')}
          className="text-slate-400 hover:text-[#0F8F87] transition-colors p-1 rounded-lg hover:bg-slate-50"
          title="View Placement Pipeline"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Content: SVG Donut + Right Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 my-auto py-2">
        {/* Left: Interactive Multi-segment Donut Chart */}
        <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth="16"
            />

            {/* Colored Segments */}
            {categories.map((cat, idx) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += cat.percentage / 100;

              return (
                <circle
                  key={cat.label}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={hoveredIdx === idx ? 20 : 16}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="transition-all duration-300 cursor-pointer"
                />
              );
            })}
          </svg>

          {/* Center Callout Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900 tracking-tight leading-none font-mono">
              88%
            </span>
            <span className="text-[10px] uppercase font-bold text-[#0F8F87] tracking-wider mt-1">
              Readiness
            </span>
          </div>
        </div>

        {/* Right Legend Items */}
        <div className="space-y-2.5 w-full sm:w-auto">
          {categories.map((cat, idx) => (
            <div
              key={cat.label}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between sm:justify-start gap-3 text-xs cursor-pointer px-2 py-1 rounded-lg transition-colors ${
                hoveredIdx === idx ? 'bg-slate-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-slate-600 font-medium text-[11px]">{cat.label}</span>
              </div>
              <span className="font-bold text-slate-900 text-xs ml-auto sm:ml-4 font-mono">
                {cat.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Status Indicator Bar */}
      <div className="pt-4 border-t border-slate-100 space-y-2.5">
        <div className="relative w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: '88%' }}
            className="h-full bg-emerald-500 rounded-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0F8F87]">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              <strong className="text-slate-900 font-bold">88%</strong> Benchmark compliance
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#0F8F87] font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>Corporate Drive Eligible</span>
          </div>
        </div>
      </div>
    </div>
  );
};
