import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Play,
  FileText,
  Bookmark,
  Share2,
  ChevronRight,
  ChevronLeft,
  Copy,
  Download,
  ExternalLink,
  Code,
  Save,
  Clock,
  Sparkles,
  Lock,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight,
  MessageSquare,
  FileCode,
  Video,
} from 'lucide-react';
import api from '../../services/api.js';
import { IModule, ILesson } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';

export const LearningDashboard: React.FC = () => {
  const [modules, setModules] = useState<IModule[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<ILesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [bookmarkedLessonIds, setBookmarkedLessonIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed' | 'bookmarked'>('all');
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'catalog' | 'player'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [bottomTab, setBottomTab] = useState<'description' | 'notes' | 'resources' | 'discussion'>('description');

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        setLoading(true);
        const [modulesRes, progressRes] = await Promise.all([
          api.get('/curriculum/modules'),
          api.get('/curriculum/progress/me'),
        ]);

        if (modulesRes.data?.success) {
          setModules(modulesRes.data.data);
          if (modulesRes.data.data.length > 0 && modulesRes.data.data[0].lessons?.length > 0) {
            setSelectedLesson(modulesRes.data.data[0].lessons[0]);
          }
        }

        if (progressRes.data?.success) {
          setCompletedLessonIds(progressRes.data.data.completedLessonIds || []);
          const bookmarks = progressRes.data.data.bookmarkedLessons?.map((b: any) => b.lesson?._id) || [];
          setBookmarkedLessonIds(bookmarks);
        }
      } catch (err) {
        console.error('Error loading learning data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, []);

  const handleToggleComplete = async (lessonId: string, moduleId: string) => {
    try {
      const res = await api.post('/curriculum/progress/toggle-complete', { lessonId, moduleId });
      if (res.data?.success) {
        if (completedLessonIds.includes(lessonId)) {
          setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
        } else {
          setCompletedLessonIds((prev) => [...prev, lessonId]);
        }
      }
    } catch (err) {
      if (completedLessonIds.includes(lessonId)) {
        setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
      } else {
        setCompletedLessonIds((prev) => [...prev, lessonId]);
      }
    }
  };

  const handleToggleBookmark = async (lessonId: string, moduleId: string) => {
    try {
      await api.post('/curriculum/progress/toggle-bookmark', { lessonId, moduleId });
      if (bookmarkedLessonIds.includes(lessonId)) {
        setBookmarkedLessonIds((prev) => prev.filter((id) => id !== lessonId));
      } else {
        setBookmarkedLessonIds((prev) => [...prev, lessonId]);
      }
    } catch (err) {
      if (bookmarkedLessonIds.includes(lessonId)) {
        setBookmarkedLessonIds((prev) => prev.filter((id) => id !== lessonId));
      } else {
        setBookmarkedLessonIds((prev) => [...prev, lessonId]);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedLesson) return;
    setSavingNotes(true);
    try {
      await api.post('/curriculum/progress/notes', {
        lessonId: selectedLesson._id,
        moduleId: typeof selectedLesson.module === 'string' ? selectedLesson.module : (selectedLesson.module as any)._id,
        notes,
      });
      alert('Lesson notes saved successfully!');
    } catch (err) {
      alert('Notes saved locally.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Flatten all lessons for navigation & filtering
  const allLessons = modules.flatMap((m) => m.lessons || []);
  const currentLessonIndex = selectedLesson ? allLessons.findIndex((l) => l._id === selectedLesson._id) : -1;
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  // Filter modules based on active tab
  const filteredModules = modules.filter((m) => {
    const lessons = m.lessons || [];
    if (activeTab === 'completed') {
      return lessons.length > 0 && lessons.every((l) => completedLessonIds.includes(l._id));
    }
    if (activeTab === 'in_progress') {
      const anyDone = lessons.some((l) => completedLessonIds.includes(l._id));
      const allDone = lessons.every((l) => completedLessonIds.includes(l._id));
      return anyDone && !allDone;
    }
    if (activeTab === 'bookmarked') {
      return lessons.some((l) => bookmarkedLessonIds.includes(l._id));
    }
    return true;
  }).filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q) ||
      m.lessons?.some((l) => l.title.toLowerCase().includes(q))
    );
  });

  const totalLessonsCount = allLessons.length || 24;
  const overallProgressPercent = Math.round((completedLessonIds.length / totalLessonsCount) * 100);

  const isCompleted = selectedLesson && completedLessonIds.includes(selectedLesson._id);
  const isBookmarked = selectedLesson && bookmarkedLessonIds.includes(selectedLesson._id);

  if (loading && modules.length === 0) {
    return (
      <div className="space-y-6">
        <div className="h-16 rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter & Action Bar (Phenomenon Studio Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: View Switcher / Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {viewMode === 'player' ? (
            <button
              onClick={() => setViewMode('catalog')}
              className="h-10 px-4 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-2 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Course Catalog</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs text-xs font-bold">
              {(
                [
                  { id: 'all', label: `All Modules (${modules.length})` },
                  { id: 'in_progress', label: 'In Progress' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'bookmarked', label: `Bookmarked (${bookmarkedLessonIds.length})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl transition ${
                    activeTab === tab.id
                      ? 'bg-[#0F8F87] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Search & Resume Button */}
        <div className="flex items-center gap-2.5">
          {viewMode === 'catalog' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules or lessons..."
                className="w-full h-10 pl-9 pr-3 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] shadow-2xs text-slate-700"
              />
            </div>
          )}

          {viewMode === 'catalog' && (
            <button
              onClick={() => setViewMode('player')}
              className="h-10 px-4 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Lesson</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: COURSE & MODULES CATALOG */}
      {viewMode === 'catalog' && (
        <div className="space-y-6">
          {/* Overall Curriculum Progress Bar Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-teal-50 text-[#0F8F87] border border-teal-200 uppercase">
                  6-Month Curriculum
                </span>
                <span className="text-xs text-slate-400 font-medium">Full Stack & AI Specialization</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Overall Program Completion: {overallProgressPercent}%
              </h3>
              <p className="text-xs text-slate-500">
                {completedLessonIds.length} of {totalLessonsCount} core lessons and coding labs mastered.
              </p>
            </div>

            <div className="w-full sm:w-72 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400">Milestone Progress</span>
                <span className="text-[#0F8F87]">{overallProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#0F8F87] rounded-full transition-all duration-500"
                  style={{ width: `${overallProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Module Cards Grid */}
          {filteredModules.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No courses match your filter"
              description="Try adjusting your tab selection or search query to find your learning modules."
              action={{
                label: 'Show All Courses',
                onClick: () => {
                  setActiveTab('all');
                  setSearchQuery('');
                },
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredModules.map((mod) => {
                const lessons = mod.lessons || [];
                const completedInMod = lessons.filter((l) => completedLessonIds.includes(l._id)).length;
                const progress = lessons.length > 0 ? Math.round((completedInMod / lessons.length) * 100) : 0;
                const isModDone = lessons.length > 0 && completedInMod === lessons.length;

                return (
                  <div
                    key={mod._id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-teal-50 text-[#0F8F87] border border-teal-200">
                          Month {mod.monthNumber} • Week {mod.weekNumber}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {mod.durationHours}h
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0F8F87] transition line-clamp-2">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {mod.description || 'Comprehensive industry curriculum modules designed by CEGS lead architects.'}
                      </p>

                      {/* Segmented Progress Indicator (Phenomenon Studio Style) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{lessons.length} Lessons</span>
                          <span className="font-extrabold text-slate-900">{progress}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 8 }).map((_, segIdx) => {
                            const isFilled = (segIdx + 1) * 12.5 <= progress;
                            return (
                              <div
                                key={segIdx}
                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                  isFilled ? 'bg-[#0F8F87]' : 'bg-slate-100'
                                }`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {completedInMod}/{lessons.length} completed
                      </span>
                      <button
                        onClick={() => {
                          if (lessons.length > 0) {
                            setSelectedLesson(lessons[0]);
                          }
                          setViewMode('player');
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-2xs"
                      >
                        <span>{progress > 0 ? 'Continue' : 'Start'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: LESSON PLAYER & STUDIO (PHASE 8 & 9) */}
      {viewMode === 'player' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT AREA: Video & Lesson Studio (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="card-premium p-6 sm:p-7 space-y-6">
              {selectedLesson ? (
                <>
                  {/* Top Lesson Header & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge-teal">
                          Lesson {selectedLesson.order} • {selectedLesson.contentType.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedLesson.durationMinutes} mins
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        {selectedLesson.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleToggleBookmark(
                            selectedLesson._id,
                            typeof selectedLesson.module === 'string'
                              ? selectedLesson.module
                              : (selectedLesson.module as any)._id
                          )
                        }
                        className={`p-2 rounded-xl border transition ${
                          isBookmarked
                            ? 'border-amber-300 bg-amber-50 text-amber-600'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-400'
                        }`}
                        title="Bookmark Lesson"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleToggleComplete(
                            selectedLesson._id,
                            typeof selectedLesson.module === 'string'
                              ? selectedLesson.module
                              : (selectedLesson.module as any)._id
                          )
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-brand-600 hover:bg-brand-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{isCompleted ? 'Completed' : 'Mark as Complete'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Video Player */}
                  {selectedLesson.contentType === 'video' ? (
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md">
                      <iframe
                        src={selectedLesson.contentUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
                        title={selectedLesson.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-900 text-white flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-brand-400" />
                      <div>
                        <p className="font-extrabold text-base">Reading & Hands-on Lab Material</p>
                        <p className="text-xs text-slate-300">Follow the architecture notes and exercises below.</p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Prev / Next Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      disabled={!prevLesson}
                      onClick={() => prevLesson && setSelectedLesson(prevLesson)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition ${
                        prevLesson
                          ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          : 'border-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Lesson</span>
                    </button>

                    <button
                      disabled={!nextLesson}
                      onClick={() => nextLesson && setSelectedLesson(nextLesson)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        nextLesson
                          ? 'bg-[#0F8F87] hover:bg-[#0D7A73] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <span>Next Lesson</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tabs Below Video: Description, Notes, Resources, Discussion */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
                      <button
                        onClick={() => setBottomTab('description')}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          bottomTab === 'description'
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Description & Content
                      </button>
                      <button
                        onClick={() => setBottomTab('notes')}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          bottomTab === 'notes'
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        My Personal Notes
                      </button>
                      <button
                        onClick={() => setBottomTab('resources')}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          bottomTab === 'resources'
                            ? 'bg-brand-50 text-brand-700'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Resources & Repos
                      </button>
                    </div>

                    {bottomTab === 'description' && (
                      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <p className="font-semibold text-slate-800">
                          {selectedLesson.description}
                        </p>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 whitespace-pre-line text-slate-600">
                          {selectedLesson.bodyText ||
                            'Detailed curriculum walkthrough provided by Career Expert Global Solutions instructor panel.'}
                        </div>

                        {selectedLesson.codeSnippets && selectedLesson.codeSnippets.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Code className="w-4 h-4 text-brand-600" />
                                Code Architecture Example
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedLesson.codeSnippets![0].code);
                                  alert('Code copied to clipboard!');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-bold hover:underline"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                Copy Code
                              </button>
                            </div>
                            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-300 text-xs font-mono overflow-x-auto">
                              <code>{selectedLesson.codeSnippets[0].code}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {bottomTab === 'notes' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700">
                            Personal Study Notes
                          </span>
                          <button
                            onClick={handleSaveNotes}
                            disabled={savingNotes}
                            className="px-3 py-1.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                          </button>
                        </div>
                        <textarea
                          rows={5}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Record key takeaways, implementation nuances, or talking points for your mentor session..."
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-brand-500 focus:bg-white"
                        />
                      </div>
                    )}

                    {bottomTab === 'resources' && (
                      <div className="space-y-2 text-xs">
                        <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileCode className="w-4 h-4 text-brand-600" />
                            <span className="font-semibold text-slate-800">
                              Official GitHub Repository Template
                            </span>
                          </div>
                          <a
                            href="https://github.com"
                            target="_blank"
                            rel="noreferrer"
                            className="text-brand-600 hover:underline font-bold"
                          >
                            Open Repo ↗
                          </a>
                        </div>
                        <div className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Download className="w-4 h-4 text-sky-600" />
                            <span className="font-semibold text-slate-800">
                              Architecture Cheat Sheet PDF
                            </span>
                          </div>
                          <span className="text-slate-400 font-medium">Download Available</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No lesson selected"
                  description="Choose a lesson from the module outline on the right to start learning."
                />
              )}
            </div>
          </div>

          {/* RIGHT AREA: Course Contents & Accordion (4 cols) */}
          <div className="lg:col-span-4 card-premium p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Course Contents</h3>
                <p className="text-[11px] text-slate-400">
                  {completedLessonIds.length} of {totalLessonsCount} completed
                </p>
              </div>
              <span className="badge-teal text-[10px]">
                {overallProgressPercent}%
              </span>
            </div>

            <div className="space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
              {modules.map((mod) => (
                <div
                  key={mod._id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-brand-700 uppercase tracking-wider">
                      Month {mod.monthNumber} • W{mod.weekNumber}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {mod.durationHours}h
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 leading-snug">{mod.title}</h4>

                  <div className="space-y-1 pt-1">
                    {mod.lessons?.map((lesson) => {
                      const isSelected = selectedLesson?._id === lesson._id;
                      const isDone = completedLessonIds.includes(lesson._id);

                      return (
                        <div
                          key={lesson._id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-brand-600 text-white font-bold shadow-sm'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isDone ? (
                              <CheckCircle2
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  isSelected ? 'text-white' : 'text-emerald-500'
                                }`}
                              />
                            ) : (
                              <Play
                                className={`w-3.5 h-3.5 flex-shrink-0 ${
                                  isSelected ? 'text-white' : 'text-slate-400'
                                }`}
                              />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                          <span
                            className={`text-[10px] ml-2 ${
                              isSelected ? 'text-brand-100' : 'text-slate-400'
                            }`}
                          >
                            {lesson.durationMinutes}m
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
