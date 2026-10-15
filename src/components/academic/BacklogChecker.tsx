import React, { useState } from 'react';
import { SubjectRecord, StudentProfile } from '../../types/academic';
import { Plus, Trash2, CheckCircle2, AlertTriangle, FileDown, Sparkles, Check, Calculator, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BacklogCheckerProps {
  subjects: SubjectRecord[];
  onUpdateSubjects: (subjects: SubjectRecord[]) => void;
  student: StudentProfile;
  onNavigateToChatWithQuery: (query: string) => void;
}

export const BacklogChecker: React.FC<BacklogCheckerProps> = ({
  subjects,
  onUpdateSubjects,
  student,
  onNavigateToChatWithQuery,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number | 'all'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // New subject state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSem, setNewSem] = useState(4);
  const [newCredits, setNewCredits] = useState(3);
  const [newHead, setNewHead] = useState<'Theory' | 'Practical' | 'Oral' | 'TermWork'>('Theory');
  const [newInSem, setNewInSem] = useState(20);
  const [newEndSem, setNewEndSem] = useState(24);

  // Filtered subjects
  const filteredSubjects = selectedSemester === 'all'
    ? subjects
    : subjects.filter((s) => s.semester === selectedSemester);

  // Statistics
  const totalSubjects = subjects.length;
  const passedSubjects = subjects.filter((s) => s.status === 'Passed').length;
  const backlogSubjects = subjects.filter((s) => s.status === 'Backlog');
  const backlogCount = backlogSubjects.length;
  const theoryBacklogs = backlogSubjects.filter((s) => s.head === 'Theory').length;
  const practicalBacklogs = backlogSubjects.filter((s) => s.head !== 'Theory').length;
  const pendingCredits = backlogSubjects.reduce((acc, curr) => acc + curr.credits, 0);

  const handleToggleStatus = (id: string) => {
    const updated = subjects.map((sub) => {
      if (sub.id === id) {
        const nextStatus: SubjectRecord['status'] = sub.status === 'Passed' ? 'Backlog' : 'Passed';
        const newEnd = nextStatus === 'Passed' ? Math.max(sub.endSemMarks, 28) : Math.min(sub.endSemMarks, 24);
        return {
          ...sub,
          status: nextStatus,
          endSemMarks: newEnd,
          totalMarks: sub.inSemMarks + newEnd,
          grade: nextStatus === 'Passed' ? 'P' : 'F',
        };
      }
      return sub;
    });
    onUpdateSubjects(updated);

    const remainingBacklogs = updated.filter((s) => s.status === 'Backlog').length;
    if (remainingBacklogs === 0) {
      triggerConfetti();
    }
  };

  const handleDeleteSubject = (id: string) => {
    onUpdateSubjects(subjects.filter((s) => s.id !== id));
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const total = newInSem + newEndSem;
    const isPass = newHead === 'Theory' ? newEndSem >= 28 && total >= 40 : total >= 20;

    const newSubject: SubjectRecord = {
      id: `sub_${Date.now()}`,
      code: newCode || `SUB${Math.floor(100000 + Math.random() * 900000)}`,
      name: newName,
      semester: newSem,
      credits: newCredits,
      head: newHead,
      inSemMarks: newInSem,
      maxInSem: 30,
      endSemMarks: newEndSem,
      maxEndSem: 70,
      totalMarks: total,
      maxTotal: 100,
      grade: isPass ? 'B' : 'F',
      status: isPass ? 'Passed' : 'Backlog',
    };

    onUpdateSubjects([...subjects, newSubject]);
    setIsAddModalOpen(false);
    setNewCode('');
    setNewName('');

    if (isPass && backlogCount === 0) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (e) {}
  };

  const handleLoadSampleBacklogs = () => {
    const sample = subjects.map((sub) => {
      if (sub.code === '210251' || sub.code === '210253') {
        return {
          ...sub,
          status: 'Backlog' as const,
          endSemMarks: 24,
          totalMarks: sub.inSemMarks + 24,
          grade: 'F',
        };
      }
      return sub;
    });
    onUpdateSubjects(sample);
  };

  const handleLoadAllClear = () => {
    const allClear = subjects.map((sub) => ({
      ...sub,
      status: 'Passed' as const,
      endSemMarks: Math.max(sub.endSemMarks, 38),
      totalMarks: sub.inSemMarks + Math.max(sub.endSemMarks, 38),
      grade: 'B+',
    }));
    onUpdateSubjects(allClear);
    triggerConfetti();
  };

  const handleExportReport = () => {
    const report = `# ACADEMIC AUDIT & BACKLOG REPORT
Student: ${student.name} | PRN: ${student.prn}
University: ${student.university}
Branch: ${student.branch} | Current Semester: ${student.currentSemester}

OVERVIEW:
- Total Subjects: ${totalSubjects}
- Cleared Subjects: ${passedSubjects}
- Active Backlogs: ${backlogCount} (Theory: ${theoryBacklogs}, Practical/TW: ${practicalBacklogs})
- Pending Credits: ${pendingCredits}
- Current ATKT Standing: ${theoryBacklogs <= 4 ? 'ELIGIBLE FOR HIGHER CLASS' : 'YEAR DOWN RISK (Threshold exceeded)'}

ACTIVE BACKLOG LIST:
${
  backlogSubjects.length > 0
    ? backlogSubjects
        .map(
          (b) =>
            `- [${b.code}] ${b.name} (Sem ${b.semester}, ${b.credits} Credits) - In-Sem: ${b.inSemMarks}/30, End-Sem: ${b.endSemMarks}/70 (Target: Need min 28/70)`
        )
        .join('\n')
    : 'No active backlogs. All clear!'
}

Generated by BacklogBot - AI Academic Intelligence`;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header bar in Light Pastel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Backlog Checker</h2>
              <p className="text-xs text-slate-500">
                Auditing <span className="text-purple-700 font-semibold">{student.university}</span> • {student.branch}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-indigo-200 shadow-xs transition-colors"
            title="Copy audit report to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileDown className="w-3.5 h-3.5 text-slate-400" />}
            {copied ? 'Copied Report!' : 'Export Audit'}
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Subject
          </button>
        </div>
      </div>

      {/* Metrics Row in Light Pastel Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="glass-card rounded-2xl p-4 bg-white border border-indigo-100 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Subjects</div>
          <div className="text-2xl font-extrabold text-slate-900">{totalSubjects}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{passedSubjects} Cleared</span> • {totalSubjects - passedSubjects} Incomplete
          </div>
        </div>

        <div className={`glass-card rounded-2xl p-4 border shadow-xs ${backlogCount > 0 ? 'border-rose-200 bg-rose-50/60' : 'border-emerald-200 bg-emerald-50/60'}`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Active Backlogs</div>
          <div className={`text-2xl font-extrabold ${backlogCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {backlogCount}
          </div>
          <div className="text-xs text-slate-600 mt-1">
            {theoryBacklogs} Theory • {practicalBacklogs} Practical / TW
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 bg-white border border-indigo-100 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">Pending Credits</div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingCredits}</div>
          <div className="text-xs text-slate-500 mt-1">
            Affects graduation CGPA
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 bg-white border border-indigo-100 shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">ATKT Standing</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {backlogCount <= 4 ? (
              <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ELIGIBLE
              </div>
            ) : (
              <div className="text-xs font-bold text-rose-700 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" /> YEAR DOWN RISK
              </div>
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Max 4 allowed in SPPU / VTU
          </div>
        </div>
      </div>

      {/* Quick Controls & Semester Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-indigo-100 shadow-xs">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium px-2 hidden sm:inline">Filter:</span>
          {(['all', 3, 4] as const).map((sem) => (
            <button
              key={sem}
              onClick={() => setSelectedSemester(sem)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedSemester === sem
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-violet-700'
              }`}
            >
              {sem === 'all' ? 'All Semesters' : `Semester ${sem}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleLoadSampleBacklogs}
            className="text-[11px] px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors font-medium"
          >
            Load 2 Backlogs
          </button>
          <button
            onClick={handleLoadAllClear}
            className="text-[11px] px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3 h-3" /> All Clear
          </button>
        </div>
      </div>

      {/* Subjects Table in Light Pastel */}
      <div className="rounded-2xl overflow-hidden border border-indigo-100 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-purple-50/70 text-purple-900 text-xs uppercase tracking-wider font-semibold border-b border-indigo-100">
              <tr>
                <th className="px-4 py-3">Subject / Code</th>
                <th className="px-3 py-3">Sem</th>
                <th className="px-3 py-3">Head</th>
                <th className="px-3 py-3">Credits</th>
                <th className="px-3 py-3">In-Sem (30)</th>
                <th className="px-3 py-3">End-Sem (70)</th>
                <th className="px-3 py-3">Total (100)</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-50 font-normal">
              {filteredSubjects.map((sub) => {
                const isBacklog = sub.status === 'Backlog';
                const needsEndSem = sub.head === 'Theory' && sub.endSemMarks < 28;

                return (
                  <tr
                    key={sub.id}
                    className={`transition-colors hover:bg-purple-50/40 ${
                      isBacklog ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{sub.name}</div>
                      <div className="font-mono text-xs text-slate-500">{sub.code}</div>
                    </td>
                    <td className="px-3 py-3 text-slate-600 font-mono text-xs">Sem {sub.semester}</td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {sub.head}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-700 font-semibold">{sub.credits}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-700">
                      {sub.inSemMarks > 0 ? `${sub.inSemMarks}/${sub.maxInSem}` : '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">
                      <span className={needsEndSem ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                        {sub.endSemMarks}/{sub.maxEndSem}
                      </span>
                      {needsEndSem && (
                        <div className="text-[10px] text-rose-600 font-medium">Need ≥ 28</div>
                      )}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-900">
                      {sub.totalMarks}/{sub.maxTotal}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleToggleStatus(sub.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                          isBacklog
                            ? 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                        }`}
                        title="Click to toggle status"
                      >
                        {isBacklog ? (
                          <>
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> Backlog
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Passed
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isBacklog && (
                          <button
                            onClick={() =>
                              onNavigateToChatWithQuery(
                                `Help me prepare and clear my backlog in ${sub.name} (${sub.code}). I scored ${sub.endSemMarks}/70 and need at least 28 to pass.`
                              )
                            }
                            className="p-1 rounded text-violet-600 hover:text-violet-800 hover:bg-purple-100 transition-colors"
                            title="Plan study in AI Chat"
                          >
                            <BookOpen className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteSubject(sub.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advisory Banner in Pastel Palette */}
      {backlogCount > 0 ? (
        <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-900">
                You have {backlogCount} active backlog{backlogCount > 1 ? 's' : ''} ({pendingCredits} Credits pending)
              </div>
              <div className="text-xs text-amber-800/80 mt-0.5">
                Under {student.university} regulations, clearing these in the upcoming winter examination is recommended to maintain eligibility for Third Year.
              </div>
            </div>
          </div>
          <button
            onClick={() =>
              onNavigateToChatWithQuery(
                `Can you create a step-by-step revision timetable to clear my ${backlogCount} backlog subjects before the upcoming winter re-exams?`
              )
            }
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shrink-0 shadow-xs transition-colors"
          >
            Generate Study Plan
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-emerald-900">All Clear! No Active Backlogs.</div>
              <div className="text-xs text-emerald-800/80">
                You satisfy all progression criteria for uninterrupted academic promotion.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-indigo-100 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Academic Subject</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubject} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Subject Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 210255"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Semester</label>
                  <select
                    value={newSem}
                    onChange={(e) => setNewSem(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Head of Passing</label>
                  <select
                    value={newHead}
                    onChange={(e) => setNewHead(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Oral">Oral</option>
                    <option value="TermWork">Term Work</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">In-Sem Marks (Max 30)</label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={newInSem}
                    onChange={(e) => setNewInSem(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">End-Sem Marks (Max 70)</label>
                  <input
                    type="number"
                    min={0}
                    max={70}
                    value={newEndSem}
                    onChange={(e) => setNewEndSem(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-violet-500"
                  />
                  <span className="text-[10px] text-slate-500">Min 28 to pass theory</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-50">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-xs"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
