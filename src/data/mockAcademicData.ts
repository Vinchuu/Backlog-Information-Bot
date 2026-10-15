import { StudentProfile, SubjectRecord, ATKTRuleInfo, AcademicDocument } from '../types/academic';

export const DEFAULT_STUDENT: StudentProfile = {
  id: 'std_01',
  name: 'Om Sanjay Bhamare',
  seatNumber: 'B190042188',
  prn: '72248921K',
  university: 'Savitribai Phule Pune University (SPPU)',
  college: 'Pune Institute of Computer Technology (PICT)',
  branch: 'Computer Engineering (CE)',
  currentSemester: 5,
  currentYear: 'TY',
  regulationScheme: '2019 Credit Pattern',
};

export const INITIAL_SUBJECTS: SubjectRecord[] = [
  // Semester 3 Subjects
  {
    id: 'sub_s3_1',
    code: '210241',
    name: 'Discrete Mathematics',
    semester: 3,
    credits: 3,
    head: 'Theory',
    inSemMarks: 24,
    maxInSem: 30,
    endSemMarks: 42,
    maxEndSem: 70,
    totalMarks: 66,
    maxTotal: 100,
    grade: 'A',
    status: 'Passed',
    difficulty: 'Medium',
  },
  {
    id: 'sub_s3_2',
    code: '210242',
    name: 'Fundamentals of Data Structures',
    semester: 3,
    credits: 3,
    head: 'Theory',
    inSemMarks: 22,
    maxInSem: 30,
    endSemMarks: 40,
    maxEndSem: 70,
    totalMarks: 62,
    maxTotal: 100,
    grade: 'B+',
    status: 'Passed',
    difficulty: 'High',
  },
  {
    id: 'sub_s3_3',
    code: '210243',
    name: 'Object Oriented Programming (OOP)',
    semester: 3,
    credits: 3,
    head: 'Theory',
    inSemMarks: 20,
    maxInSem: 30,
    endSemMarks: 38,
    maxEndSem: 70,
    totalMarks: 58,
    maxTotal: 100,
    grade: 'B',
    status: 'Passed',
    difficulty: 'Medium',
  },
  {
    id: 'sub_s3_4',
    code: '210244',
    name: 'Computer Graphics',
    semester: 3,
    credits: 3,
    head: 'Theory',
    inSemMarks: 25,
    maxInSem: 30,
    endSemMarks: 45,
    maxEndSem: 70,
    totalMarks: 70,
    maxTotal: 100,
    grade: 'A',
    status: 'Passed',
    difficulty: 'Medium',
  },
  {
    id: 'sub_s3_5',
    code: '210245',
    name: 'Digital Electronics & Logic Design',
    semester: 3,
    credits: 3,
    head: 'Theory',
    inSemMarks: 18,
    maxInSem: 30,
    endSemMarks: 36,
    maxEndSem: 70,
    totalMarks: 54,
    maxTotal: 100,
    grade: 'C',
    status: 'Passed',
    difficulty: 'High',
  },

  // Semester 4 Subjects (With 2 Backlogs)
  {
    id: 'sub_s4_1',
    code: '210251',
    name: 'Engineering Mathematics III',
    semester: 4,
    credits: 3,
    head: 'Theory',
    inSemMarks: 11,
    maxInSem: 30,
    endSemMarks: 24, // Needed 28
    maxEndSem: 70,
    totalMarks: 35,
    maxTotal: 100,
    grade: 'F',
    status: 'Backlog',
    difficulty: 'High',
    examDate: '2026-11-20',
  },
  {
    id: 'sub_s4_2',
    code: '210252',
    name: 'Data Structures & Algorithms',
    semester: 4,
    credits: 3,
    head: 'Theory',
    inSemMarks: 22,
    maxInSem: 30,
    endSemMarks: 48,
    maxEndSem: 70,
    totalMarks: 70,
    maxTotal: 100,
    grade: 'A',
    status: 'Passed',
    difficulty: 'High',
  },
  {
    id: 'sub_s4_3',
    code: '210253',
    name: 'Microprocessor Architecture',
    semester: 4,
    credits: 3,
    head: 'Theory',
    inSemMarks: 13,
    maxInSem: 30,
    endSemMarks: 22, // Needed 28
    maxEndSem: 70,
    totalMarks: 35,
    maxTotal: 100,
    grade: 'F',
    status: 'Backlog',
    difficulty: 'High',
    examDate: '2026-11-24',
  },
  {
    id: 'sub_s4_4',
    code: '210254',
    name: 'Principles of Programming Languages',
    semester: 4,
    credits: 3,
    head: 'Theory',
    inSemMarks: 24,
    maxInSem: 30,
    endSemMarks: 42,
    maxEndSem: 70,
    totalMarks: 66,
    maxTotal: 100,
    grade: 'A',
    status: 'Passed',
    difficulty: 'Medium',
  },
  {
    id: 'sub_s4_5',
    code: '210255',
    name: 'Microprocessor Lab',
    semester: 4,
    credits: 1,
    head: 'Practical',
    inSemMarks: 0,
    maxInSem: 0,
    endSemMarks: 38,
    maxEndSem: 50,
    totalMarks: 38,
    maxTotal: 50,
    grade: 'A',
    status: 'Passed',
    difficulty: 'Low',
  },
  {
    id: 'sub_s4_6',
    code: '210256',
    name: 'Data Structures Lab',
    semester: 4,
    credits: 1,
    head: 'Practical',
    inSemMarks: 0,
    maxInSem: 0,
    endSemMarks: 40,
    maxEndSem: 50,
    totalMarks: 40,
    maxTotal: 50,
    grade: 'A+',
    status: 'Passed',
    difficulty: 'Low',
  },
];

