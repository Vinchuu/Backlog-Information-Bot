import React, { useState } from 'react';
import { UNIVERSITY_REGULATIONS } from '../../data/mockAcademicData';
import { Scale, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle, ArrowRight, BookOpen } from 'lucide-react';

interface ATKTAssistantProps {
  onNavigateToChatWithQuery: (query: string) => void;
}

export const ATKTAssistant: React.FC<ATKTAssistantProps> = ({ onNavigateToChatWithQuery }) => {
  const [selectedUniId, setSelectedUniId] = useState('sppu');
  const [transitionStage, setTransitionStage] = useState<'FE_TO_SE' | 'SE_TO_TE' | 'TE_TO_BE'>('SE_TO_TE');
  const [previousYearAllClear, setPreviousYearAllClear] = useState<boolean>(true);
  const [theoryBacklogs, setTheoryBacklogs] = useState<number>(2);
  const [hasInternalSubmissionPending, setHasInternalSubmissionPending] = useState<boolean>(false);

  const activeRegulation =
    UNIVERSITY_REGULATIONS.find((r) => r.universityId === selectedUniId) ||
    UNIVERSITY_REGULATIONS[0];

  const calculateEligibility = () => {
    if (hasInternalSubmissionPending) {
      return {
        verdict: 'DETAINED / INELIGIBLE',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        icon: AlertTriangle,
        summary: 'Term Work (TW) / Continuous Internal Assessment (CIE) Submission Incomplete',
        explanation:
          'Failure to secure passing internal term work or practical submission prevents candidate registration for semester-end examinations. Term work backlogs cannot be carried over as simple ATKT without re-attending laboratory sessions.',
        clauseRef: 'University Exam Rules on Attendance & Term Work Clearance',
        actionRequired: 'Immediately contact your Department Head (HOD) regarding term work completion and make-up submissions before final cutoff.',
      };
    }

    if (selectedUniId === 'sppu') {
      if (transitionStage === 'FE_TO_SE') {
        const isEligible = theoryBacklogs <= 5;
        return {
          verdict: isEligible ? 'ATKT ELIGIBLE FOR S.E.' : 'YEAR DOWN (NOT ELIGIBLE)',
          badgeColor: isEligible
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-rose-100 text-rose-800 border-rose-300',
          icon: isEligible ? CheckCircle2 : AlertTriangle,
          summary: isEligible
            ? `Allowed to keep term with ${theoryBacklogs} theory backlog${theoryBacklogs > 1 ? 's' : ''}.`
            : `Exceeds maximum allowable backlog limit (Max 5 theory heads allowed).`,
          explanation:
            'For admission to S.E. (Second Year), SPPU 2019/2024 pattern allows a student to carry forward a maximum of 5 theory heads of passing from First Year.',
          clauseRef: 'SPPU Engineering Ordinance 14/2023 - Clause 2.1',
          actionRequired: isEligible
            ? 'Ensure you submit examination forms for both regular S.E. Sem-III and F.E. backlog subjects in the winter session.'
            : 'You must sit for the winter backlog examination to bring pending theory heads to 5 or fewer.',
        };
      } else if (transitionStage === 'SE_TO_TE') {
        const feClear = previousYearAllClear;
        const seTheoryLimit = theoryBacklogs <= 5;
        const isEligible = feClear && seTheoryLimit;

        if (!feClear) {
          return {
            verdict: 'YEAR DOWN / BARRED FROM T.E.',
            badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
            icon: AlertTriangle,
            summary: 'First Year (F.E.) is NOT All-Clear',
            explanation:
              'Strict SPPU Rule: To be admitted to Third Year (T.E.), a candidate MUST have cleared all subjects of First Year (F.E. All Clear). Even a single pending F.E. subject causes a year down, regardless of how few S.E. backlogs you have.',
            clauseRef: 'SPPU Exam Circular 92/2024 - Vertical Progression Rule (Ordinance 0.4)',
            actionRequired: 'Prioritize clearing your remaining F.E. subject(s) in the immediate upcoming examination cycle.',
          };
        }

        return {
          verdict: isEligible ? 'ELIGIBLE FOR T.E. (THIRD YEAR)' : 'YEAR DOWN (TOO MANY S.E. BACKLOGS)',
          badgeColor: isEligible
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-rose-100 text-rose-800 border-rose-300',
          icon: isEligible ? CheckCircle2 : AlertTriangle,
          summary: isEligible
            ? `F.E. is clear and S.E. backlogs (${theoryBacklogs}) are within the 5-head limit.`
            : `Failed in ${theoryBacklogs} heads in S.E. (Max allowed is 5 heads).`,
          explanation:
            'You satisfy the mandatory F.E. All-Clear condition and your active S.E. backlog count is permissible under the 2019 credit pattern.',
          clauseRef: 'SPPU Ordinance 0.5042 & Credit Pattern Regulation 4B',
          actionRequired: 'Target clearing your pending subjects during Sem-V so you have zero backlogs heading into Final Year.',
        };
      } else {
        const seClear = previousYearAllClear;
        const teTheoryLimit = theoryBacklogs <= 5;
        const isEligible = seClear && teTheoryLimit;

        return {
          verdict: isEligible ? 'ELIGIBLE FOR B.E. (FINAL YEAR)' : 'YEAR DOWN / BARRED FROM B.E.',
          badgeColor: isEligible
            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
            : 'bg-rose-100 text-rose-800 border-rose-300',
          icon: isEligible ? CheckCircle2 : AlertTriangle,
          summary: isEligible
            ? `Cleared all S.E. subjects and T.E. backlogs (${theoryBacklogs}) are within permissible limit.`
            : !seClear
            ? 'Cannot enter Final Year without passing all Second Year (S.E.) subjects.'
            : `Too many T.E. backlogs (${theoryBacklogs} > 5).`,
          explanation:
            'Admission to Final Year (B.E.) strictly requires passing all Second Year (S.E.) subjects and carrying no more than 5 T.E. theory heads.',
          clauseRef: 'SPPU Final Year Admission Regulations Rule 6',
          actionRequired: 'Fill exam form on time and focus on high-yield questions for your pending papers.',
        };
      }
    }

    if (selectedUniId === 'mu') {
      const isEligible = previousYearAllClear && theoryBacklogs <= 5;
      return {
        verdict: isEligible ? 'ATKT ELIGIBLE (MU CBCS)' : 'PROVISIONAL / YEAR DOWN RISK',
        badgeColor: isEligible
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-amber-100 text-amber-800 border-amber-300',
        icon: isEligible ? CheckCircle2 : AlertTriangle,
        summary: isEligible
          ? 'Passed previous milestone and credit requirement satisfied (>50% credits earned).'
          : 'Failed to meet the 50% credit threshold or previous milestone condition.',
        explanation:
          'University of Mumbai operates under CBCGS: to enter Sem V (TE), a student must have cleared Sem I & II completely and not failed in more than 5 heads across Sem III & IV.',
        clauseRef: 'University of Mumbai Ordinance 8.1 / CBCGS Rulebook',
        actionRequired: 'Verify your total earned credits on your digital result ledger.',
      };
    }

    if (selectedUniId === 'vtu') {
      const isEligible = previousYearAllClear && theoryBacklogs <= 4;
      return {
        verdict: isEligible ? 'VERTICAL PROGRESSION PERMITTED' : 'NOT ELIGIBLE FOR HIGHER SEMESTER',
        badgeColor: isEligible
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-rose-100 text-rose-800 border-rose-300',
        icon: isEligible ? CheckCircle2 : AlertTriangle,
        summary: isEligible
          ? `Allowed to register for 5th semester with ${theoryBacklogs} pending course(s).`
          : 'Vertical progression barred under VTU Regulations Section 16.',
        explanation:
          'VTU requires passing all 1st year credits prior to entering 5th semester (3rd year), with no more than 4 total active backlog courses.',
        clauseRef: 'VTU Exam Circular VTU/BGM/Aca-OS/2023-24',
        actionRequired: 'Register for backlog courses as per VTU makeup / fast-track guidelines.',
      };
    }

    return {
      verdict: 'ARREAR REGISTRATION PERMITTED',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      icon: CheckCircle2,
      summary: 'Arrear courses may be registered alongside regular semester courses.',
      explanation:
        'Anna University Regulation 2021 permits students to continue their course of study while registering for arrear examinations in upcoming semesters.',
      clauseRef: 'Anna University Academic Regulations 2021 Clause 12',
      actionRequired: 'Ensure you do not exceed the semester credit ceiling (maximum 36 credits per semester including arrears).',
    };
  };

  const verdictData = calculateEligibility();
  const IconComponent = verdictData.icon;

  return (
    <div className="space-y-6">
      {/* Header in Light Pastel */}
      <div className="border-b border-indigo-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">ATKT & Academic Eligibility Assistant</h2>
            <p className="text-xs text-slate-500">
              Verify your promotion eligibility using official university gazetted ordinances and credit rules.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Calculator on Left, Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl p-5 border border-indigo-100 bg-white shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-violet-600" /> Progression Parameters
            </h3>

            {/* University Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your University & Regulation Scheme
              </label>
              <select
                value={selectedUniId}
                onChange={(e) => setSelectedUniId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-violet-500"
              >
                {UNIVERSITY_REGULATIONS.map((uni) => (
                  <option key={uni.universityId} value={uni.universityId}>
                    {uni.universityName} — {uni.scheme}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Transition Stage */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Promotion Transition Stage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'FE_TO_SE', label: '1st → 2nd Year', sub: 'FE to SE' },
                  { id: 'SE_TO_TE', label: '2nd → 3rd Year', sub: 'SE to TE' },
                  { id: 'TE_TO_BE', label: '3rd → 4th Year', sub: 'TE to BE' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTransitionStage(item.id as any)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      transitionStage === item.id
                        ? 'border-violet-400 bg-purple-50 text-purple-950 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Milestone condition question */}
            {transitionStage !== 'FE_TO_SE' && (
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Is {transitionStage === 'SE_TO_TE' ? 'First Year (F.E.)' : 'Second Year (S.E.)'} 100% All-Clear?
                  </label>
                  <span className="text-[11px] font-mono text-cyan-800 font-medium">Critical Requirement</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviousYearAllClear(true)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      previousYearAllClear
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✓ Yes, All Clear (0 Backlogs)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviousYearAllClear(false)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                      !previousYearAllClear
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    ✕ No, Has 1+ Backlog
                  </button>
                </div>
              </div>
            )}

            {/* Number of Theory Backlogs Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Active Failed Theory Heads (Current Year):</span>
                <span className="font-mono text-sm px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-200 font-bold">
                  {theoryBacklogs} {theoryBacklogs === 1 ? 'Subject' : 'Subjects'}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={theoryBacklogs}
                onChange={(e) => setTheoryBacklogs(Number(e.target.value))}
                className="w-full accent-violet-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 (All Clear)</span>
                <span>2</span>
                <span>4 (Max ATKT)</span>
                <span>6</span>
                <span>8</span>
              </div>
            </div>

            {/* Practical / Internal Checkbox */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <input
                type="checkbox"
                id="internalCheck"
                checked={hasInternalSubmissionPending}
                onChange={(e) => setHasInternalSubmissionPending(e.target.checked)}
                className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
              />
              <label htmlFor="internalCheck" className="text-xs text-slate-700 cursor-pointer select-none">
                I have an incomplete Term Work (TW) / In-Sem submission or attendance shortage.
              </label>
            </div>
          </div>

          {/* Quick regulation notes card */}
          <div className="rounded-2xl p-4 border border-indigo-100 bg-white space-y-2 text-xs shadow-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-600" />
              Verified Scheme Details: {activeRegulation.universityName}
            </div>
            <p className="text-slate-600 leading-relaxed">
              {activeRegulation.verticalProgressionRule}
            </p>
            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1">
              <span className="text-slate-700 font-semibold">Source Ref:</span> {activeRegulation.officialCircularRef}
            </div>
          </div>
        </div>

        {/* Right Panel: Verdict & Strategic Action (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl p-5 border border-indigo-100 bg-white space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Official Eligibility Determination
            </h3>

            {/* Verdict Card */}
            <div className={`p-4 rounded-xl border ${verdictData.badgeColor} space-y-2 shadow-2xs`}>
              <div className="flex items-center gap-2">
                <IconComponent className="w-5 h-5 shrink-0" />
                <span className="text-sm font-extrabold tracking-tight">{verdictData.verdict}</span>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {verdictData.summary}
              </p>
            </div>

            {/* Explanation */}
            <div className="space-y-1 text-xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Regulatory Analysis:
              </div>
              <p className="text-slate-700 leading-relaxed">
                {verdictData.explanation}
              </p>
            </div>

            {/* Ordinance reference */}
            <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100 space-y-1">
              <div className="text-[10px] text-purple-700 font-semibold uppercase">Applicable Ordinance / Gazette:</div>
              <div className="font-mono text-xs text-purple-950 font-bold">{verdictData.clauseRef}</div>
            </div>

            {/* Recommended Action */}
            <div className="space-y-1 text-xs">
              <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                <span>Immediate Next Move:</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {verdictData.actionRequired}
              </p>
            </div>

            {/* Ask in AI Chat button */}
            <button
              onClick={() =>
                onNavigateToChatWithQuery(
                  `According to the ATKT rules for ${activeRegulation.universityName}, what are my exact options given I have ${theoryBacklogs} theory backlogs in ${transitionStage}? Please provide the exact circular clause and re-examination timeline.`
                )
              }
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs shadow-md shadow-violet-200 transition-all"
            >
              Discuss with BacklogBot in Chat <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Grace Marks Ordinance Card */}
          <div className="rounded-2xl p-4 border border-amber-200 bg-amber-50/60 space-y-2 text-xs shadow-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              Grace Marks & Combined Passing
            </div>
            <p className="text-amber-800 leading-relaxed">
              {activeRegulation.graceMarksOrdinance}
            </p>
            <div className="text-amber-900 text-[11px] bg-white/80 p-2 rounded-lg border border-amber-200">
              💡 <span className="font-semibold text-amber-950">Pro Tip:</span> If you scored 25, 26, or 27 in End-Sem (where 28 is required), university moderation or Ordinance 0.5042 may automatically award up to 3 grace marks on your final gazette!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
