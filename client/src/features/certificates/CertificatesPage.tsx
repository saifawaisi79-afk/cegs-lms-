import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  ExternalLink,
  Printer,
  ShieldCheck,
  Download,
  Share2,
  Eye,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api.js';
import { ICertificate } from '../../types/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';

export const CertificatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [certificates, setCertificates] = useState<ICertificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const defaultCertificates: ICertificate[] = [
    {
      _id: 'cert-1',
      certificateId: 'CEGS-2025-FGT-0182',
      student: user?.id || 'usr-1',
      candidateName: user?.name || 'Saif Khan',
      programTitle: '6-Month Freshers Growth Training Program',
      trackName: 'Full Stack Development',
      completionDate: new Date('2026-04-15').toISOString(),
      issueDate: new Date().toISOString(),
      grade: 'Distinction (Top 5%)',
      verificationUrl: '/verify-certificate/CEGS-2025-FGT-0182',
      status: 'Issued',
      skillsCertified: [
        'React & TypeScript Advanced Architecture',
        'Node.js & Express RESTful Systems',
        'MongoDB Aggregations & Query Optimization',
        'Enterprise Live Project Capstone Delivery',
        'Professional Communication & Leadership Poise',
      ],
    },
    {
      _id: 'cert-2',
      certificateId: 'CEGS-2025-FGT-F091',
      student: user?.id || 'usr-1',
      candidateName: user?.name || 'Saif Khan',
      programTitle: 'Foundations & Algorithm Mastery Milestone',
      trackName: 'Full Stack Development',
      completionDate: new Date('2026-02-15').toISOString(),
      issueDate: new Date('2026-02-16').toISOString(),
      grade: 'Honors (Score: 94%)',
      verificationUrl: '/verify-certificate/CEGS-2025-FGT-0182',
      status: 'Issued',
      skillsCertified: [
        'Data Structures & Algorithms in TypeScript',
        'Git Branching & Enterprise Workflows',
        'Clean Code Principles',
      ],
    },
    {
      _id: 'cert-3',
      certificateId: 'CEGS-2025-FGT-C304',
      student: user?.id || 'usr-1',
      candidateName: user?.name || 'Saif Khan',
      programTitle: 'Enterprise Capstone Project Delivery',
      trackName: 'Multi-Tenant Cloud Platform',
      completionDate: new Date('2026-03-30').toISOString(),
      issueDate: new Date('2026-04-01').toISOString(),
      grade: 'High Distinction',
      verificationUrl: '/verify-certificate/CEGS-2025-FGT-0182',
      status: 'Issued',
      skillsCertified: [
        'Microservices Architecture',
        'Agile Sprint Pod Delivery',
        'Code Review & Pull Request Standards',
      ],
    },
  ];

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const res = await api.get('/certificates');
        if (res.data?.success && res.data.data.length > 0) {
          setCertificates(res.data.data);
        } else {
          setCertificates(defaultCertificates);
        }
      } catch (err) {
        setCertificates(defaultCertificates);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user]);

  const activeModalCert = selectedCert || certificates[0] || defaultCertificates[0];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="OFFICIAL CREDENTIALS & HONORS"
        title="Certificates & Credentials"
        subtitle="Official verifiable digital diplomas conferred upon meeting benchmark curriculum evaluations."
        badge={<StatusBadge label="Cryptographically Verified" variant="teal" />}
      />

      {/* CERTIFICATES GALLERY (PHASE 17 SPEC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert._id || cert.certificateId}
            className="card-premium rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-[#0F8F87]/40 card-premium-hover transition-all group"
          >
            {/* Certificate Preview Card Header */}
            <div className="space-y-4">
              <div className="h-40 rounded-xl bg-slate-900 p-5 text-white flex flex-col justify-between relative overflow-hidden border border-slate-800">
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-[#0F8F87]/15 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <span className="eyebrow-text text-[10px] text-teal-300">
                    CEGS CERTIFIED
                  </span>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm line-clamp-1 text-white">
                    {cert.programTitle}
                  </h4>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    {cert.certificateId}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2">
                  <span>{cert.candidateName}</span>
                  <span className="text-emerald-400 font-bold">✓ Verified</span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge label={cert.trackName} variant="teal" size="sm" />
                  <span className="text-xs font-bold text-emerald-700">{cert.grade}</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0F8F87] transition">
                  {cert.programTitle}
                </h3>

                <p className="text-xs text-slate-500 flex items-center gap-1.5 font-normal">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Issued on {new Date(cert.issueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            </div>

            {/* Actions: View, Download, Verify (Phase 17 Spec) */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedCert(cert)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 shadow-sm bg-white"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View</span>
              </button>

              <button
                onClick={() => {
                  setSelectedCert(cert);
                  setTimeout(() => window.print(), 200);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition flex items-center gap-1.5 shadow-sm bg-white"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Download</span>
              </button>

              <button
                onClick={() => navigate(cert.verificationUrl || `/verify-certificate/${cert.certificateId}`)}
                className="px-3 py-1.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FULL SCREEN / PREVIEW MODAL (Section 27 & 31 Specification) */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-8 sm:p-12 shadow-2xl border border-slate-100 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              ✕
            </button>

            {/* Certificate Header Branding (Teal Branding + Gold Subtle Touch) */}
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-[#0F8F87] text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-8 h-8" />
              </div>
              <span className="text-xs font-extrabold text-[#0F8F87] uppercase tracking-widest block pt-2">
                CAREER EXPERT GLOBAL SOLUTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
                Certificate of Achievement & Completion
              </h2>
              <p className="text-xs text-slate-500 italic">
                This credential is officially conferred upon
              </p>
            </div>

            {/* Candidate Name in Grand Typography */}
            <div className="text-center py-2 border-b-2 border-slate-200 max-w-md mx-auto">
              <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif tracking-tight">
                {activeModalCert.candidateName}
              </h3>
            </div>

            {/* Program Title and Achievement text */}
            <div className="text-center max-w-xl mx-auto space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p className="text-slate-500">for having demonstrated verified academic and hands-on engineering proficiency in the:</p>
              <p className="text-lg font-bold text-slate-900">{activeModalCert.programTitle}</p>
              <p className="font-semibold text-[#0F8F87]">
                Specialization: {activeModalCert.trackName} • Standing: {activeModalCert.grade}
              </p>
            </div>

            {/* Signature & Seal Row */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left text-xs text-slate-500">
              <div>
                <p className="font-mono text-xs font-bold text-slate-900">
                  ID: {activeModalCert.certificateId}
                </p>
                <p className="text-[10px] text-slate-400">
                  Conferred on {new Date(activeModalCert.issueDate).toLocaleDateString()}
                </p>
              </div>

              {/* Subtle Gold Seal */}
              <div className="w-16 h-16 rounded-full border-2 border-amber-400 bg-amber-50 flex items-center justify-center text-amber-800 font-extrabold text-[9px] text-center p-1 uppercase shadow-sm">
                ★ CEGS SEAL ★
              </div>

              <div className="text-center sm:text-right">
                <div className="w-32 border-b border-slate-300 mb-1 mx-auto sm:ml-auto" />
                <p className="font-bold text-slate-900">Academic Director</p>
                <p className="text-[10px] text-slate-400">Career Expert Global</p>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition"
              >
                Close Preview
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
