import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Edit,
  Trash2,
  RotateCcw,
  KeyRound,
  UserCheck,
  Upload,
  Download,
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { CredentialsModal, SingleCredential, BulkResultRow } from '../../components/common/CredentialsModal.js';
import { toast } from 'sonner';

interface StudentItem {
  _id: string;
  rollNumber: string;
  phone?: string;
  preferredTrack?: string;
  onboardingCompleted?: boolean;
  overallProgress?: number;
  placementStatus?: string;
  user: {
    _id: string;
    userId: string;
    name: string;
    email: string;
    isActive: boolean;
    lastLogin?: string;
    createdAt: string;
  };
  assignedMentor?: {
    _id: string;
    userId?: string;
    name: string;
    email: string;
  };
  track?: {
    _id: string;
    name: string;
  };
  batch?: {
    _id: string;
    name: string;
    code?: string;
  };
}

interface MentorOption {
  _id: string;
  userId: string;
  name: string;
}

export const StudentManagementPage: React.FC = () => {
  const { user, role } = useAuthStore();
  const isAdmin = role === 'admin';

  const [students, setStudents] = useState<StudentItem[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'removed'>('active');
  const [trackFilter, setTrackFilter] = useState<string>('all');

  // Single Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [reassigningStudent, setReassigningStudent] = useState<StudentItem | null>(null);
  const [newMentorId, setNewMentorId] = useState('');

  // Bulk Import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<Array<{ name: string; email: string; phone?: string; track?: string; valid: boolean; error?: string }>>([]);
  const [bulkMentorId, setBulkMentorId] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Credentials Modal state
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [generatedCred, setGeneratedCred] = useState<SingleCredential | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResultRow[] | null>(null);

  // Single Form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTrack, setFormTrack] = useState('Full Stack Development');
  const [formMentorId, setFormMentorId] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/students', {
        params: { search, status: statusFilter },
      });
      if (res.data?.success) {
        setStudents(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to load students.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load student directory.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMentors = async () => {
    if (!isAdmin) return;
    try {
      const res = await api.get('/mentors', { params: { status: 'active', limit: 100 } });
      if (res.data?.success) {
        const rawMentors = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.mentors || res.data?.mentors || [];
        setMentors(
          rawMentors.map((m: any) => ({
            _id: m._id,
            userId: m.userId,
            name: m.name,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to load mentors for selection', err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchMentors();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTrack('Full Stack Development');
    setFormMentorId(mentors[0]?._id || '');
    setShowAddModal(true);
  };

  const handleEnrollSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin && !formMentorId) {
      toast.error('Please assign an active mentor for this student.');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await api.post('/students', {
        name: formName,
        email: formEmail,
        phone: formPhone || undefined,
        preferredTrack: formTrack,
        mentorId: isAdmin ? formMentorId : undefined,
      });

      if (res.data?.success && res.data?.credentials) {
        toast.success(`Candidate ${formName} enrolled successfully!`);
        setShowAddModal(false);
        setGeneratedCred({
          userId: res.data.credentials.userId,
          name: formName,
          email: res.data.credentials.email,
          temporaryPassword: res.data.credentials.temporaryPassword,
          role: 'student',
        });
        setCredModalOpen(true);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to enroll student.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleResetPassword = async (s: StudentItem) => {
    if (!window.confirm(`Generate a new temporary password for student ${s.user.name} (${s.user.userId})? All existing sessions will be terminated.`)) {
      return;
    }

    try {
      const res = await api.post(`/students/${s._id}/reset-password`);
      if (res.data?.success && res.data?.credentials) {
        toast.success(`Password reset for ${s.user.name}`);
        setGeneratedCred({
          userId: res.data.credentials.userId,
          name: s.user.name,
          email: res.data.credentials.email,
          temporaryPassword: res.data.credentials.temporaryPassword,
          role: 'student',
        });
        setBulkResults(null);
        setCredModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset student password.');
    }
  };

  const handleRemoveStudent = async (s: StudentItem) => {
    if (!window.confirm(`Deactivate student ${s.user.name} (${s.user.userId})? Their records will be retained.`)) {
      return;
    }

    try {
      const res = await api.delete(`/students/${s._id}`);
      if (res.data?.success) {
        toast.success(`Student ${s.user.name} deactivated.`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate student.');
    }
  };

  const handleRestoreStudent = async (s: StudentItem) => {
    try {
      const res = await api.post(`/students/${s._id}/restore`);
      if (res.data?.success) {
        toast.success(`Student ${s.user.name} restored.`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to restore student.');
    }
  };

  const handleReassignMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningStudent || !newMentorId) return;

    try {
      const res = await api.put(`/students/${reassigningStudent._id}/reassign`, {
        mentorId: newMentorId,
      });

      if (res.data?.success) {
        toast.success(`Student reassigned to new mentor.`);
        setReassigningStudent(null);
        setNewMentorId('');
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reassign student.');
    }
  };

  // CSV parsing logic for Bulk Import
  const handleCsvChange = (text: string) => {
    setCsvText(text);
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) {
      setParsedRows([]);
      return;
    }

    const rows: any[] = [];
    // If first line has headers (contains 'email'), skip it
    const startIdx = lines[0].toLowerCase().includes('email') ? 1 : 0;

    for (let i = startIdx; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const [name, email, phone, track] = parts;

      let valid = true;
      let error = '';

      if (!name || name.length < 2) {
        valid = false;
        error = 'Missing valid name';
      } else if (!email || !email.includes('@')) {
        valid = false;
        error = 'Invalid email';
      }

      rows.push({
        name: name || '',
        email: email || '',
        phone: phone || '',
        track: track || 'Full Stack Development',
        valid,
        error,
      });
    }

    setParsedRows(rows);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      handleCsvChange(content);
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async () => {
    if (parsedRows.length === 0) {
      toast.error('No rows to import.');
      return;
    }

    if (isAdmin && !bulkMentorId) {
      toast.error('Please select an active mentor to assign the imported students to.');
      return;
    }

    setBulkSubmitting(true);
    try {
      const payloadRows = parsedRows.map((r) => ({
        name: r.name,
        email: r.email,
        phone: r.phone || undefined,
        preferredTrack: r.track || undefined,
      }));

      const res = await api.post('/students/bulk', {
        students: payloadRows,
        mentorId: isAdmin ? bulkMentorId : undefined,
      });

      if (res.data?.success) {
        const results: BulkResultRow[] = res.data.results || [];
        setBulkResults(results);
        setGeneratedCred(null);
        setShowBulkModal(false);
        setCredModalOpen(true);
        toast.success(`Bulk import completed: ${res.data.createdCount} created, ${res.data.failedCount} failed.`);
        fetchStudents();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Bulk import failed.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (trackFilter === 'all') return true;
    return (s.preferredTrack || s.track?.name || '').toLowerCase().includes(trackFilter.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? 'Student Cohort Directory' : 'My Mentorship Students'}
        subtitle={
          isAdmin
            ? 'Supervise all enrolled candidates across tracks, reassign mentors, and perform bulk batch imports.'
            : 'Track candidate progression, manage credentials, and review curriculum milestones for your assigned students.'
        }
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCsvText('');
                setParsedRows([]);
                setBulkMentorId(mentors[0]?._id || '');
                setShowBulkModal(true);
              }}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Bulk CSV Import</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, name, or email..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] transition"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="all">All Tracks</option>
            <option value="Full Stack">Full Stack Development</option>
            <option value="AI">AI Engineer</option>
            <option value="Automation">Automation Testing</option>
            <option value="Data Analytics">Data Analytics</option>
            <option value="Cloud">Cloud & DevOps</option>
          </select>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold">
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('removed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'removed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Deactivated
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
          </div>

          <button
            onClick={fetchStudents}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Student Directory"
          description={error}
          action={{ label: 'Retry', onClick: fetchStudents }}
        />
      ) : filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Candidates Found"
          description={
            search
              ? `No student records matched "${search}".`
              : 'There are currently no students enrolled in this view.'
          }
          action={{ label: 'Enroll First Student', onClick: openAddModal }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Candidate Details</th>
                  <th className="py-3 px-4">Track / Cohort</th>
                  {isAdmin && <th className="py-3 px-4">Assigned Mentor</th>}
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {s.user?.userId || s.rollNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{s.user?.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{s.user?.email}</span>
                        </span>
                        {s.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{s.phone}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                        {s.preferredTrack || s.track?.name || 'Full Stack'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        {s.assignedMentor ? (
                          <div>
                            <div className="font-semibold text-slate-800">{s.assignedMentor.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{s.assignedMentor.userId || ''}</div>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium">Unassigned</span>
                        )}
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <StatusBadge
                        label={s.user?.isActive ? 'Active' : 'Deactivated'}
                        variant={s.user?.isActive ? 'green' : 'red'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {s.user?.lastLogin ? new Date(s.user.lastLogin).toLocaleDateString() : 'Never logged in'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {isAdmin && s.user?.isActive && (
                          <button
                            onClick={() => {
                              setReassigningStudent(s);
                              setNewMentorId(s.assignedMentor?._id || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Reassign mentor"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleResetPassword(s)}
                          className="p-1.5 text-slate-400 hover:text-[#0F8F87] hover:bg-teal-50 rounded-lg transition"
                          title="Reset student password (issues temporary credentials)"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {s.user?.isActive ? (
                          <button
                            onClick={() => handleRemoveStudent(s)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Deactivate student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreStudent(s)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Restore student"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enroll Single Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Enroll Candidate</h3>
            <p className="text-xs text-slate-500">
              The server will automatically generate a secure Student ID (STD####) and temporary access password.
            </p>

            <form onSubmit={handleEnrollSingle} className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Saif Khan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Contact Phone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred Track</label>
                <select
                  value={formTrack}
                  onChange={(e) => setFormTrack(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                >
                  <option value="Full Stack Development">Full Stack Development</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Automation Testing">Automation Testing</option>
                  <option value="Data Analytics">Data Analytics</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>

              {isAdmin && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Assigned Mentor *</label>
                  <select
                    required
                    value={formMentorId}
                    onChange={(e) => setFormMentorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                  >
                    <option value="">Select Mentor...</option>
                    {mentors.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} ({m.userId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Enrolling...' : 'Enroll & Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reassign Mentor Dialog */}
      {reassigningStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Reassign Mentor</h3>
            <p className="text-xs text-slate-600">
              Reassign <span className="font-bold text-slate-900">{reassigningStudent.user?.name}</span> ({reassigningStudent.user?.userId}) to an active faculty mentor:
            </p>

            <form onSubmit={handleReassignMentor} className="space-y-4">
              <select
                required
                value={newMentorId}
                onChange={(e) => setNewMentorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
              >
                <option value="">Select Target Mentor...</option>
                {mentors.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.userId})
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassigningStudent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newMentorId}
                  className="px-5 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  Reassign Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Bulk Candidate Enrollment</h3>
                <p className="text-xs text-slate-500">
                  Upload or paste a CSV with columns: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">name, email, phone, track</code> (up to 100 candidates).
                </p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {isAdmin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Assign Cohort Mentor *</label>
                <select
                  required
                  value={bulkMentorId}
                  onChange={(e) => setBulkMentorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  <option value="">Select Mentor for Batch...</option>
                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.userId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">CSV Data</label>
                <label className="text-xs font-semibold text-[#0F8F87] hover:text-[#0D7A73] cursor-pointer flex items-center gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Upload .csv File</span>
                  <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <textarea
                rows={4}
                value={csvText}
                onChange={(e) => handleCsvChange(e.target.value)}
                placeholder="Saif Khan, saif@example.com, +91 98765 43210, Full Stack Development&#10;Priya Sharma, priya@example.com, +91 98765 43211, AI Engineer"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#0F8F87]"
              />
            </div>

            {/* Validation Preview */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Preview ({parsedRows.length} rows)</span>
                  <span className="text-slate-500">
                    {parsedRows.filter((r) => r.valid).length} valid · {parsedRows.filter((r) => !r.valid).length} invalid
                  </span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0">
                      <tr>
                        <th className="py-1.5 px-3">#</th>
                        <th className="py-1.5 px-3">Name</th>
                        <th className="py-1.5 px-3">Email</th>
                        <th className="py-1.5 px-3">Track</th>
                        <th className="py-1.5 px-3">Validation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {parsedRows.map((r, idx) => (
                        <tr key={idx} className={r.valid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                          <td className="py-1.5 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{r.name || '—'}</td>
                          <td className="py-1.5 px-3 text-slate-600">{r.email || '—'}</td>
                          <td className="py-1.5 px-3 text-slate-600">{r.track}</td>
                          <td className="py-1.5 px-3">
                            {r.valid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> {r.error}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bulkSubmitting || parsedRows.length === 0}
                onClick={handleBulkSubmit}
                className="px-5 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                {bulkSubmitting ? 'Importing Batch...' : `Import ${parsedRows.length} Candidates`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Credentials Modal (Single or Bulk) */}
      <CredentialsModal
        isOpen={credModalOpen}
        onClose={() => {
          setCredModalOpen(false);
          setGeneratedCred(null);
          setBulkResults(null);
        }}
        title={bulkResults ? 'Bulk Enrollment Completed' : 'Candidate Account Credentials'}
        subtitle={
          bulkResults
            ? 'Candidate accounts have been provisioned with individual credentials.'
            : 'Temporary student credentials have been securely provisioned.'
        }
        credential={generatedCred}
        bulkResults={bulkResults}
      />
    </div>
  );
};
