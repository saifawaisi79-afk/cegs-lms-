import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  badge,
  breadcrumbs,
  actions,
  className = '',
}) => {
  // If no action buttons, badges, breadcrumbs or eyebrows, return null to eliminate redundant header gap
  if (!actions && !breadcrumbs && !badge && !eyebrow) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 ${className}`}
    >
      <div className="flex items-center gap-2.5 flex-wrap">
        {eyebrow && (
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-teal-50 text-[#0F8F87] border border-teal-200">
            {eyebrow}
          </span>
        )}
        {badge}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-slate-400">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-[#0F8F87] transition font-medium">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-slate-700 font-semibold">{crumb.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="text-slate-300">/</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
};
