import React, { useState } from 'react';
import { SubjectRecord, StudyTopic } from '../../types/academic';
import { Calendar, CheckCircle2, Clock, Sparkles, Plus, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudyPlannerProps {
  subjects: SubjectRecord[];
  onNavigateToChatWithQuery: (query: string) => void;
}

const INITIAL_TOPICS: StudyTopic[] = [
  {
    id: 'top_1',
    dayNumber: 1,
    date: 'Day 1 - 2',
    subjectCode: '210251',
    subjectName: 'Engineering Mathematics III',
    topicTitle: 'Linear Differential Equations of Higher Order with Constant Coefficients & Shortcut Methods',
    durationHours: 3,
    phase: 'Phase 1: Foundation',
    priority: 'High',
    completed: true,
  },
  {
    id: 'top_2',
    dayNumber: 3,
    date: 'Day 3 - 4',
    subjectCode: '210251',
    subjectName: 'Engineering Mathematics III',
    topicTitle: 'Method of Variation of Parameters & Cauchy/Legendre Linear Equations',
    durationHours: 2.5,
    phase: 'Phase 1: Foundation',
    priority: 'High',
    completed: true,
  },
  {
    id: 'top_3',
    dayNumber: 5,
    date: 'Day 5 - 7',
    subjectCode: '210251',
    subjectName: 'Engineering Mathematics III',
    topicTitle: 'Laplace Transform, Properties, Inverse Laplace & Periodic Function Transforms',
    durationHours: 3.5,
    phase: 'Phase 1: Foundation',
    priority: 'High',
    completed: false,
  },
  {
    id: 'top_4',
    dayNumber: 8,
    date: 'Day 8 - 10',
    subjectCode: '210251',
    subjectName: 'Engineering Mathematics III',
    topicTitle: 'Fourier Transforms, Sine/Cosine Transforms & Parseval’s Identity',
    durationHours: 3,
    phase: 'Phase 1: Foundation',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 'top_5',
    dayNumber: 11,
    date: 'Day 11 - 13',
    subjectCode: '210251',
    subjectName: 'Engineering Mathematics III',
    topicTitle: 'Vector Differentiation, Gradient, Divergence, Curl & Solenoidal Fields',
    durationHours: 2.5,
    phase: 'Phase 2: PYQ Drill',
    priority: 'High',
    completed: false,
  },
  {
    id: 'top_6',
    dayNumber: 14,
    date: 'Day 14 - 16',
    subjectCode: '210251',
    subjectName: 'Engineering Mathematics III',
    topicTitle: 'Vector Integral Theorems: Gauss Divergence, Green’s Theorem & Stokes’ Theorem',
    durationHours: 3,
    phase: 'Phase 2: PYQ Drill',
    priority: 'High',
    completed: false,
  },
  {
    id: 'top_7',
    dayNumber: 17,
    date: 'Day 17 - 18',
    subjectCode: '210253',
    subjectName: 'Microprocessor Architecture',
    topicTitle: '8086 Internal Architecture, Bus Interface Unit (BIU) & Execution Unit (EU)',
    durationHours: 2.5,
    phase: 'Phase 1: Foundation',
    priority: 'High',
    completed: false,
  },
  {
    id: 'top_8',
    dayNumber: 19,
    date: 'Day 19 - 21',
    subjectCode: '210253',
    subjectName: 'Microprocessor Architecture',
    topicTitle: 'Addressing Modes, Instruction Formats & String Manipulation Assembly Programs',
    durationHours: 3,
    phase: 'Phase 2: PYQ Drill',
    priority: 'High',
    completed: false,
  },
  {
    id: 'top_9',
    dayNumber: 22,
    date: 'Day 22 - 24',
    subjectCode: '210253',
    subjectName: 'Microprocessor Architecture',
    topicTitle: 'Interrupt Structure, IVT Table, Type 0 to Type 255 Interrupts & Hardware Interfacing',
    durationHours: 2.5,
    phase: 'Phase 2: PYQ Drill',
    priority: 'Medium',
    completed: false,
  },
  {
    id: 'top_10',
    dayNumber: 25,
    date: 'Day 25 - 27',
    subjectCode: '210251',
    subjectName: 'Both Subjects Drill',
    topicTitle: 'Full 3-Hour Timed Mock Paper: SPPU In-Sem + End-Sem Pattern Simulation',
    durationHours: 4,
    phase: 'Phase 3: Timed Mock',
    priority: 'High',
    completed: false,
  },
  {
    id: 'top_11',
    dayNumber: 28,
    date: 'Day 28 - 30',
    subjectCode: '210251',
    subjectName: 'High Yield Revision',
    topicTitle: 'Formula Sheet Recitation, Derivations Quick Review & Exam Day Mindset',
    durationHours: 3,
    phase: 'Phase 4: Final Revision',
    priority: 'High',
    completed: false,
  },
];

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  subjects,
  onNavigateToChatWithQuery,
}) => {
  const [topics, setTopics] = useState<StudyTopic[]>(INITIAL_TOPICS);
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [targetDays, setTargetDays] = useState(30);
  const [dailyHours, setDailyHours] = useState(3.5);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Engineering Mathematics III');
  const [newHours, setNewHours] = useState(3);
  const [newPhase, setNewPhase] = useState<StudyTopic['phase']>('Phase 1: Foundation');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const completedCount = topics.filter((t) => t.completed).length;
  const totalCount = topics.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const toggleTopic = (id: string) => {
    const updated = topics.map((t) => {
      if (t.id === id) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTopics(updated);

    if (updated.every((t) => t.completed)) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'],
        });
      } catch (e) {}
    }
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTopic: StudyTopic = {
      id: `top_${Date.now()}`,
      dayNumber: topics.length + 1,
      date: `Day ${topics.length + 1}`,
      subjectCode: 'SUB_CUSTOM',
      subjectName: newSubject,
      topicTitle: newTitle,
      durationHours: newHours,
      phase: newPhase,
      priority: newPriority,
      completed: false,
    };

    setTopics([...topics, newTopic]);
    setIsAddModalOpen(false);
    setNewTitle('');
  };

  const filteredTopics = topics.filter((t) => {
    const matchesPhase = selectedPhase === 'all' || t.phase === selectedPhase;
    const matchesSub = selectedSubject === 'all' || t.subjectName.includes(selectedSubject);
    return matchesPhase && matchesSub;
  });

  return (
    <div className="space-y-6">
      {/* Header in Light Pastel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Backlog Study Planner & Roadmap</h2>
            <p className="text-xs text-slate-500">
              Personalized syllabus breakdown, high-yield PYQ drills, and mock exam milestones.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Topic
          </button>
          <button
            onClick={() =>
              onNavigateToChatWithQuery(
                `Generate a day-by-day 3-week study roadmap for clearing Engineering Mathematics III and Microprocessors backlog. I have ${dailyHours} hours free per day. Include formula sheet drills and past question papers.`
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Planner Chat
          </button>
        </div>
      </div>

      {/* Progress & Plan Configuration Banner in Light Pastel */}
      <div className="rounded-2xl p-5 border border-indigo-100 bg-white shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Progress bar */}
          <div className="md:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-800 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Syllabus Completion Rate
              </span>
              <span className="font-mono text-violet-700 text-sm font-bold">
                {completedCount} / {totalCount} Topics ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Foundation & PYQs</span>
              <span>{progressPercent === 100 ? '🎉 All Topics Reviewed!' : `${totalCount - completedCount} topics remaining`}</span>
            </div>
          </div>

          {/* Quick study hours counter */}
          <div className="md:col-span-5 flex items-center justify-end gap-3 text-xs border-t md:border-t-0 md:border-l border-indigo-100 pt-3 md:pt-0 md:pl-5">
            <div>
              <div className="text-[11px] text-slate-500">Target Timeline:</div>
              <div className="font-bold text-slate-900 text-sm">{targetDays} Days Roadmap</div>
            </div>
            <div className="w-px h-8 bg-indigo-100" />
            <div>
              <div className="text-[11px] text-slate-500">Daily Study Hours:</div>
              <div className="font-bold text-indigo-700 text-sm">{dailyHours} Hours/Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters in Light Pastel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-indigo-100 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium px-1">Phase:</span>
          {[
            { id: 'all', label: 'All Phases' },
            { id: 'Phase 1: Foundation', label: 'Phase 1: Foundation' },
            { id: 'Phase 2: PYQ Drill', label: 'Phase 2: PYQs' },
            { id: 'Phase 3: Timed Mock', label: 'Phase 3: Mocks' },
            { id: 'Phase 4: Final Revision', label: 'Phase 4: Revision' },
          ].map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedPhase === phase.id
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-violet-700'
              }`}
            >
              {phase.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-indigo-200 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            <option value="Mathematics">Engineering Maths III</option>
            <option value="Microprocessor">Microprocessors</option>
          </select>
        </div>
      </div>

      {/* Topic Cards / Timeline List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            onClick={() => toggleTopic(topic.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              topic.completed
                ? 'bg-emerald-50/50 border-emerald-200 text-slate-500'
                : 'bg-white border-indigo-100 hover:border-violet-300 hover:shadow-sm text-slate-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  topic.completed
                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold'
                    : 'border-slate-300 bg-white hover:border-violet-500'
                }`}
              >
                {topic.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-semibold border border-purple-200">
                    {topic.date}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">{topic.subjectName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      topic.priority === 'High'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {topic.priority} Yield
                  </span>
                </div>
                <div
                  className={`text-sm font-medium ${
                    topic.completed ? 'line-through text-slate-400' : 'text-slate-900'
                  }`}
                >
                  {topic.topicTitle}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs text-slate-500">
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{topic.durationHours} hrs</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-purple-800 font-medium border border-slate-200">
                {topic.phase.split(':')[1] || topic.phase}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Topic Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-indigo-100 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-indigo-50 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Study Milestone</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTopic} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Topic / Unit Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solved past 5-year questions on Cauchy Euler Equations"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Subject</label>
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Study Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={newHours}
                    onChange={(e) => setNewHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="High">High Yield</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Phase</label>
                <select
                  value={newPhase}
                  onChange={(e) => setNewPhase(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-indigo-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Phase 1: Foundation">Phase 1: Foundation</option>
                  <option value="Phase 2: PYQ Drill">Phase 2: PYQ Drill</option>
                  <option value="Phase 3: Timed Mock">Phase 3: Timed Mock</option>
                  <option value="Phase 4: Final Revision">Phase 4: Final Revision</option>
                </select>
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
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
