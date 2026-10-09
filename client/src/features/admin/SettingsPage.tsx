import React, { useState, useEffect } from 'react';
import { Settings, Save, Building, Shield, Bell, CheckCircle, Sliders } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import api from '../../services/api.js';

export const SettingsPage: React.FC = () => {
  const [orgName, setOrgName] = useState('Career Expert Global Solutions');
  const [supportEmail, setSupportEmail] = useState('support@careerexpertglobal.com');
  const [stipendBase, setStipendBase] = useState('16500');
  const [passingScore, setPassingScore] = useState('70');
  const [attendanceMin, setAttendanceMin] = useState('85');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setError(null);
      const res = await api.get('/admin/settings');
      if (res.data?.success && res.data.data) {
        const s = res.data.data;
        if (s.orgName) setOrgName(s.orgName);
        if (s.supportEmail) setSupportEmail(s.supportEmail);
        if (s.stipendBase) setStipendBase(String(s.stipendBase));
        if (s.passingScore) setPassingScore(String(s.passingScore));
        if (s.attendanceMin) setAttendanceMin(String(s.attendanceMin));
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await api.put('/admin/settings', {
        orgName,
        supportEmail,
        stipendBase: Number(stipendBase),
        passingScore: Number(passingScore),
        attendanceMin: Number(attendanceMin),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      if (Array.isArray(err.response?.data?.message)) {
        setError('Validation error: ' + err.response.data.message.map((m: any) => m.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Failed to save settings');
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="LMS Platform Settings"
        subtitle="Configure organizational branding, benchmark passing marks, stipend amounts, and attendance rules."
        badge={<StatusBadge label="Configuration Active" variant="teal" />}
        actions={
          saved ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Settings Saved Successfully</span>
            </div>
          ) : undefined
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Information */}
        <div className="card-premium p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-[#0F8F87]" />
            <h3 className="font-extrabold text-sm text-slate-900">Organization Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0F8F87] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Official Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0F8F87] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Program Academic & Stipend Benchmarks */}
        <div className="card-premium p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Shield className="w-4 h-4 text-[#0F8F87]" />
            <h3 className="font-extrabold text-sm text-slate-900">Academic & Stipend Benchmarks</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Base Monthly Stipend (₹)</label>
              <input
                type="number"
                value={stipendBase}
                onChange={(e) => setStipendBase(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0F8F87] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Assessment Passing Score (%)</label>
              <input
                type="number"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0F8F87] focus:bg-white"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Minimum Attendance for Placement (%)</label>
              <input
                type="number"
                value={attendanceMin}
                onChange={(e) => setAttendanceMin(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-[#0F8F87] focus:bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
