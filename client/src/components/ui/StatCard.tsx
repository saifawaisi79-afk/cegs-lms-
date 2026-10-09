import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  trend?: {
    value: string | number;
    positive?: boolean;
    label?: string;
  };
  variant?: 'brand' | 'amber' | 'emerald' | 'blue' | 'purple' | 'gold';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtext,
  trend,
  variant = 'brand',
  onClick,
  className = '',
}) => {
  // Section 20 Spec: Subtle soft background + brand accent icons
  const iconVariants = {
    brand: 'bg-[#E8F7F5] text-[#0F8F87] border-[#C5EDE8]',
    emerald: 'bg-[#ECF9F0] text-[#16A34A] border-[#BBF7D0]',
    blue: 'bg-[#EFF5FF] text-[#2563EB] border-[#BFDBFE]',
    amber: 'bg-[#FFF7E8] text-[#D97706] border-[#FED7AA]',
    gold: 'bg-[#FBF4D8] text-[#92400E] border-[#FDE68A]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  };

  return (
    <div
      onClick={onClick}
      className={`card-editorial p-5 flex flex-col justify-between bg-white border border-[#E2E8E5] rounded-xl shadow-subtle ${
        onClick ? 'cursor-pointer card-editorial-hover' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-[#52606D] uppercase tracking-[0.12em]">
            {label}
          </p>
          <p className="text-2xl sm:text-[26px] font-extrabold text-[#17202A] tracking-tight">
            {value}
          </p>
        </div>
        <div
          className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconVariants[variant]}`}
        >
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-[#EDF1EF] flex items-center justify-between text-xs text-[#52606D]">
          {subtext && <span className="truncate">{subtext}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto flex items-center gap-1 ${
                trend.positive ? 'text-[#16A34A]' : 'text-[#DC2626]'
              }`}
            >
              <span>{trend.positive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
              {trend.label && <span className="text-[#7B8794] font-normal">{trend.label}</span>}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
