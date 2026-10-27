import React, { useState, useEffect } from 'react';
import { X, Layers, Save, Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../../services/api.js';
import { IModule } from '../../../types/index.js';

interface ManageModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (module: IModule, isNew: boolean) => void;
  moduleToEdit?: IModule | null;
}

export const ManageModuleModal: React.FC<ManageModuleModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  moduleToEdit,
}) => {
  const isEditing = !!moduleToEdit;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [monthNumber, setMonthNumber] = useState(1);
  const [weekNumber, setWeekNumber] = useState(1);
  const [durationHours, setDurationHours] = useState(10);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (moduleToEdit) {
      setTitle(moduleToEdit.title || '');
      setDescription(moduleToEdit.description || '');
      setMonthNumber(moduleToEdit.monthNumber || 1);
      setWeekNumber(moduleToEdit.weekNumber || 1);
      setDurationHours(moduleToEdit.durationHours || 10);
    } else {
      setTitle('');
      setDescription('');
      setMonthNumber(1);
      setWeekNumber(1);
      setDurationHours(10);
    }
  }, [moduleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Module title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        monthNumber: Number(monthNumber),
        weekNumber: Number(weekNumber),
        durationHours: Number(durationHours) || 10,
      };

      let res;
      if (isEditing && moduleToEdit) {
        res = await api.put(`/curriculum/modules/${moduleToEdit._id}`, payload);
        toast.success(`Module "${title}" updated successfully!`);
        onSaved(res.data.data, false);
      } else {
        res = await api.post('/curriculum/modules', payload);
        toast.success(`Module "${title}" created successfully!`);
        onSaved(res.data.data, true);
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving module:', err);
      toast.error(err?.response?.data?.message || 'Failed to save module.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-lg w-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-teal-50/60 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F8F87] text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {isEditing ? 'Edit Curriculum Module' : 'Create Curriculum Module'}
              </h3>
              <p className="text-xs text-slate-500">Group lessons into weeks and training milestones.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Module / Topic Category Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Database Systems & Sharding"
              required
              className="w-full h-10 px-3.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800 font-semibold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#0F8F87]" />
                Month (1-6)
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={monthNumber}
                onChange={(e) => setMonthNumber(Number(e.target.value))}
                required
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#0F8F87]" />
                Week (1-24)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={weekNumber}
                onChange={(e) => setWeekNumber(Number(e.target.value))}
                required
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#0F8F87]" />
                Duration (h)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                required
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Module Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of concepts covered in this module..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0F8F87] focus:bg-white text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#0F8F87] hover:bg-[#0D7A73] text-white text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update Module' : 'Create Module'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
