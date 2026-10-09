import React, { useState } from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LearningTimeEqualizer: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredDay, setHoveredDay] = useState<number | null>(4); // Default to Friday (highest)

  const days = [
    { name: 'M', hours: 4.5, height: '45%' },
    { name: 'T', hours: 6.0, height: '60%' },
    { name: 'W', hours: 5.5, height: '55%' },
    { name: 'T', hours: 7.2, height: '72%' },
    { name: 'F', hours: 9.8, height: '95%', isPeak: true },
    { name: 'S', hours: 8.0, height: '80%' },
    { name: 'S', hours: 3.5, height: '35%' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
          Learning Time
        </h3>
        <button
          onClick={() => navigate('/learning')}
          className="text-slate-400 hover:text-[#0F8F87] transition-colors p-1 rounded-lg hover:bg-slate-50"
          title="View Learning Analytics"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Equalizer Vertical Pill Bars Container */}
      <div className="relative my-auto py-4 flex flex-col items-center">
        {/* Floating Active Hours Tag */}
        <div className="flex items-center gap-2 mb-2">
          {days.map((d, i) => (
            <div key={i} className="w-5 text-center">
              {hoveredDay === i && (
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200 shadow-xs whitespace-nowrap">
                  {d.hours}h
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 7 Vertical Equalizer Pills */}
        <div className="h-28 flex items-end justify-center gap-2.5 sm:gap-3 w-full">
          {days.map((d, idx) => {
            const isHovered = hoveredDay === idx;

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredDay(idx)}
                className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
              >
                <div
                  style={{ height: d.height }}
                  className={`w-4 sm:w-5 rounded-full transition-all duration-300 ${
                    d.isPeak
                      ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.3)] ring-2 ring-amber-200'
                      : isHovered
                      ? 'bg-amber-400'
                      : 'bg-amber-100 hover:bg-amber-200'
                  }`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    isHovered ? 'text-slate-900 font-black' : 'text-slate-400'
                  }`}
                >
                  {d.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footnote */}
      <div className="pt-3 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 font-medium">
          Team spent <strong className="text-slate-700">10% more</strong> learning hours vs last month.
        </p>
      </div>
    </div>
  );
};
