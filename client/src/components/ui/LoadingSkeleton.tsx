import React from 'react';

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`card-premium p-6 space-y-4 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="w-24 h-4 rounded-lg skeleton-shimmer" />
      <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
    </div>
    <div className="w-32 h-8 rounded-lg skeleton-shimmer" />
    <div className="w-full h-3 rounded-md skeleton-shimmer pt-2" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="card-premium overflow-hidden">
    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
      <div className="w-48 h-5 rounded skeleton-shimmer" />
      <div className="w-24 h-8 rounded-lg skeleton-shimmer" />
    </div>
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
            <div className="space-y-1.5">
              <div className="w-36 h-3.5 rounded skeleton-shimmer" />
              <div className="w-20 h-2.5 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="w-20 h-4 rounded skeleton-shimmer hidden sm:block" />
          <div className="w-16 h-6 rounded-full skeleton-shimmer" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="h-28 rounded-3xl skeleton-shimmer w-full" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-72 rounded-3xl skeleton-shimmer" />
      <div className="h-72 rounded-3xl skeleton-shimmer" />
    </div>
  </div>
);
