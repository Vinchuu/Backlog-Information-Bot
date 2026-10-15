import React, { useState } from 'react';
import { StudentProfile } from '../../types/academic';
import { User, Check, X } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onSave: (updated: StudentProfile) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onSave,
}) => {
  const [formData, setFormData] = useState<StudentProfile>(student);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-indigo-100 rounded-2xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Student Academic Profile</h3>
              <p className="text-[11px] text-slate-500">Context used by BacklogBot to customize rules & deadlines</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Student Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Seat / Roll No.</label>
              <input
                type="text"
                value={formData.seatNumber}
                onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">University PRN</label>
              <input
                type="text"
                value={formData.prn}
                onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">University</label>
            <select
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
            >
              <option value="Savitribai Phule Pune University (SPPU)">Savitribai Phule Pune University (SPPU)</option>
              <option value="University of Mumbai (MU)">University of Mumbai (MU)</option>
              <option value="Visvesvaraya Technological University (VTU)">Visvesvaraya Technological University (VTU)</option>
              <option value="Anna University Chennai">Anna University Chennai</option>
              <option value="Jawaharlal Nehru Technological University (JNTU)">Jawaharlal Nehru Technological University (JNTU)</option>
              <option value="Autonomous Engineering Institute">Autonomous Engineering Institute</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Engineering Branch</label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Current Semester</label>
              <select
                value={formData.currentSemester}
                onChange={(e) => setFormData({ ...formData, currentSemester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">College / Institute Name</label>
            <input
              type="text"
              value={formData.college}
              onChange={(e) => setFormData({ ...formData, college: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-50">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
