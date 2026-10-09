import React from 'react';

export type BadgeVariant = 'teal' | 'orange' | 'blue' | 'green' | 'red' | 'neutral' | 'purple' | 'gold';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'neutral',
  icon: Icon,
  className = '',
  size = 'md',
}) => {
  // Section 10 & 11 Spec: Soft backgrounds + dark status text
  const variantStyles: Record<BadgeVariant, string> = {
    teal: 'bg-[#E8F7F5] text-[#0F8F87] border-[#C5EDE8]',
    orange: 'bg-[#FFF7E8] text-[#D97706] border-[#FED7AA]',
    blue: 'bg-[#EFF5FF] text-[#2563EB] border-[#BFDBFE]',
    green: 'bg-[#ECF9F0] text-[#16A34A] border-[#BBF7D0]',
    red: 'bg-[#FEF0F0] text-[#DC2626] border-[#FECACA]',
    gold: 'bg-[#FBF4D8] text-[#92400E] border-[#FDE68A]',
    neutral: 'bg-[#F1F4F2] text-[#52606D] border-[#E2E8E5]',
    purple: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border transition-colors ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </span>
  );
};