export const UNIVERSITY_REGULATIONS: ATKTRuleInfo[] = [
  {
    universityId: 'sppu',
    universityName: 'Savitribai Phule Pune University (SPPU)',
    scheme: '2019 / 2024 Pattern CBCS',
    verticalProgressionRule: 'To be admitted to Third Year (TE), student MUST have cleared all subjects of First Year (FE "All Clear"). Student can carry forward maximum 4 to 5 theory heads from SE. Similarly, to enter Final Year (BE), student MUST clear all SE subjects.',
    maxBacklogsAllowed: 4,
    feAllClearRequiredForTE: true,
    seAllClearRequiredForBE: true,
    creditCriteriaText: 'Passing requires 40% aggregate in Theory (In-sem + End-sem), with a mandatory minimum of 28/70 (40%) in End-Sem paper.',
    graceMarksOrdinance: 'Ordinance 0.4 (1% grace of aggregate) or Ordinance 0.5042 for passing head deficiency (up to 3 marks).',
    officialCircularRef: 'SPPU Exam Circular No. 125/2023 & Academic Council Resolution 4B.',
  },
  {
    universityId: 'mu',
    universityName: 'University of Mumbai (MU)',
    scheme: 'Choice Based Credit Grading System (CBCGS)',
    verticalProgressionRule: 'A candidate can be admitted to Semester V (TE) if they have passed Semester I & II fully, and Semester III & IV has not failed in more than 5 heads of passing (or earned minimum 50% credits).',
    maxBacklogsAllowed: 5,
    feAllClearRequiredForTE: true,
    seAllClearRequiredForBE: true,
    creditCriteriaText: 'Minimum 40% marks in Internal Assessment and Semester End Exam separately (e.g. 8/20 in Internal and 32/80 in End-Sem).',
    graceMarksOrdinance: 'Ordinance 0.5042 (Passing in examination) allows max 3 marks per head up to 10 marks overall.',
    officialCircularRef: 'MU Ordinance 8.1 / Exam Regulation Gazette Vol 2022.',
  },
  {
    universityId: 'vtu',
    universityName: 'Visvesvaraya Technological University (VTU)',
    scheme: '2022 NEP / 2018 Scheme',
    verticalProgressionRule: 'Vertical Progression: Student is permitted to register for 5th semester (3rd Year) only if they have not failed in more than 4 courses of 1st and 2nd year combined, and all 1st year credits must be cleared.',
    maxBacklogsAllowed: 4,
    feAllClearRequiredForTE: true,
    seAllClearRequiredForBE: true,
    creditCriteriaText: 'CIE (Continuous Internal Evaluation) min 40%, SEE (Semester End Exam) min 35%, and overall 40% aggregate.',
    graceMarksOrdinance: 'VTU Exam Regulations Section 16.2 (Grace marks for passing an individual course up to 2% of max marks).',
    officialCircularRef: 'VTU/BGM/Aca-OS/2023-24/Circular No. 189.',
  },
  {
    universityId: 'anna',
    universityName: 'Anna University Chennai',
    scheme: 'Regulation 2021 (Autonomous / Affiliated)',
    verticalProgressionRule: 'No absolute year-down for initial semesters, but students must register for arrear courses in subsequent semesters. Maximum allowable duration to complete degree is 7 years.',
    maxBacklogsAllowed: 6,
    feAllClearRequiredForTE: false,
    seAllClearRequiredForBE: false,
    creditCriteriaText: 'Grade Point System. Minimum 45% in End Semester Examination and 50% in aggregate (Internal + External).',
    graceMarksOrdinance: 'Academic Council Resolution 2021: Strict moderation committee rules apply.',
    officialCircularRef: 'Anna University Academic Regulation 2021 Section 12.',
  },
];

