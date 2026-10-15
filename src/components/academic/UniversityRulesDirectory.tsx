import React, { useState } from 'react';
import { UNIVERSITY_REGULATIONS } from '../../data/mockAcademicData';
import { BookOpen, Search, ShieldCheck, FileText, ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';

interface UniversityRulesDirectoryProps {
  onNavigateToChatWithQuery: (query: string) => void;
}

export const UniversityRulesDirectory: React.FC<UniversityRulesDirectoryProps> = ({
  onNavigateToChatWithQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUni, setSelectedUni] = useState(UNIVERSITY_REGULATIONS[0]);

  const filteredRegulations = UNIVERSITY_REGULATIONS.filter((r) =>
    `${r.universityName} ${r.scheme} ${r.verticalProgressionRule}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header in Light Pastel */}
      <div className="border-b border-indigo-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">University Academic Regulations & Ordinances</h2>
            <p className="text-xs text-slate-500">
              Verified gazetted passing standards, grace marks rules, and ATKT vertical progression criteria.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by university name, scheme, grace marks ordinance, or ATKT policy..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-500 shadow-2xs"
        />
      </div>

      {/* Grid: University List + Detailed Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left list: 4 cols */}
        <div className="lg:col-span-4 space-y-2">
          {filteredRegulations.map((uni) => (
            <button
              key={uni.universityId}
              onClick={() => setSelectedUni(uni)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedUni.universityId === uni.universityId
                  ? 'border-violet-400 bg-purple-50 text-purple-950 font-semibold shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-bold text-xs">{uni.universityName}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{uni.scheme}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-700 font-semibold">
                <span>Max {uni.maxBacklogsAllowed} Backlogs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>

        {/* Right Details: 8 cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl p-6 border border-indigo-100 bg-white shadow-xs space-y-5">
            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 mb-2">
                {selectedUni.scheme}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{selectedUni.universityName}</h3>
            </div>

            {/* Vertical progression rule */}
            <div className="space-y-1.5 p-4 rounded-xl bg-purple-50/60 border border-purple-100">
              <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-violet-600" /> ATKT & Vertical Progression Policy
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedUni.verticalProgressionRule}
              </p>
            </div>

            {/* Passing marks & credit requirement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-100 space-y-1.5">
                <div className="text-xs font-bold text-cyan-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" /> Passing Standard
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedUni.creditCriteriaText}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 space-y-1.5">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" /> Grace Marks Ordinance
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedUni.graceMarksOrdinance}
                </p>
              </div>
            </div>

            {/* Official citation footer */}
            <div className="pt-2 border-t border-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                <span>Reference: {selectedUni.officialCircularRef}</span>
              </div>
              <button
                onClick={() =>
                  onNavigateToChatWithQuery(
                    `Explain all academic regulations and passing criteria for ${selectedUni.universityName} (${selectedUni.scheme}). How do grace marks and re-evaluation work?`
                  )
                }
                className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold border border-purple-200 transition-colors self-start sm:self-auto"
              >
                Inquire in Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
