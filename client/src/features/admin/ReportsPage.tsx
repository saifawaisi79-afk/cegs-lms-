import React, { useState } from 'react';
import { FileText, Download, BarChart2, Shield, Calendar, Award, CheckCircle, FileSpreadsheet } from 'lucide-react';
import api from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const ReportsPage: React.FC = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const reportCategories = [
    {
      id: 'attendance',
      title: 'Cohort Attendance & Compliance Audit',
      desc: 'Daily biometric check-in timestamps, monthly percentages, and 85% placement eligibility benchmarks.',
      type: 'Attendance',
      badgeVariant: 'green' as const,
    },
    {
      id: 'assessment',
      title: 'Curriculum Assessment Performance Analytics',
      desc: 'Week 1 through Week 24 scores, category breakdowns, pass/fail ratios, and question stats.',
      type: 'Assessments',
      badgeVariant: 'teal' as const,
    },
    {
      id: 'placement',
      title: 'Placement Drives & Offer Distribution Report',
      desc: 'Recruitment pipelines, company interviews scheduled/cleared, compensation CTC packages.',
      type: 'Corporate Placement',
      badgeVariant: 'blue' as const,
    },
    {
      id: 'stipend',
      title: 'Monthly Training Stipend Disbursement Ledger',
      desc: 'Monthly ₹15,000–₹18,000 allowance status, NEFT bank references, and approvals audit.',
      type: 'Finance & Operations',
      badgeVariant: 'orange' as const,
    },
  ];

  const handleExportCSV = async (reportId: string, title: string) => {
    setExporting(reportId);
    try {
      const res = await api.get(`/admin/reports?type=${reportId}`);
      if (res.data?.success) {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `${reportId}_report_cegs_lms.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Executive Reports & Export Vault"
        subtitle="Download structured cohort analytics for organizational stakeholders, corporate recruiters, and board review."
        badge={<StatusBadge label="Certified System Exports" variant="teal" />}
      />

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCategories.map((r) => (
          <div
            key={r.id}
            className="card-premium p-6 sm:p-7 space-y-4 flex flex-col justify-between hover:border-brand-300 card-premium-hover transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-[#0F8F87] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <StatusBadge label={r.type} variant={r.badgeVariant} size="sm" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{r.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Format: CSV / JSON</span>
              <button
                onClick={() => handleExportCSV(r.id, r.title)}
                disabled={exporting === r.id}
                className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{exporting === r.id ? 'Generating...' : 'Export Dataset'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
