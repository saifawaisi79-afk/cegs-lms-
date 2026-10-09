import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import api from '../services/api.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success) {
        const { user, token } = res.data;
        setAuth(user, token);

        // Check if student needs onboarding
        if (user.role === 'student' && user.isFirstLogin) {
          navigate('/onboarding');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'mentor') {
          navigate('/mentor');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.data?.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
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
            6-Month Freshers Growth Training Program · Job-Ready Career Platform
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts Bar */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <p className="eyebrow-text text-[10px] text-slate-500 text-center">
            Quick 1-Click Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => fillDemoAccount('student@careerexpertglobal.com')}
              className="py-1.5 px-2 bg-white hover:bg-teal-50 hover:text-[#0F8F87] text-slate-700 rounded-xl border border-slate-200 shadow-sm transition font-medium"
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('mentor@careerexpertglobal.com')}
              className="py-1.5 px-2 bg-white hover:bg-teal-50 hover:text-[#0F8F87] text-slate-700 rounded-xl border border-slate-200 shadow-sm transition font-medium"
            >
              Mentor
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@careerexpertglobal.com')}
              className="py-1.5 px-2 bg-white hover:bg-teal-50 hover:text-[#0F8F87] text-slate-700 rounded-xl border border-slate-200 shadow-sm transition font-medium"
            >
              Admin
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@careerexpertglobal.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <button
                type="button"
                onClick={() => alert('Demo password for all accounts is: Password123!')}
                className="text-[11px] font-semibold text-[#0F8F87] hover:text-[#0D7A73]"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] focus:ring-1 focus:ring-[#0F8F87] transition"
              />
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
    </div>
  );
};
