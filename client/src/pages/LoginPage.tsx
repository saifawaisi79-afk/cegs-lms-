import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import api from '../services/api.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorDetails(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { identifier, password });
      if (res.data?.success) {
        const { user, token } = res.data;
        setAuth(user, token);

        // Route directly into the user's portal based on credentials entered
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'mentor') {
          navigate('/mentor');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.data?.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 423) {
        const minutes = data?.remainingMinutes ?? 15;
        setError(`Account Locked: Too many failed login attempts.`);
        setErrorDetails(`Your account is locked for security. Please wait ${minutes} minute${minutes !== 1 ? 's' : ''} before trying again, or contact your administrator.`);
      } else if (status === 403) {
        setError(data?.message || 'Account disabled, contact your administrator.');
      } else if (status === 429) {
        setError('Too many requests. Please wait a moment before trying again.');
      } else {
        setError(data?.message || 'Invalid ID/email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div
            onClick={() => navigate('/')}
            className="w-12 h-12 rounded-2xl bg-[#0F8F87] text-white font-extrabold text-sm tracking-wider flex items-center justify-center mx-auto shadow-md cursor-pointer hover:bg-[#0D7A73] transition"
          >
            CEGS
          </div>
          <div className="pt-1">
            <span className="eyebrow-text block text-[11px] text-[#0F8F87]">
              Career Expert Global Solutions
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
              Sign In to CEGS LMS
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-normal max-w-xs mx-auto">
            Authorized Portal Access · Enter your official Login ID or Registered Email
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            {errorDetails && (
              <p className="text-[11px] text-rose-700 pl-6 font-normal">
                {errorDetails}
              </p>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Login ID or Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. STD0001, MNTR0001, or name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-semibold text-[#0F8F87] hover:text-[#0D7A73] transition flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Forgot password?</span>
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 transition"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to LMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← Back to Public Overview
          </button>
        </div>
      </div>

      {/* Forgot Password Information Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-50 text-[#0F8F87]">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Password Recovery Policy</h3>
                  <p className="text-xs text-slate-500">How to reset your account password</p>
                </div>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <p className="font-semibold text-slate-800">
                Accounts are managed through an authorized hierarchy:
              </p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#0F8F87]">•</span>
                  <div>
                    <span className="font-semibold text-slate-800">Students: </span>
                    Please contact your assigned mentor. Your mentor can reset your password and provide a temporary access code.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#0F8F87]">•</span>
                  <div>
                    <span className="font-semibold text-slate-800">Mentors & Trainers: </span>
                    Please contact your CEGS LMS Administrator to issue a new temporary credential.
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-[#0F8F87]">•</span>
                  <div>
                    <span className="font-semibold text-slate-800">Administrators: </span>
                    Admin credentials can only be reset directly on the secure server using the CLI script (<code className="bg-slate-200 px-1 py-0.5 rounded text-[11px] font-mono">npm run create-admin -- --reset</code>).
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
