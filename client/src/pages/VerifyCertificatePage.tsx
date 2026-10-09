import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Award, CheckCircle, XCircle, ShieldCheck, Calendar, ArrowLeft, GraduationCap, Printer } from 'lucide-react';
import api from '../services/api.js';

export const VerifyCertificatePage: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [certData, setCertData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchVerification = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/certificates/verify/${certificateId}`);
        if (res.data?.success && res.data?.isValid) {
          setIsValid(true);
          setCertData(res.data.data);
        } else {
          setIsValid(false);
          setErrorMsg(res.data?.message || 'Certificate record could not be verified.');
        }
      } catch (err: any) {
        setIsValid(false);
        setErrorMsg(err.response?.data?.message || 'Certificate not found or revoked.');
      } finally {
        setLoading(false);
      }
    };

    if (certificateId) {
      fetchVerification();
    }
  }, [certificateId]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6">
      {/* Top back button */}
      <div className="max-w-3xl mx-auto w-full mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Career Expert Home</span>
        </button>

        {isValid && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Verification</span>
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Verification Status Banner */}
        <div
          className={`p-6 text-center text-white ${
            isValid
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600'
              : 'bg-gradient-to-r from-rose-600 to-red-600'
          }`}
        >
          {loading ? (
            <div className="py-6 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold tracking-wide">Validating Credential via Blockchain / Registry...</p>
            </div>
          ) : isValid ? (
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto backdrop-blur-md">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">VERIFIED AUTHENTIC CERTIFICATE</h2>
              <p className="text-xs text-emerald-100 font-medium">
                Official Credential Issued by Career Expert Global Solutions
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto backdrop-blur-md">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">CERTIFICATE NOT VERIFIED</h2>
              <p className="text-xs text-rose-100 font-medium">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Certificate Details */}
        {!loading && isValid && certData && (
          <div className="p-8 sm:p-10 space-y-8">
            {/* Candidate & Program Title */}
            <div className="text-center space-y-2 pb-6 border-b border-slate-100">
              <span className="text-[11px] font-extrabold text-brand-600 uppercase tracking-widest block">
                Certificate of Completion & Job-Ready Competence
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {certData.candidateName}
              </h1>
              <p className="text-sm text-slate-600">
                Has successfully completed all curricular benchmarks, weekly milestone assessments, and live client capstone requirements for the:
              </p>
              <p className="text-lg font-bold text-brand-800">
                {certData.programTitle}
              </p>
              <div className="inline-block mt-2">
                <span className="badge-teal text-sm py-1 px-3">
                  Specialization: {certData.trackName}
                </span>
              </div>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-slate-400 font-semibold mb-1">Certificate Identifier</p>
                <p className="text-sm font-mono font-extrabold text-slate-900">{certData.certificateId}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-slate-400 font-semibold mb-1">Academic Grade & Standing</p>
                <p className="text-sm font-extrabold text-emerald-700">{certData.grade}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-slate-400 font-semibold mb-1">Program Completion Date</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(certData.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60">
                <p className="text-slate-400 font-semibold mb-1">Official Issuing Organization</p>
                <p className="text-sm font-bold text-slate-900">{certData.issuer}</p>
              </div>
            </div>

            {/* Certified Skills */}
            {certData.skillsCertified && certData.skillsCertified.length > 0 && (
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Verified Technical Competencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {certData.skillsCertified.map((skill: string) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl bg-brand-50 text-brand-700 text-xs font-semibold border border-brand-200"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Official seal & disclaimer */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-brand-600" />
                <span>Digitally signed and cryptographically recorded by CEGS LMS.</span>
              </div>
              <p>Career Expert Global Solutions</p>
            </div>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 mt-6">
        &copy; Career Expert Global Solutions. All verification records are official and tamper-resistant.
      </div>
    </div>
  );
};
