import React from 'react';
import {
  Sparkles,
  Award,
  ChevronRight,
  ShieldCheck,
  Star,
  ExternalLink,
  Flame,
  CheckCircle2,
  X,
  Share2,
  MoreVertical,
  ArrowLeft,
  Wifi,
  Battery,
} from 'lucide-react';
import { useAuthStore } from '../../../store/authStore.js';
import { useNavigate } from 'react-router-dom';

interface GrowlyProfilePhoneCardProps {
  onClose?: () => void;
  isFloatingModal?: boolean;
}

export const GrowlyProfilePhoneCard: React.FC<GrowlyProfilePhoneCardProps> = ({
  onClose,
  isFloatingModal = false,
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const candidateName = user?.name || 'Oliver Cranston';
  const candidateRole =
    (user?.studentProfile?.track as any)?.name ||
    user?.studentProfile?.preferredTrack ||
    'Middle UX Designer';

  return (
    <div className={`relative select-none ${isFloatingModal ? 'animate-in zoom-in-95 duration-200' : ''}`}>
      {/* Mobile Device Frame Mockup */}
      <div className="w-[310px] sm:w-[330px] rounded-[44px] bg-[#0F172A] p-3 shadow-[0_25px_70px_-15px_rgba(15,23,42,0.35)] border-[5px] border-slate-900 relative overflow-hidden ring-1 ring-slate-800">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Screen Bezel Container */}
        <div className="rounded-[36px] bg-gradient-to-b from-[#0A857D] via-[#0D7A73] to-[#0A615B] text-white p-5 pt-8 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
          {/* Subtle Ambient Background Wash */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Status Bar */}
          <div className="relative z-10 flex items-center justify-between text-[11px] font-medium text-white/80 pb-2">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Top Bar inside app */}
          <div className="relative z-10 flex items-center justify-between pt-1 pb-4">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <h4 className="font-extrabold text-sm tracking-tight">Profile</h4>
            <div className="flex items-center gap-1">
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {isFloatingModal && (
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Profile Card Center Content (Exact Dribbble layout) */}
          <div className="relative z-10 text-center space-y-4 my-auto">
            {/* Circular Avatar with Glowing Ring */}
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400 via-teal-200 to-white animate-spin-slow opacity-80 blur-sm" />
              <div className="relative w-full h-full rounded-full p-1 bg-white/20 backdrop-blur-md">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
                  alt={candidateName}
                  className="w-full h-full object-cover rounded-full border-2 border-white"
                />
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
            </div>

            {/* Candidate Name & Title */}
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{candidateName}</h3>
              <p className="text-xs text-white/80 font-medium mt-0.5">{candidateRole}</p>
            </div>

            {/* 3 Metric Pills (Technical Skills 86%, Soft Skills 92%, Experience 8 years) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">
                  Technical
                </span>
                <span className="text-base font-black text-white mt-0.5 block">86%</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">
                  Soft Skills
                </span>
                <span className="text-base font-black text-white mt-0.5 block">92%</span>
              </div>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2.5 border border-white/20 text-center">
                <span className="text-[10px] text-white/70 block uppercase font-bold tracking-wider">
                  Exp / Cohort
                </span>
                <span className="text-base font-black text-white mt-0.5 block">Month 3</span>
              </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-white/90">
                <span className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>Key Achievements</span>
                </span>
                <span className="text-[10px] text-white/70">Top 5% Cohort</span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 bg-black/10 rounded-lg p-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                  <span className="text-white/90 truncate font-semibold">14-Day Learning Practice Streak</span>
                </div>
                <div className="flex items-center gap-2 bg-black/10 rounded-lg p-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                  <span className="text-white/90 truncate font-semibold">MongoDB Schema Design 96%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Button */}
          <div className="relative z-10 pt-3">
            <button
              onClick={() => {
                navigate('/profile');
                if (onClose) onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-white text-[#0A615B] hover:bg-white/90 font-black text-xs transition shadow-lg flex items-center justify-center gap-1.5"
            >
              <span>View Full Candidate Portfolio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
