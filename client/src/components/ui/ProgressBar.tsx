import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brand' | 'emerald' | 'amber' | 'blue' | 'gold' | 'gradient';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  size = 'md',
  variant = 'brand',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-2.5',
  };

  // Section 19 Spec: Track #E7EEEB, Filled #0F8F87, Major milestones gradient #0F8F87 -> #0D7A73
  const variantClasses = {
    brand: 'bg-[#0F8F87]',
    emerald: 'bg-[#16A34A]',
    amber: 'bg-[#D97706]',
    blue: 'bg-[#2563EB]',
    gold: 'bg-[#C9A227]',
    gradient: 'bg-gradient-to-r from-[#0F8F87] to-[#0D7A73]',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          {label && <span className="font-medium text-[#52606D] truncate">{label}</span>}
          {showPercent && (
            <span className="font-bold text-[#17202A] ml-auto">{percentage}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-[#E7EEEB] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
