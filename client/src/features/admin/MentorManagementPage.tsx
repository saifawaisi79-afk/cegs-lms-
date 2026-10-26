import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  RefreshCw,
  KeyRound,
  Trash2,
  RotateCcw,
  Edit,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  MoreVertical,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton.js';
import { CredentialsModal, SingleCredential } from '../../components/common/CredentialsModal.js';
import api from '../../services/api.js';
import { toast } from 'sonner';

interface MentorItem {
  _id: string;
  userId: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  studentCount: number;
  profile?: {
    phone?: string;
    specialization?: string[];
    designation?: string;
    experienceYears?: number;
    bio?: string;
  };
}

export const MentorManagementPage: React.FC = () => {
  const [mentors, setMentors] = useState<MentorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'removed'>('active');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMentor, setEditingMentor] = useState<MentorItem | null>(null);
  const [removingMentor, setRemovingMentor] = useState<MentorItem | null>(null);
  const [reassignTo, setReassignTo] = useState('');

  // Generated Credentials Modal state
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [generatedCred, setGeneratedCred] = useState<SingleCredential | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesignation, setFormDesignation] = useState('');
  const [formExp, setFormExp] = useState<number>(0);
  const [formSpecs, setFormSpecs] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/mentors', {
        params: { search, status: statusFilter },
      });
      if (res.data?.success) {
        const rawList = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.mentors || res.data?.mentors || [];
        setMentors(rawList);
      } else {
        setError(res.data?.message || 'Failed to fetch mentors.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load mentors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMentors();
  };

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormDesignation('');
    setFormExp(5);
    setFormSpecs('');
    setFormBio('');
    setIsAddOpen(true);
  };

  const openEditModal = (m: MentorItem) => {
    setEditingMentor(m);
    setFormName(m.name);
    setFormEmail(m.email);
    setFormPhone(m.profile?.phone || '');
    setFormDesignation(m.profile?.designation || '');
    setFormExp(m.profile?.experienceYears || 0);
    setFormSpecs((m.profile?.specialization || []).join(', '));
    setFormBio(m.profile?.bio || '');
  };

  const handleCreateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const specList = formSpecs.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/mentors', {
        name: formName,
        email: formEmail,
        phone: formPhone || undefined,
        designation: formDesignation || undefined,
        experienceYears: Number(formExp) || undefined,
        specialization: specList.length > 0 ? specList : undefined,
        bio: formBio || undefined,
      });

      if (res.data?.success && res.data?.credentials) {
        toast.success(`Mentor ${formName} enrolled successfully!`);
        setIsAddOpen(false);
        setGeneratedCred({
          userId: res.data.credentials.userId,
          name: formName,
          email: res.data.credentials.email,
          temporaryPassword: res.data.credentials.temporaryPassword,
          role: 'mentor',
        });
        setCredModalOpen(true);
        fetchMentors();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create mentor.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMentor) return;
    setFormLoading(true);
    try {
      const specList = formSpecs.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.put(`/mentors/${editingMentor._id}`, {
        name: formName,
        phone: formPhone || undefined,
        designation: formDesignation || undefined,
        experienceYears: Number(formExp) || undefined,
        specialization: specList.length > 0 ? specList : undefined,
        bio: formBio || undefined,
      });

      if (res.data?.success) {
        toast.success('Mentor profile updated successfully');
        setEditingMentor(null);
        fetchMentors();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update mentor.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetPassword = async (m: MentorItem) => {
    if (!window.confirm(`Generate a new temporary password for mentor ${m.name} (${m.userId})? All existing sessions will be signed out.`)) {
      return;
    }

    try {
      const res = await api.post(`/mentors/${m._id}/reset-password`);
      if (res.data?.success && res.data?.credentials) {
        toast.success(`Password reset for ${m.name}`);
        setGeneratedCred({
          userId: res.data.credentials.userId,
          name: m.name,
          email: res.data.credentials.email,
          temporaryPassword: res.data.credentials.temporaryPassword,
          role: 'mentor',
        });
        setCredModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to reset password.');
    }
  };

  const handleRemoveMentor = async () => {
    if (!removingMentor) return;
    try {
      const res = await api.delete(`/mentors/${removingMentor._id}`, {
        data: reassignTo ? { reassignTo } : undefined,
      });

      if (res.data?.success) {
        toast.success(`Mentor ${removingMentor.name} deactivated.`);
        setRemovingMentor(null);
        setReassignTo('');
        fetchMentors();
      }
    } catch (err: any) {
      if (err?.response?.data?.code === 'MENTOR_HAS_STUDENTS') {
        toast.error(`Mentor has ${err.response.data.count} active students. Please select a mentor to reassign them to.`);
      } else {
        toast.error(err?.response?.data?.message || 'Failed to deactivate mentor.');
      }
    }
  };

  const handleRestoreMentor = async (m: MentorItem) => {
    try {
      const res = await api.post(`/mentors/${m._id}/restore`);
      if (res.data?.success) {
        toast.success(`Mentor ${m.name} restored to active status.`);
        fetchMentors();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to restore mentor.');
    }
  };

  const activeOtherMentors = mentors.filter(
    (m) => m.isActive && removingMentor && m._id !== removingMentor._id
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mentors & Instructors"
        subtitle="Manage faculty, track student cohorts, provision credentials, and supervise mentorship assignments."
        actions={
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mentor</span>
          </button>
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
            placeholder="Search by name, ID or email..."
            className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0F8F87] transition"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
            onClick={fetchMentors}
            className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mentors Table / Cards */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Failed to Load Mentors"
          description={error}
          action={{ label: 'Retry', onClick: fetchMentors }}
        />
      ) : mentors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Mentors Found"
          description={search ? `No mentors matched your query "${search}".` : 'No faculty records exist in this category.'}
          action={{ label: 'Add First Mentor', onClick: openAddModal }}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200/80">
                <tr>
                  <th className="py-3 px-4">Mentor ID</th>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Designation & Skills</th>
                  <th className="py-3 px-4 text-center">Assigned Students</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mentors.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {m.userId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{m.email}</span>
                        </span>
                        {m.profile?.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{m.profile.phone}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {m.profile?.designation || 'Faculty Instructor'}
                        {m.profile?.experienceYears ? ` (${m.profile.experienceYears}y exp)` : ''}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(m.profile?.specialization || []).slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-600 font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {(m.profile?.specialization?.length || 0) > 2 && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            +{(m.profile?.specialization?.length || 0) - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-teal-50 text-[#0F8F87]">
                        {m.studentCount} students
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        label={m.isActive ? 'Active' : 'Deactivated'}
                        variant={m.isActive ? 'green' : 'red'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {m.lastLogin ? new Date(m.lastLogin).toLocaleDateString() : 'Never logged in'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(m)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          title="Edit profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleResetPassword(m)}
                          className="p-1.5 text-slate-400 hover:text-[#0F8F87] hover:bg-teal-50 rounded-lg transition"
                          title="Reset password (issues temporary credentials)"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {m.isActive ? (
                          <button
                            onClick={() => {
                              setRemovingMentor(m);
                              setReassignTo('');
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Deactivate mentor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreMentor(m)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Restore mentor account"
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

      {/* Add / Edit Mentor Modal */}
      {(isAddOpen || editingMentor) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              {editingMentor ? `Edit Mentor: ${editingMentor.name}` : 'Enroll New Faculty Mentor'}
            </h3>

            <form onSubmit={editingMentor ? handleUpdateMentor : handleCreateMentor} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingMentor}
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="mentor@careerexpertglobal.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87] disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <label className="text-xs font-bold text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. Lead Full Stack Instructor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Years Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formExp}
                    onChange={(e) => setFormExp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Specializations (comma separated)</label>
                  <input
                    type="text"
                    value={formSpecs}
                    onChange={(e) => setFormSpecs(e.target.value)}
                    placeholder="React, Node.js, AI, DevOps"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Faculty Bio</label>
                <textarea
                  rows={2}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Summary of experience and industry background..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#0F8F87]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditingMentor(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-[#0F8F87] hover:bg-[#0D7A73] text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  {formLoading ? 'Saving...' : editingMentor ? 'Update Profile' : 'Enroll & Generate Key'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Mentor Dialog */}
      {removingMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-2xl bg-rose-50">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Deactivate Faculty Mentor</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to deactivate <span className="font-bold text-slate-900">{removingMentor.name}</span> ({removingMentor.userId})?
              Their active login sessions will be immediately terminated. Their records will be retained and can be restored later.
            </p>

            {removingMentor.studentCount > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
                <p className="font-bold text-amber-900">
                  ⚠️ This mentor currently manages {removingMentor.studentCount} active students.
                </p>
                <p className="text-amber-800 text-[11px]">
                  Please choose a faculty mentor to automatically reassign these students to:
                </p>
                <select
                  required
                  value={reassignTo}
                  onChange={(e) => setReassignTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none"
                >
                  <option value="">Select Reassignment Mentor...</option>
                  {activeOtherMentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.userId}) - {m.studentCount} students
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setRemovingMentor(null);
                  setReassignTo('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={removingMentor.studentCount > 0 && !reassignTo}
                onClick={handleRemoveMentor}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
              >
                Deactivate Mentor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Temporary Credentials Modal */}
      <CredentialsModal
        isOpen={credModalOpen}
        onClose={() => {
          setCredModalOpen(false);
          setGeneratedCred(null);
        }}
        title="Faculty Mentor Credentials"
        subtitle="One-time temporary credentials generated for this instructor."
        credential={generatedCred}
      />
    </div>
  );
};
