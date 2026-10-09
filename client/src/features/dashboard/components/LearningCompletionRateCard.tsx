import React from 'react';
import { ArrowUpRight, TrendingUp, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LearningCompletionRateCardProps {
  completedPercent?: number;
  inProgressPercent?: number;
}

export const LearningCompletionRateCard: React.FC<LearningCompletionRateCardProps> = ({
  completedPercent = 76,
  inProgressPercent = 24,
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-[#0C847C] via-[#0F8F87] to-[#14A59C] rounded-2xl p-5 sm:p-6 text-white shadow-[0_12px_30px_-6px_rgba(15,143,135,0.3)] hover:shadow-[0_18px_36px_-6px_rgba(15,143,135,0.4)] transition-all duration-300 flex flex-col justify-between relative overflow-hidden group h-full">
      {/* Subtle Ambient Radial Wash */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/15 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
      <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-black/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3">
        <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
          Learning Completion Rate
        </h3>
        <button
          onClick={() => navigate('/assessments')}
          className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          title="View Completion Milestones"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Main Stats with Big Typography */}
      <div className="relative z-10 my-auto py-2">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {completedPercent}%
            </span>
            <span className="text-xs text-white/80 font-medium ml-1.5 uppercase tracking-wider">
              Complete
            </span>
          </div>

          <div className="text-right">
            <span className="text-xl sm:text-2xl font-bold text-white/90">
              {inProgressPercent}%
            </span>
            <span className="text-[11px] text-white/70 font-medium ml-1.5 uppercase tracking-wider block">
              In progress
            </span>
          </div>
        </div>

        {/* Sleek Custom Dual Segment Progress Slider Bar */}
        <div className="relative w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5 backdrop-blur-xs">
          <div
            style={{ width: `${completedPercent}%` }}
            className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] relative"
          />
        </div>
      </div>

      {/* Footnote */}
      <div className="relative z-10 pt-3 border-t border-white/15">
        <p className="text-[11px] text-white/85 font-medium flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-teal-200 flex-shrink-0" />
          <span>Completion rate is <strong className="font-bold text-white">12% higher</strong> than it was last month.</span>
        </p>
      </div>
    </div>
  );
};
