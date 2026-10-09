import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, ClipboardCheck, Users, FolderKanban, X, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    lessons: any[];
    assessments: any[];
    projects: any[];
  }>({
    students: [],
    lessons: [],
    assessments: [],
    projects: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // parent handles toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ students: [], lessons: [], assessments: [], projects: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/search?q=${encodeURIComponent(query)}`);
        if (res.data?.success) {
          setResults(res.data.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const hasResults =
    results.students.length > 0 ||
    results.lessons.length > 0 ||
    results.assessments.length > 0 ||
    results.projects.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search lessons, assessments, projects..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100 text-xs">
          {loading && (
            <div className="py-6 text-center text-slate-400 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              Searching curriculum & records...
            </div>
          )}

          {!loading && !query && (
            <div className="py-6 px-4 text-center text-slate-400">
              <p className="font-medium text-slate-600">Quick Navigation</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <button
                  onClick={() => {
                    navigate('/learning');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
                >
                  My Learning
                </button>
                <button
                  onClick={() => {
                    navigate('/assessments');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
                >
                  Weekly Assessments
                </button>
                <button
                  onClick={() => {
                    navigate('/projects');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
                >
                  Live Projects
                </button>
                <button
                  onClick={() => {
                    navigate('/placement');
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg"
                >
                  Placement Drives
                </button>
              </div>
            </div>
          )}

          {!loading && query && !hasResults && (
            <div className="py-8 text-center text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {/* Lessons */}
          {results.lessons.length > 0 && (
            <div className="py-2">
              <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Lessons & Curriculum
              </p>
              {results.lessons.map((l) => (
                <div
                  key={l._id}
                  onClick={() => {
                    navigate('/learning');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <BookOpen className="w-4 h-4 text-brand-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{l.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-600 transition" />
                </div>
              ))}
            </div>
          )}

          {/* Assessments */}
          {results.assessments.length > 0 && (
            <div className="py-2">
              <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Assessments
              </p>
              {results.assessments.map((a) => (
                <div
                  key={a._id}
                  onClick={() => {
                    navigate('/assessments');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <ClipboardCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{a.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-600 transition" />
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {results.projects.length > 0 && (
            <div className="py-2">
              <p className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Projects
              </p>
              {results.projects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    navigate('/projects');
                    onClose();
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FolderKanban className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{p.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with arrows or mouse</span>
          <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px]">ESC</kbd>
        </div>
      </div>
    </div>
  );
};
