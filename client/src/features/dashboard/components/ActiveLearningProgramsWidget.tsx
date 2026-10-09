import React from 'react';
import { ArrowUpRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseProgram {
  id: string;
  title: string;
  category: string;
  avatars: { name: string; bg: string; text: string }[];
  extraCount: number;
  progress: number;
  dueDate: string;
  score: number;
}

export const ActiveLearningProgramsWidget: React.FC = () => {
  const navigate = useNavigate();

  const programs: CourseProgram[] = [
    {
      id: 'p1',
      title: 'IT English & Executive Poise',
      category: 'for Tech Teams',
      avatars: [
        { name: 'AK', bg: 'bg-emerald-500', text: 'text-white' },
        { name: 'SR', bg: 'bg-blue-500', text: 'text-white' },
        { name: 'MJ', bg: 'bg-amber-500', text: 'text-white' },
      ],
      extraCount: 32,
      progress: 96,
      dueDate: '7 Jan 2026',
      score: 4.8,
    },
    {
      id: 'p2',
      title: 'UX Research & System Architecture',
      category: 'Fundamentals',
      avatars: [
        { name: 'DL', bg: 'bg-purple-500', text: 'text-white' },
        { name: 'TK', bg: 'bg-rose-500', text: 'text-white' },
        { name: 'PN', bg: 'bg-teal-500', text: 'text-white' },
      ],
      extraCount: 5,
      progress: 24,
      dueDate: '4 Jan 2026',
      score: 4.4,
    },
    {
      id: 'p3',
      title: 'Full Stack Engineering Core',
      category: 'Engineering Teams',
      avatars: [
        { name: 'RK', bg: 'bg-indigo-500', text: 'text-white' },
        { name: 'VA', bg: 'bg-amber-600', text: 'text-white' },
        { name: 'NS', bg: 'bg-emerald-600', text: 'text-white' },
      ],
      extraCount: 16,
      progress: 46,
      dueDate: '28 Dec 2025',
      score: 5.0,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
          Active Learning Programs
        </h3>
        <button
          onClick={() => navigate('/learning')}
          className="text-slate-400 hover:text-[#0F8F87] transition-colors p-1 rounded-lg hover:bg-slate-50"
          title="View All Programs"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs min-w-[520px]">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="pb-3 font-bold">Course</th>
              <th className="pb-3 font-bold">Participants</th>
              <th className="pb-3 font-bold">Progress</th>
              <th className="pb-3 font-bold">Due date</th>
              <th className="pb-3 font-bold text-right">Avg. Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {programs.map((prog) => (
              <tr
                key={prog.id}
                onClick={() => navigate('/learning')}
                className="hover:bg-[#F2FBFA]/60 transition-colors cursor-pointer group"
              >
                {/* Course Name & Category */}
                <td className="py-4 pr-3">
                  <div className="font-extrabold text-slate-900 group-hover:text-[#0F8F87] transition-colors leading-snug">
                    {prog.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {prog.category}
                  </div>
                </td>

                {/* Overlapping Avatar Stack with Initials */}
                <td className="py-4 px-2">
                  <div className="flex items-center -space-x-2">
                    {prog.avatars.map((av, idx) => (
                      <div
                        key={idx}
                        className={`w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-black ${av.bg} ${av.text} shadow-2xs`}
                        title={av.name}
                      >
                        {av.name}
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] font-black text-slate-600 shadow-2xs">
                      +{prog.extraCount}
                    </div>
                  </div>
                </td>

                {/* Segmented Pill Progress Bar */}
                <td className="py-4 px-2">
                  <div className="flex items-center gap-2.5">
                    {/* 10-segment Pill Bar */}
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 10 }).map((_, i) => {
                        const filled = (i + 1) * 10 <= prog.progress;
                        return (
                          <span
                            key={i}
                            className={`w-1.5 h-3.5 rounded-full transition-colors ${
                              filled ? 'bg-emerald-500' : 'bg-slate-100'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-[11px] font-black text-slate-700 font-mono">
                      {prog.progress}%
                    </span>
                  </div>
                </td>

                {/* Due Date */}
                <td className="py-4 px-2 text-slate-600 font-medium whitespace-nowrap">
                  {prog.dueDate}
                </td>

                {/* Avg Score */}
                <td className="py-4 pl-2 text-right">
                  <div className="inline-flex items-center gap-1 font-black text-slate-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{prog.score.toFixed(1)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
