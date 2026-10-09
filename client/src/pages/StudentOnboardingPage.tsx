import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  User,
  BookOpen,
  Briefcase,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore.js';
import api from '../services/api.js';

export const StudentOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setAuth, token } = useAuthStore();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Personal Info
  const [phone, setPhone] = useState(user?.studentProfile?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.studentProfile?.city || 'Hyderabad');
  const [state, setState] = useState(user?.studentProfile?.state || 'Telangana');
  const [dob, setDob] = useState('2002-06-18');

  // Step 2: Education
  const [degree, setDegree] = useState(user?.studentProfile?.degree || 'B.Tech in Computer Science & Engineering');
  const [college, setCollege] = useState(user?.studentProfile?.college || 'Jawaharlal Nehru Technological University');
  const [graduationYear, setGraduationYear] = useState(user?.studentProfile?.graduationYear || 2024);
  const [academicBackground, setAcademicBackground] = useState(
    user?.studentProfile?.academicBackground || 'Computer Science & Engineering'
  );

  // Step 3: Career Preferences
  const [preferredTrack, setPreferredTrack] = useState(
    user?.studentProfile?.preferredTrack || 'Full Stack Development'
  );
  const [targetRole, setTargetRole] = useState(user?.studentProfile?.targetRole || 'Full Stack Software Engineer');
  const [careerGoals, setCareerGoals] = useState(
    user?.studentProfile?.careerGoals || 'Join a top product enterprise building modern web applications.'
  );

  // Step 4: Skill Assessment
  const [strengths, setStrengths] = useState<string[]>([
    'JavaScript / TypeScript',
    'React Ecosystem',
    'Logical Problem Solving',
  ]);
  const [skillGaps, setSkillGaps] = useState<string[]>([
    'System Design & Microservices',
    'Docker & Container Orchestration',
    'Performance Optimization',
  ]);

  const tracks = [
    'Full Stack Development',
    'AI Engineer',
    'Automation Testing',
    'Data Analytics',
    'Cloud & DevOps',
  ];

  const handleNextStep = async () => {
    setSaving(true);
    try {
      await api.post('/students/onboarding', {
        step: step + 1,
        personalInfo: { phone, city, state, dob },
        education: { degree, college, graduationYear: Number(graduationYear), academicBackground },
        careerPreferences: { preferredTrack, targetRole, careerGoals },
        skillAssessment: { strengths, skillGaps },
      });
      setStep((prev) => prev + 1);
    } catch (err) {
      // Proceed on client state even if offline
      setStep((prev) => prev + 1);
    } finally {
      setSaving(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const res = await api.post('/students/onboarding', {
        step: 5,
        personalInfo: { phone, city, state, dob },
        education: { degree, college, graduationYear: Number(graduationYear), academicBackground },
        careerPreferences: { preferredTrack, targetRole, careerGoals },
        skillAssessment: { strengths, skillGaps },
      });

      if (res.data?.success && user && token) {
        setAuth({ ...user, isFirstLogin: false, studentProfile: res.data.data }, token);
      }
      navigate('/dashboard');
    } catch (err) {
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-8">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#0F8F87] flex items-center justify-center text-white mx-auto shadow-md shadow-[#0F8F87]/20">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome to Your 6-Month Growth Journey
          </h1>
          <p className="text-xs text-slate-500">
            Let's configure your candidate profile and personalize your learning trajectory.
          </p>
        </div>

        {/* Step Progression Bar */}
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-0 -translate-y-1/2" />
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold z-10 transition-all ${
                step === s
                  ? 'bg-[#0F8F87] text-white ring-4 ring-teal-100 shadow-md'
                  : step > s
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white border-2 border-slate-300 text-slate-400'
              }`}
            >
              {step > s ? '✓' : s}
            </div>
          ))}
        </div>

        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0F8F87]" />
                Step 1: Personal Information
              </h2>
              <p className="text-xs text-slate-500">Basic contact coordinates for your cohort mentor.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Education */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0F8F87]" />
                Step 2: Academic Background
              </h2>
              <p className="text-xs text-slate-500">Your degree and educational qualifications.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Degree & Major</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">College / University</label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Academic Focus</label>
                  <input
                    type="text"
                    value={academicBackground}
                    onChange={(e) => setAcademicBackground(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Career Preferences */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-[#0F8F87]" />
                Step 3: Career Track & Goals
              </h2>
              <p className="text-xs text-slate-500">Select your specialization for the 6-month journey.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Preferred Program Track</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {tracks.map((t) => (
                    <div
                      key={t}
                      onClick={() => setPreferredTrack(t)}
                      className={`p-3 rounded-xl border cursor-pointer font-bold transition flex items-center justify-between ${
                        preferredTrack === t
                          ? 'border-[#0F8F87] bg-teal-50/70 text-teal-950 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{t}</span>
                      {preferredTrack === t && <CheckCircle className="w-4 h-4 text-[#0F8F87]" />}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Job Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Career Aspirations</label>
                <textarea
                  rows={2}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Skill Assessment Baseline */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0F8F87]" />
                Step 4: Skill Assessment & Baseline
              </h2>
              <p className="text-xs text-slate-500">Identify your current competencies and key focus areas.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <p className="font-bold text-slate-700 mb-2">Recognized Technical Strengths</p>
                <div className="flex flex-wrap gap-2">
                  {strengths.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold"
                    >
                      ✓ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-2">Growth Levers / Identified Skill Gaps</p>
                <div className="flex flex-wrap gap-2">
                  {skillGaps.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-semibold"
                    >
                      ⚡ {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl">
                <p className="font-bold text-teal-900">Baseline Diagnostic Score: 78%</p>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  Great baseline capability! The system has synthesized a targeted progression path for your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Your Recommended Learning Path */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="text-center space-y-1 pb-2">
              <span className="badge-teal">Generated Learning Blueprint</span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Your Recommended Learning Path
              </h2>
              <p className="text-xs text-slate-500">
                Tailored for the 6-Month Freshers Growth Training Program
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/80 to-emerald-50/40 border border-teal-200 space-y-3">
              <div className="flex items-center justify-between border-b border-teal-100 pb-2.5">
                <div>
                  <p className="text-xs text-[#0F8F87] font-semibold">Specialization Track</p>
                  <p className="text-sm font-extrabold text-teal-950">{preferredTrack}</p>
                </div>
                <span className="badge-teal">Level: Intermediate Accelerator</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <p className="text-slate-500 font-semibold mb-1">Recommended Starting Point</p>
                  <p className="font-bold text-slate-800">Month 1: Orientation & Foundations</p>
                </div>
                <div>
                  <p className="text-slate-500 font-semibold mb-1">Upcoming Assessment</p>
                  <p className="font-bold text-slate-800">Week 1 Diagnostic Milestone</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800">Key Milestones Ahead:</p>
              <ul className="space-y-1.5 text-slate-600">
                <li>• Week 1–4: Foundations & Track Fundamentals</li>
                <li>• Week 5–8: Professional Communication & SWOT Review</li>
                <li>• Week 9–12: Core Technical Training (Express, Node.js, MongoDB)</li>
                <li>• Week 13–16: Enterprise Live Project Capstone & Sprints</li>
                <li>• Week 17–20: Placement Drives & System Design Prep</li>
                <li>• Week 21–24: Final Partner Placement & Official Certification</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => prev - 1)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              disabled={saving}
              onClick={handleNextStep}
              className="px-5 py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0F8F87]/20 transition flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={handleFinish}
              className="px-6 py-3 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0F8F87]/20 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch My Student Dashboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
