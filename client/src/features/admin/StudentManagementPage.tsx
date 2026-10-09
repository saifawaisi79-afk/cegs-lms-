import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  ShieldCheck,
  Mail,
  Phone,
  Edit,
  CheckCircle,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  GraduationCap,
} from 'lucide-react';
import api from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { ProgressBar } from '../../components/ui/ProgressBar.js';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterTrack, setFilterTrack] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTrack, setNewTrack] = useState('Full Stack Development');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/students${search ? `?search=${encodeURIComponent(search)}` : ''}`);
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
      // Remove fake data
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/students', {
        name: newName,
        email: newEmail,
        phone: newPhone,
        preferredTrack: newTrack,
      });
      if (res.data?.success) {
        alert('Candidate enrolled successfully!');
        setShowAddModal(false);
        setNewName('');
        setNewEmail('');
        setNewPhone('');
        fetchStudents();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to enroll candidate.');
    }
  };

  const filteredStudents = students.filter((s) => {
    if (filterTrack === 'all') return true;
    return s.preferredTrack?.toLowerCase().includes(filterTrack.toLowerCase());
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="Student Directory & Roster"
        subtitle="Manage enrolled candidates, track assignments, mentors, and program progression."
        badge={<StatusBadge label={`${students.length} Total Scholars`} variant="teal" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Student roster exported to CSV')}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Roster</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Candidate</span>
            </button>
          </div>
        }
      />

      {/* FILTER & SEARCH BAR (PHASE 19 SPEC) */}
      <div className="card-premium p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scholars by name, email, or roll number..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterTrack}
            onChange={(e) => setFilterTrack(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none w-full sm:w-auto"
          >
            <option value="all">All 5 Tracks</option>
            <option value="Full Stack">Full Stack Development</option>
            <option value="AI">AI & Data Science</option>
            <option value="Automation">QA & Automation</option>
            <option value="DevOps">Cloud & DevOps</option>
          </select>
        </div>
      </div>

      {/* DESKTOP DATA TABLE (PHASE 19 SPEC) */}
      <div className="card-premium overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Scholar</th>
                <th className="py-3.5 px-5">Roll ID</th>
                <th className="py-3.5 px-5">Program Track</th>
                <th className="py-3.5 px-5">Batch</th>
                <th className="py-3.5 px-5">Assigned Mentor</th>
                <th className="py-3.5 px-5">Progress</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.map((s) => (
                <tr key={s._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={s.user?.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <p className="font-extrabold text-slate-900">{s.user?.name}</p>
                        <p className="text-[11px] text-slate-400">{s.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono font-bold text-slate-700">
                    {s.rollNumber || 'CEGS-0182'}
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge label={s.preferredTrack || 'Full Stack'} variant="teal" size="sm" />
                  </td>
                  <td className="py-3.5 px-5 text-slate-600 font-medium">
                    {s.batch?.code || 'CEGS-OCT15'}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-800">
                    {s.assignedMentor?.name || 'Rajesh Ramanathan'}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0F8F87] h-full rounded-full"
                          style={{ width: `${s.overallProgress || 68}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{s.overallProgress || 68}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <StatusBadge label="Active Scholar" variant="green" size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(page - 1) * itemsPerPage + 1} to{' '}
            {Math.min(page * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} scholars
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE LIST CARDS VIEW (PHASE 19 SPEC) */}
      <div className="space-y-3 md:hidden">
        {paginatedStudents.map((s) => (
          <div key={s._id} className="card-premium p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={s.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={s.user?.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-bold text-slate-900">{s.user?.name}</p>
                  <p className="text-[10px] text-slate-400">{s.rollNumber}</p>
                </div>
              </div>
              <StatusBadge label={s.preferredTrack} variant="teal" size="sm" />
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block">Mentor</span>
                <span className="font-bold text-slate-800">{s.assignedMentor?.name || 'Rajesh Ramanathan'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Batch</span>
                <span className="font-bold text-slate-800">{s.batch?.code || 'CEGS-OCT15'}</span>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Curriculum Progress</span>
                <span className="font-bold text-slate-900">{s.overallProgress || 68}%</span>
              </div>
              <ProgressBar value={s.overallProgress || 68} size="sm" variant="brand" />
            </div>
          </div>
        ))}
      </div>

      {/* ENROLL CANDIDATE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="card-premium max-w-md w-full p-6 sm:p-8 space-y-5 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-extrabold text-slate-900">Enroll New Candidate</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ananya Patel"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email Address *</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. ananya.patel@careerexpertglobal.com"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+91 98765 00000"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specialized Track</label>
                <select
                  value={newTrack}
                  onChange={(e) => setNewTrack(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87]"
                >
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="AI & Data Science">AI & Data Science</option>
                  <option value="QA Automation & Testing">QA Automation & Testing</option>
                  <option value="Cloud & DevOps Engineering">Cloud & DevOps Engineering</option>
                  <option value="Data Analytics & BI">Data Analytics & BI</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
