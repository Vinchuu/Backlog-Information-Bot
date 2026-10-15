export type AcademicHead = 'Theory' | 'Practical' | 'Oral' | 'TermWork';

export type SubjectStatus = 'Passed' | 'Backlog' | 'Re-exam Scheduled';

export interface SubjectRecord {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  head: AcademicHead;
  inSemMarks: number;
  maxInSem: number;
  endSemMarks: number;
  maxEndSem: number;
  totalMarks: number;
  maxTotal: number;
  grade: string;
  status: SubjectStatus;
  difficulty?: 'High' | 'Medium' | 'Low';
  examDate?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  seatNumber: string;
  prn: string;
  university: string;
  college: string;
  branch: string;
  currentSemester: number;
  currentYear: string; // 'FE' | 'SE' | 'TE' | 'BE'
  regulationScheme: string; // '2019 Pattern' | '2024 NEP' | 'CBCS'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestions?: string[];
  citations?: Array<{ title: string; source: string; url?: string }>;
  isSaved?: boolean;
  attachedDocName?: string;
  statusTag?: 'CLEARED' | 'ATKT_ELIGIBLE' | 'CRITICAL' | 'ACTION_REQUIRED';
}

export interface ATKTRuleInfo {
  universityId: string;
  universityName: string;
  scheme: string;
  verticalProgressionRule: string;
  maxBacklogsAllowed: number;
  feAllClearRequiredForTE: boolean;
  seAllClearRequiredForBE: boolean;
  creditCriteriaText: string;
  graceMarksOrdinance: string;
  officialCircularRef: string;
}

export interface StudyTopic {
  id: string;
  dayNumber: number;
  date: string;
  subjectCode: string;
  subjectName: string;
  topicTitle: string;
  durationHours: number;
  phase: 'Phase 1: Foundation' | 'Phase 2: PYQ Drill' | 'Phase 3: Timed Mock' | 'Phase 4: Final Revision';
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export interface AcademicDocument {
  id: string;
  name: string;
  type: 'Marksheet' | 'Circular' | 'Timetable' | 'Regulation';
  uploadDate: string;
  size: string;
  content: string;
  detectedBacklogs?: number;
  sourceAuthority: string;
}
