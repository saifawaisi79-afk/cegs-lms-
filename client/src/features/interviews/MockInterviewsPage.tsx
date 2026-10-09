import React, { useEffect, useState } from 'react';
import {
  Video,
  Award,
  CheckCircle,
  Clock,
  Calendar,
  Star,
  FileText,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api.js';
import { IMockInterview } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { AlertCircle } from 'lucide-react';

export const MockInterviewsPage: React.FC = () => {
  const [interviews, setInterviews] = useState<IMockInterview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);



  const fetchMocks = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/mentorship/mock-interviews');
      if (res.data?.success && res.data.data.length > 0) {
        setInterviews(res.data.data);
      } else {
        setInterviews([]);
      }
    } catch (err) {
      setError(true);
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMocks();
  }, []);

  const getInterviewStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'blue' as const;
      case 'upcoming':
        return 'teal' as const;
      case 'completed':
        return 'green' as const;
      case 'awaiting result':
        return 'orange' as const; // amber
      case 'not selected':
        return 'red' as const;
      case 'selected':
        return 'green' as const;
      default:
        return 'teal' as const;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header (Section 31 Specification) */}
      <PageHeader
        eyebrow="CAREER PREPARATION"
        title="Interviews"
        subtitle="Prepare. Perform. Improve."
        badge={<StatusBadge label="Hiring Readiness" variant="teal" />}
      />

      {/* Mock Interviews List */}
      <div className="space-y-6">
        {error ? (
          <EmptyState
            icon={AlertCircle}
            title="Connection Error"
            description="Failed to load your mock interviews."
            action={{ label: 'Retry', onClick: fetchMocks }}
          />
        ) : interviews.length === 0 && !loading ? (
          <EmptyState
            icon={Video}
            title="No Interviews Scheduled"
            description="You do not have any mock interviews scheduled at this time."
          />
        ) : (
          interviews.map((mock) => {
          const isCompleted = mock.status === 'Completed';

          return (
            <div
              key={mock._id}
              className="card-premium rounded-2xl p-6 sm:p-8 space-y-6 bg-white border border-slate-100 shadow-sm"
            >
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      label={`${mock.interviewType.toUpperCase()} ROUND`}
                      variant="teal"
                      size="sm"
                    />
                    <StatusBadge
                      label={mock.status}
                      variant={getInterviewStatusVariant(mock.status)}
                      size="sm"
                    />
                  </div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    60-Minute Evaluation Loop with {mock.interviewer || 'Senior Evaluator'}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Scheduled:{' '}
                      {new Date(mock.scheduledAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {new Date(mock.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </p>
                </div>

                {isCompleted ? (
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Overall Benchmark Score
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#0F8F87]">
                      {mock.overallScore} / 100
                    </span>
                  </div>
                ) : (
                  mock.meetingLink && (
                    <a
                      href={mock.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Interview Room</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )
                )}
              </div>

              {/* Completed Evaluation Rubric Grid (Phase 15 Spec) */}
              {isCompleted && mock.ratings && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Competency Category Ratings (Out of 10)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                    <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Communication</p>
                      <p className="text-lg font-extrabold text-slate-900">{mock.ratings.communication}/10</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Technical Depth</p>
                      <p className="text-lg font-extrabold text-slate-900">{mock.ratings.technical}/10</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Confidence</p>
                      <p className="text-lg font-extrabold text-slate-900">{mock.ratings.confidence}/10</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Problem Solving</p>
                      <p className="text-lg font-extrabold text-slate-900">{mock.ratings.problemSolving}/10</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Professionalism</p>
                      <p className="text-lg font-extrabold text-slate-900">{mock.ratings.professionalism}/10</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
                      <p className="text-[10px] text-slate-400 font-bold mb-1">Role Awareness</p>
                      <p className="text-lg font-extrabold text-slate-900">{mock.ratings.roleAwareness}/10</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback and Recommendations */}
              {isCompleted && mock.feedback && (
                <div className="p-5 bg-teal-50/70 border border-teal-200/90 rounded-2xl space-y-2 text-xs">
                  <p className="font-extrabold text-teal-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0F8F87]" />
                    Evaluator Feedback & Diagnostic:
                  </p>
                  <p className="text-teal-900 leading-relaxed italic">"{mock.feedback}"</p>
                  {mock.recommendations && mock.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-teal-200/60">
                      <p className="font-bold text-teal-950 mb-1">Action Recommendations:</p>
                      <ul className="space-y-1 text-teal-900 list-disc list-inside">
                        {mock.recommendations.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Preparation Materials for upcoming */}
              {!isCompleted && mock.preparationMaterials && (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                  <p className="font-bold text-slate-800 uppercase tracking-wider">
                    Preparation Directives for this Round:
                  </p>
                  <ul className="space-y-1.5 text-slate-600 pl-4 list-disc">
                    {mock.preparationMaterials.map((mat, i) => (
                      <li key={i}>{mat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        }))}
      </div>
    </div>
  );
};
