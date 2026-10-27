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
  Plus,
  Edit3,
  Trash2,
  Link2,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import { IModule, ILesson } from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { ManageLessonModal } from './components/ManageLessonModal.js';
import { formatEmbedUrl, isDirectVideoUrl } from '../../utils/mediaUtils.js';
import { ManageModuleModal } from './components/ManageModuleModal.js';

export const LearningDashboard: React.FC = () => {
  const { role } = useAuthStore();
  const canManage = role === 'mentor' || role === 'admin';

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
  const [bottomTab, setBottomTab] = useState<'description' | 'notes' | 'resources'>('description');

  // Modals for mentor content management
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [lessonToEdit, setLessonToEdit] = useState<ILesson | null>(null);
  const [targetModuleIdForNewLesson, setTargetModuleIdForNewLesson] = useState<string | undefined>(undefined);

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<IModule | null>(null);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      setLoading(true);
      const [modulesRes, progressRes] = await Promise.all([
        api.get('/curriculum/modules'),
        api.get('/curriculum/progress/me').catch(() => ({ data: { success: false } })),
      ]);

      if (modulesRes.data?.success) {
        const fetchedModules: IModule[] = modulesRes.data.data;
        setModules(fetchedModules);

        // Pre-select first lesson if available and none selected yet
        if (fetchedModules.length > 0 && !selectedLesson) {
          const firstModWithLessons = fetchedModules.find((m) => m.lessons && m.lessons.length > 0);
          if (firstModWithLessons && firstModWithLessons.lessons && firstModWithLessons.lessons.length > 0) {
            setSelectedLesson(firstModWithLessons.lessons[0]);
          }
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
      toast.success('Lesson notes saved successfully!');
    } catch (err) {
      toast.info('Notes saved locally.');
    } finally {
      setSavingNotes(false);
    }
  };

  // Mentor callbacks for saving & deleting
  const handleLessonSaved = (savedLesson: ILesson, isNew: boolean) => {
    const targetModId = typeof savedLesson.module === 'string'
      ? savedLesson.module
      : (savedLesson.module as any)?._id;

    setModules((prevModules) =>
      prevModules.map((mod) => {
        if (mod._id === targetModId) {
          const currentLessons = mod.lessons ? [...mod.lessons] : [];
          if (isNew) {
            return { ...mod, lessons: [...currentLessons, savedLesson] };
          } else {
            return {
              ...mod,
              lessons: currentLessons.map((l) => (l._id === savedLesson._id ? savedLesson : l)),
            };
          }
        }
        return mod;
      })
    );

    if (selectedLesson?._id === savedLesson._id || isNew) {
      setSelectedLesson(savedLesson);
    }
  };

  const handleDeleteLesson = async (lessonId: string, targetModuleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this topic and its learning materials?')) {
      return;
    }

    try {
      await api.delete(`/curriculum/lessons/${lessonId}`);
      toast.success('Topic deleted successfully.');

      setModules((prevModules) =>
        prevModules.map((mod) => {
          if (mod._id === targetModuleId) {
            return {
              ...mod,
              lessons: (mod.lessons || []).filter((l) => l._id !== lessonId),
            };
          }
          return mod;
        })
      );

      if (selectedLesson?._id === lessonId) {
        // Pick next available lesson
        const allRemaining = modules.flatMap((m) => (m.lessons || []).filter((l) => l._id !== lessonId));
        setSelectedLesson(allRemaining[0] || null);
      }
    } catch (err: any) {
      console.error('Error deleting lesson:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete lesson.');
    }
  };

  const handleModuleSaved = (savedMod: IModule, isNew: boolean) => {
    if (isNew) {
      setModules((prev) => [...prev, { ...savedMod, lessons: [] }]);
    } else {
      setModules((prev) =>
        prev.map((m) => (m._id === savedMod._id ? { ...m, ...savedMod } : m))
      );
    }
  };

  const handleDeleteModule = async (moduleId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this module and ALL its lessons?')) {
      return;
    }

    try {
      await api.delete(`/curriculum/modules/${moduleId}`);
      toast.success('Module deleted successfully.');
      setModules((prev) => prev.filter((m) => m._id !== moduleId));
      if (
        selectedLesson &&
        (typeof selectedLesson.module === 'string'
          ? selectedLesson.module === moduleId
          : (selectedLesson.module as any)?._id === moduleId)
      ) {
        setSelectedLesson(null);
      }
    } catch (err: any) {
      console.error('Error deleting module:', err);
      toast.error(err?.response?.data?.message || 'Failed to delete module.');
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
      {/* Top Filter & Action Bar - Single Row No Scrolling */}
      <div className="w-full flex items-center justify-between gap-2.5">
        {/* Left: View Switcher / Filter Pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {viewMode === 'player' ? (
            <button
              onClick={() => setViewMode('catalog')}
              className="h-9 px-3.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition flex items-center gap-1.5 shadow-2xs flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
              <span>Back to Catalog</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs text-xs font-semibold flex-nowrap flex-shrink-0">
              {(
                [
                  { id: 'all' as const, label: 'All', count: modules.length },
                  { id: 'in_progress' as const, label: 'In Progress', count: undefined },
                  { id: 'completed' as const, label: 'Completed', count: undefined },
                  { id: 'bookmarked' as const, label: 'Bookmarked', count: bookmarkedLessonIds.length > 0 ? bookmarkedLessonIds.length : undefined },
                ]
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#0F8F87] text-white shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Search, Resume Button, and Mentor Management Actions */}
        <div className="flex items-center gap-2 flex-nowrap flex-shrink-0">
          {viewMode === 'catalog' && (
            <div className="relative w-36 sm:w-44 md:w-48 flex-shrink">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full h-9 pl-8 pr-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] shadow-2xs text-slate-700 placeholder:text-slate-400"
              />
            </div>
          )}

          {/* Mentor & Admin Management Buttons */}
          {canManage && (
            <>
              <button
                onClick={() => {
                  setTargetModuleIdForNewLesson(undefined);
                  setLessonToEdit(null);
                  setIsLessonModalOpen(true);
                }}
                className="h-9 px-3 rounded-xl bg-gradient-to-r from-teal-600 to-[#0F8F87] hover:from-teal-700 hover:to-[#0D7A73] text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap cursor-pointer"
                title="Add Topic with Video and Documents"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Topic</span>
              </button>

              <button
                onClick={() => {
                  setModuleToEdit(null);
                  setIsModuleModalOpen(true);
                }}
                className="h-9 px-3 rounded-xl bg-white border border-slate-200 hover:border-[#0F8F87] text-slate-700 hover:text-[#0F8F87] text-xs font-bold transition shadow-2xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap cursor-pointer"
                title="Create a new curriculum module"
              >
                <Layers className="w-3.5 h-3.5 text-[#0F8F87]" />
                <span>New Module</span>
              </button>
            </>
          )}

          {viewMode === 'catalog' && (
            <button
              onClick={() => setViewMode('player')}
              className="h-9 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap cursor-pointer"
              title="Resume Video Player"
            >
              <Play className="w-3 h-3 fill-current text-teal-400" />
              <span>Resume</span>
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
                <span className="text-xs text-slate-400 font-medium">
                  {canManage ? 'Faculty & Mentor Learning Workspace' : 'Full Stack & Cloud Growth Program'}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {canManage
                  ? `Active Learning Catalog: ${modules.length} Modules • ${allLessons.length} Topics`
                  : `Overall Program Completion: ${overallProgressPercent}%`}
              </h3>
              <p className="text-xs text-slate-500">
                {canManage
                  ? 'Mentors can upload videos, lecture documentation, code blueprints, and manage syllabus modules.'
                  : `${completedLessonIds.length} of ${totalLessonsCount} core lessons and coding labs mastered.`}
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

                return (
                  <div
                    key={mod._id}
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between group relative"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded-lg bg-teal-50 text-[#0F8F87] border border-teal-200">
                          Month {mod.monthNumber} • Week {mod.weekNumber}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {mod.durationHours}h
                          </span>
                          {/* Mentor Edit/Delete Module Buttons */}
                          {canManage && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModuleToEdit(mod);
                                  setIsModuleModalOpen(true);
                                }}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                                title="Edit Module"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteModule(mod._id, e)}
                                className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                title="Delete Module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-[#0F8F87] transition line-clamp-2">
                        {mod.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {mod.description || 'Comprehensive industry curriculum modules designed by CEGS lead architects.'}
                      </p>

                      {/* Segmented Progress Indicator */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">{lessons.length} Topics / Lessons</span>
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

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {completedInMod}/{lessons.length} completed
                      </span>

                      <div className="flex items-center gap-2">
                        {canManage && (
                          <button
                            onClick={() => {
                              setTargetModuleIdForNewLesson(mod._id);
                              setLessonToEdit(null);
                              setIsLessonModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8F87] text-xs font-bold transition"
                            title="Add topic video and doc to this module"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Topic</span>
                          </button>
                        )}

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
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: LESSON PLAYER & STUDIO */}
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
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="badge-teal">
                          Lesson {selectedLesson.order} • {selectedLesson.contentType.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {selectedLesson.durationMinutes} mins
                        </span>
                        {selectedLesson.contentUrl && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            <Video className="w-3 h-3" />
                            Video Attached
                          </span>
                        )}
                        {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                            <FileText className="w-3 h-3" />
                            {selectedLesson.resources.length} Docs / Links
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                        {selectedLesson.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Mentor Edit Topic Button */}
                      {canManage && (
                        <button
                          onClick={() => {
                            setLessonToEdit(selectedLesson);
                            setIsLessonModalOpen(true);
                          }}
                          className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-[#0F8F87] text-xs font-bold transition flex items-center gap-1.5 border border-teal-200/80 shadow-2xs"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit Video & Docs</span>
                        </button>
                      )}

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

                  {/* Video Player or Document Banner */}
                  {selectedLesson.contentType === 'video' ? (
                    selectedLesson.contentUrl ? (
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md">
                        {isDirectVideoUrl(selectedLesson.contentUrl) ? (
                          <video
                            src={selectedLesson.contentUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <iframe
                            src={formatEmbedUrl(selectedLesson.contentUrl)}
                            title={selectedLesson.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        )}
                      </div>
                    ) : (
                      <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col items-center justify-center text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-teal-400">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-extrabold text-base">No video lecture attached yet</p>
                          <p className="text-xs text-slate-400 max-w-sm">
                            {canManage
                              ? 'Click below to attach a YouTube video, Vimeo, or direct video recording for students.'
                              : 'Your mentor will upload the technical video lecture for this topic shortly.'}
                          </p>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => {
                              setLessonToEdit(selectedLesson);
                              setIsLessonModalOpen(true);
                            }}
                            className="px-4 py-2 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Attach Video & Documents</span>
                          </button>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-navy-900 text-white flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-teal-400" />
                        <div>
                          <p className="font-extrabold text-base">Reading & Hands-on Architecture Guide</p>
                          <p className="text-xs text-slate-300">Follow the technical notes and practice resources below.</p>
                        </div>
                      </div>
                      {selectedLesson.contentUrl && (
                        <a
                          href={selectedLesson.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open Document</span>
                        </a>
                      )}
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

                  {/* Tabs Below Video: Description, Notes, Resources */}
                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs font-bold">
                      <button
                        onClick={() => setBottomTab('description')}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          bottomTab === 'description'
                            ? 'bg-teal-50 text-[#0F8F87]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        Description & Notes
                      </button>
                      <button
                        onClick={() => setBottomTab('resources')}
                        className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                          bottomTab === 'resources'
                            ? 'bg-teal-50 text-[#0F8F87]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span>Documents & Resources</span>
                        {(selectedLesson.resources?.length || 0) > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800 text-[10px]">
                            {selectedLesson.resources?.length}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => setBottomTab('notes')}
                        className={`px-3 py-1.5 rounded-lg transition ${
                          bottomTab === 'notes'
                            ? 'bg-teal-50 text-[#0F8F87]'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        My Personal Notes
                      </button>
                    </div>

                    {/* Tab 1: Description & Walkthrough */}
                    {bottomTab === 'description' && (
                      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {selectedLesson.description && (
                          <p className="font-semibold text-slate-800">
                            {selectedLesson.description}
                          </p>
                        )}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 whitespace-pre-line text-slate-600">
                          {selectedLesson.bodyText ||
                            'Detailed curriculum walkthrough provided by Career Expert Global Solutions instructor panel.'}
                        </div>

                        {selectedLesson.codeSnippets && selectedLesson.codeSnippets.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                                <Code className="w-4 h-4 text-[#0F8F87]" />
                                {selectedLesson.codeSnippets[0].title || 'Code Architecture Example'}
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedLesson.codeSnippets![0].code);
                                  toast.success('Code copied to clipboard!');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] text-[#0F8F87] font-bold hover:underline"
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

                    {/* Tab 2: Documents & Resources (Dynamic from Lesson Model) */}
                    {bottomTab === 'resources' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-700">
                            Topic Documents, Blueprints & Repositories
                          </span>
                          {canManage && (
                            <button
                              onClick={() => {
                                setLessonToEdit(selectedLesson);
                                setIsLessonModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8F87] text-xs font-bold transition border border-teal-200"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Manage Documents</span>
                            </button>
                          )}
                        </div>

                        {selectedLesson.resources && selectedLesson.resources.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {selectedLesson.resources.map((item, idx) => (
                              <div
                                key={idx}
                                className="p-3.5 rounded-2xl border border-slate-200 hover:border-teal-300 bg-white shadow-2xs hover:shadow-xs transition flex items-center justify-between gap-3 group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#0F8F87] flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="font-bold text-xs text-slate-900 truncate group-hover:text-[#0F8F87] transition">
                                      {item.title}
                                    </p>
                                    <p className="text-[11px] text-slate-400 truncate">{item.url}</p>
                                  </div>
                                </div>

                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0F8F87] hover:text-white text-slate-700 text-[11px] font-bold transition flex items-center gap-1 flex-shrink-0"
                                >
                                  <span>Open</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">No documents or links attached yet</p>
                            <p className="text-[11px] text-slate-400">
                              {canManage
                                ? 'Click "Manage Documents" to attach PDFs, slides, or repository links.'
                                : 'Your mentor will post reference documents and templates here.'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: Personal Study Notes */}
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
                <h3 className="font-extrabold text-sm text-slate-900">Course Outline</h3>
                <p className="text-[11px] text-slate-400">
                  {completedLessonIds.length} of {totalLessonsCount} completed
                </p>
              </div>
              <div className="flex items-center gap-2">
                {canManage && (
                  <button
                    onClick={() => {
                      setTargetModuleIdForNewLesson(undefined);
                      setLessonToEdit(null);
                      setIsLessonModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F8F87] transition"
                    title="Add Topic / Lesson"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                <span className="badge-teal text-[10px]">
                  {overallProgressPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[650px] overflow-y-auto pr-1">
              {modules.map((mod) => (
                <div
                  key={mod._id}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-[#0F8F87] uppercase tracking-wider">
                      Month {mod.monthNumber} • W{mod.weekNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {mod.durationHours}h
                      </span>
                      {canManage && (
                        <button
                          onClick={() => {
                            setTargetModuleIdForNewLesson(mod._id);
                            setLessonToEdit(null);
                            setIsLessonModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-[#0F8F87] transition"
                          title="Add Topic to this week"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
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
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition group ${
                            isSelected
                              ? 'bg-[#0F8F87] text-white font-bold shadow-sm'
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

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Mentor Quick Edit / Delete */}
                            {canManage && (
                              <div
                                className={`flex items-center gap-1 ${
                                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                } transition`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLessonToEdit(lesson);
                                    setIsLessonModalOpen(true);
                                  }}
                                  className={`p-1 rounded ${
                                    isSelected
                                      ? 'hover:bg-teal-700 text-white'
                                      : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                                  }`}
                                  title="Edit Topic"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteLesson(lesson._id, mod._id, e)}
                                  className={`p-1 rounded ${
                                    isSelected
                                      ? 'hover:bg-rose-700 text-rose-200'
                                      : 'hover:bg-rose-100 text-slate-400 hover:text-rose-600'
                                  }`}
                                  title="Delete Topic"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}

                            <span
                              className={`text-[10px] ml-1 ${
                                isSelected ? 'text-teal-100' : 'text-slate-400'
                              }`}
                            >
                              {lesson.durationMinutes}m
                            </span>
                          </div>
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

      {/* MODALS */}
      {/* 1. Add / Edit Topic, Video & Documents Modal */}
      <ManageLessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSaved={handleLessonSaved}
        modules={modules}
        initialModuleId={targetModuleIdForNewLesson}
        lessonToEdit={lessonToEdit}
      />

      {/* 2. Create / Edit Module Modal */}
      <ManageModuleModal
        isOpen={isModuleModalOpen}
        onClose={() => setIsModuleModalOpen(false)}
        onSaved={handleModuleSaved}
        moduleToEdit={moduleToEdit}
      />
    </div>
  );
};
