import React from 'react';
import { StudentProfile, SubjectRecord } from '../../types/academic';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Award,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface ContextPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  student: StudentProfile;
  subjects: SubjectRecord[];
  onOpenProfile: () => void;
  onNavigateToTab: (tab: string) => void;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  isOpen,
  onToggle,
  student,
  subjects,
  onOpenProfile,
  onNavigateToTab,
}) => {
  if (!isOpen) return null;

  const backlogSubjects = subjects.filter((s) => s.status === 'Backlog');
  const backlogCount = backlogSubjects.length;
  const theoryBacklogs = backlogSubjects.filter((s) => s.head === 'Theory').length;
  const pendingCredits = backlogSubjects.reduce((acc, c) => acc + c.credits, 0);

  const isSppu = student.university.includes('Pune') || student.university.includes('SPPU');

  return (
    <aside className="w-80 shrink-0 hidden xl:flex flex-col h-full border-l border-indigo-100 bg-white/90 overflow-y-auto p-4 space-y-4 shadow-xs">
      {/* Panel Title */}
      <div className="flex items-center justify-between pb-2.5 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Academic Intelligence Panel
          </h3>
        </div>
        <button
          onClick={onToggle}
          className="text-xs text-slate-400 hover:text-slate-700"
          title="Collapse panel"
        >
          ✕
        </button>
      </div>

      {/* Verified Student Badge */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-100 bg-white space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            Verified Record
          </span>
          <button
            onClick={onOpenProfile}
            className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-medium"
          >
            Edit Profile
          </button>
        </div>

        <div>
          <div className="font-bold text-sm text-slate-900">{student.name}</div>
          <div className="text-xs text-slate-500 font-mono">PRN: {student.prn}</div>
        </div>

        <div className="pt-2 border-t border-indigo-50 space-y-1 text-xs">
          <div className="flex justify-between text-slate-600">
            <span className="text-slate-400">University:</span>
            <span className="font-medium text-right truncate max-w-[150px] text-slate-800">
              {student.university.split('(')[0]}
            </span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="text-slate-400">Branch:</span>
            <span className="font-medium text-slate-800">{student.branch}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="text-slate-400">Year / Sem:</span>
            <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded">
              {student.currentYear} • Semester {student.currentSemester}
            </span>
          </div>
        </div>
      </div>

      {/* Live Backlog Monitor */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-100 bg-white space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Backlog Status
          </span>
          <button
            onClick={() => onNavigateToTab('checker')}
            className="text-[10px] text-violet-600 hover:text-violet-800 font-semibold flex items-center gap-0.5"
          >
            Full Audit <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {backlogCount > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200">
              <div>
                <div className="text-xl font-extrabold text-rose-700">{backlogCount} Active</div>
                <div className="text-[10px] text-rose-600">{theoryBacklogs} Theory • {pendingCredits} Credits</div>
              </div>
              <div className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                Action Req.
              </div>
            </div>

            {/* Listed backlog subjects */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-500">Backlog Subjects:</div>
              {backlogSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-2 rounded-lg bg-slate-50 border border-indigo-50 text-xs flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="font-medium text-slate-800 truncate">{sub.name}</div>
                    <div className="text-[10px] font-mono text-slate-500">{sub.code} • Sem {sub.semester}</div>
                  </div>
                  <span className="text-[11px] font-mono text-rose-600 font-bold shrink-0">
                    {sub.endSemMarks}/70
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>All Clear! 0 pending backlogs detected.</span>
          </div>
        )}
      </div>

      {/* Verified Exam Window & Deadlines */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-100 bg-white space-y-2.5 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-amber-600" /> Important Examination Deadlines
        </div>

        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 space-y-1">
            <div className="flex items-center justify-between text-slate-800 font-medium">
              <span>Backlog Exam Form</span>
              <span className="text-amber-700 font-mono font-semibold">In ~18 Days</span>
            </div>
            <div className="text-[10px] text-slate-600">Regular fee window via University Student Portal</div>
          </div>

          <div className="p-2.5 rounded-xl bg-cyan-50/70 border border-cyan-200/70 space-y-1">
            <div className="flex items-center justify-between text-slate-800 font-medium">
              <span>Winter Semester Examination</span>
              <span className="text-cyan-800 font-mono font-semibold">Nov 2026</span>
            </div>
            <div className="text-[10px] text-slate-600">In-Sem + End-Sem combined session</div>
          </div>
        </div>
      </div>

      {/* Official Ordinance Source Citation */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-100 bg-white space-y-2 text-xs shadow-xs">
        <div className="flex items-center gap-1.5 text-slate-800 font-bold uppercase tracking-wider text-[11px]">
          <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> Official Source Grounding
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">
          {isSppu
            ? 'Grounding: SPPU Examination Circular No. 92/2024, Academic Council Resolution 4B, and Ordinance 0.5042 for passing head deficit.'
            : 'Grounding: State University gazetted credit regulation ordinance and vertical progression criteria.'}
        </p>
        <button
          onClick={() => onNavigateToTab('rules')}
          className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 pt-1 font-semibold"
        >
          View gazette ordinances <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