export const SAMPLE_DOCUMENTS: AcademicDocument[] = [
  {
    id: 'doc_01',
    name: 'SPPU_SE_Sem4_Computer_Result_May2025.txt',
    type: 'Marksheet',
    uploadDate: '2026-06-12',
    size: '142 KB',
    sourceAuthority: 'Savitribai Phule Pune University Examination Section',
    detectedBacklogs: 2,
    content: `SAVITRIBAI PHULE PUNE UNIVERSITY
RESULT STATEMENT FOR S.E.(2019 CREDIT PATTERN) EXAM: MAY 2025
COLLEGE: P.I.C.T., PUNE [025]
BRANCH: COMPUTER ENGINEERING (CE) - T.Y.
STUDENT NAME: OM SANJAY BHAMARE
SEAT NO: B190042188 | PRN: 72248921K | ELIGIBILITY NO: 12022091448

SUB CODE | SUBJECT NAME                     | HEAD | IN-SEM | END-SEM | TOTAL | GRD | PTS | CRD | STS
210251   | ENGINEERING MATHEMATICS III      | TH   | 011    | 024*    | 035   | F   | 00  | 03  | FAIL (BACKLOG)
210252   | DATA STRUCTURES & ALGORITHMS     | TH   | 022    | 048     | 070   | A   | 08  | 03  | PASS
210253   | MICROPROCESSOR ARCHITECTURE      | TH   | 013    | 022*    | 035   | F   | 00  | 03  | FAIL (BACKLOG)
210254   | PRINCIPLES OF PROGRAMMING LANG.  | TH   | 024    | 042     | 066   | A   | 08  | 03  | PASS
210255   | MICROPROCESSOR LAB               | PR   | ---    | 038     | 038   | A   | 08  | 01  | PASS
210256   | DATA STRUCTURES LAB              | PR   | ---    | 040     | 040   | A+  | 09  | 01  | PASS
210257   | CODE BEHAVIOR & ETHICS (AUDIT)   | AC   | ---    | ---     | ---   | PP  | 00  | 00  | COMPLETED

* Indicates End-Sem minimum 28/70 not satisfied.
SEMESTER IV CREDITS EARNED: 08 / 14 | SGPA: -- | RESULT: ATKT (ELIGIBLE FOR T.E.)
DATE OF DECLARATION: 10 JUNE 2025 | CONTROLLER OF EXAMINATIONS`,
  },
  {
    id: 'doc_02',
    name: 'SPPU_Official_ATKT_Circular_2024.txt',
    type: 'Circular',
    uploadDate: '2026-04-18',
    size: '88 KB',
    sourceAuthority: 'Office of Controller of Examinations, SPPU Pune',
    detectedBacklogs: 0,
    content: `SAVITRIBAI PHULE PUNE UNIVERSITY
CIRCULAR NO. 92 OF 2024
SUBJECT: CLARIFICATION ON ELIGIBILITY FOR ADMISSION TO HIGHER CLASS (ATKT RULES FOR ENGINEERING)

In accordance with the Academic Council Resolution No. AC 14/2023:
1. Admission from F.E. to S.E.:
A student who has failed in not more than 5 theory heads of F.E. is allowed to keep terms (ATKT) for S.E.
2. Admission from S.E. to T.E.:
To be eligible for T.E., the student MUST HAVE PASSED IN ALL SUBJECTS OF F.E. (First Year All Clear). A maximum of 5 theory backlogs from S.E. (Sem III + Sem IV combined) is permissible.
3. Passing Standard:
A candidate must secure minimum 40% combined marks (In-sem + End-sem), with minimum 40% (28 out of 70) in the University End Semester Examination.
4. Photocopy & Revaluation:
Students must apply for photocopy within 10 days of online result declaration. Challenge revaluation application accepted within 5 days of photocopy receipt.`,
  },
];
