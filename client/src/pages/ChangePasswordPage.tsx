import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, ShieldAlert, ArrowRight, LogOut, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import api from '../services/api.js';
import { toast } from 'sonner';

export const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, setToken, logout } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isForced = user?.mustChangePassword;

  // Validation rules
  const hasMinLength = newPassword.length >= 10 && newPassword.length <= 72;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);

  const emailLocal = user?.email ? user.email.split('@')[0].toLowerCase() : '';
  const userIdLower = user?.userId ? user.userId.toLowerCase() : '';
  const nameParts = user?.name ? user.name.toLowerCase().split(/\s+/).filter((p) => p.length > 2) : [];

  const lowerPw = newPassword.toLowerCase();
  const notContainsPersonal =
    (!emailLocal || !lowerPw.includes(emailLocal)) &&
    (!userIdLower || !lowerPw.includes(userIdLower)) &&
    !nameParts.some((part) => lowerPw.includes(part));

  const isDifferentFromCurrent = !currentPassword || newPassword !== currentPassword;
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid =
    currentPassword.length > 0 &&
    hasMinLength &&
    hasUpper &&
    hasLower &&
    hasDigit &&
    notContainsPersonal &&
    isDifferentFromCurrent &&
    passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Please satisfy all password security criteria before continuing.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        toast.success('Password updated successfully! Welcome to CEGS LMS.');

        if (res.data?.accessToken) {
          setToken(res.data.accessToken);
        }

        // Fetch refreshed user
        const meRes = await api.get('/auth/me');
        if (meRes.data?.success && meRes.data?.user) {
          setUser(meRes.data.user);
          const freshUser = meRes.data.user;

          if (freshUser.role === 'student' && (!freshUser.studentProfile?.onboardingCompleted || freshUser.isFirstLogin)) {
            navigate('/onboarding');
          } else if (freshUser.role === 'admin') {
            navigate('/admin');
          } else if (freshUser.role === 'mentor') {
            navigate('/mentor');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.data?.message || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F8F87] text-white font-extrabold text-sm tracking-wider flex items-center justify-center mx-auto shadow-md">
            CEGS
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            {isForced ? 'Set Your Permanent Password' : 'Change Your Password'}
          </h1>
          <p className="text-xs text-slate-500 font-normal max-w-sm mx-auto">
            {isForced
              ? 'You are currently using a temporary access key. For security, please establish a strong personal password to continue.'
              : 'Choose a strong, unique password to secure your CEGS LMS portal account.'}
          </p>
        </div>

        {isForced && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Password Change Required: </span>
              All other portal actions are temporarily restricted until you set your permanent password.
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {isForced ? 'Temporary Password (from creator/slip)' : 'Current Password'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 10 characters with upper, lower & digit"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Confirm New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Live Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">Password Requirements</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>10 to 72 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasUpper ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>Uppercase letter (A-Z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasLower ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>Lowercase letter (a-z)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-700' : 'text-slate-500'}`}>
                {hasDigit ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>At least one number (0-9)</span>
              </div>
              <div className={`flex items-center gap-1.5 ${notContainsPersonal ? 'text-emerald-700' : 'text-slate-500'}`}>
                {notContainsPersonal ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>No ID, name or email prefix</span>
              </div>
              <div className={`flex items-center gap-1.5 ${isDifferentFromCurrent && newPassword ? 'text-emerald-700' : 'text-slate-500'}`}>
                {isDifferentFromCurrent && newPassword ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>Different from current</span>
              </div>
              <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700' : 'text-slate-500'} sm:col-span-2`}>
                {passwordsMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />}
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Save New Password & Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="pt-2 text-center">
          {isForced ? (
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cancel & Sign Out</span>
            </button>
          ) : (
            <button
              onClick={() => navigate(-1)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel & Return</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
