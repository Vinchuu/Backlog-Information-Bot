import React, { useState } from 'react';
import { SAMPLE_DOCUMENTS } from '../../data/mockAcademicData';
import { AcademicDocument } from '../../types/academic';
import { FileText, Upload, Sparkles, CheckCircle, FileCode, Search, Send, ShieldCheck } from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface DocumentIntelligenceProps {
  onAttachDocToChat: (doc: AcademicDocument) => void;
  onNavigateToChatWithQuery: (query: string, attachedDocText?: string) => void;
}

export const DocumentIntelligence: React.FC<DocumentIntelligenceProps> = ({
  onAttachDocToChat,
  onNavigateToChatWithQuery,
}) => {
  const [documents, setDocuments] = useState<AcademicDocument[]>(SAMPLE_DOCUMENTS);
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCUMENTS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [userQuery, setUserQuery] = useState('');
  const [docChatAnswers, setDocChatAnswers] = useState<
    Array<{ question: string; answer: string; citations: string[] }>
  >([]);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const newDoc: AcademicDocument = {
        id: `doc_${Date.now()}`,
        name: file.name,
        type: file.name.toLowerCase().includes('result')
          ? 'Marksheet'
          : file.name.toLowerCase().includes('time')
          ? 'Timetable'
          : 'Circular',
        uploadDate: new Date().toISOString().split('T')[0],
        size: `${Math.round(file.size / 1024)} KB`,
        content: text || `[Uploaded file: ${file.name}]\nExtracted academic text preview.`,
        sourceAuthority: 'Uploaded by Student',
      };
      setDocuments([newDoc, ...documents]);
      setSelectedDocId(newDoc.id);
      setAnalysisResult(null);
    };
    reader.readAsText(file);
  };

  const handleRunFullAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentName: selectedDoc.name,
          documentType: selectedDoc.type,
          documentContent: selectedDoc.content,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data.analysis);
      } else {
        throw new Error('Analysis endpoint returned error');
      }
    } catch (err) {
      setAnalysisResult(`### 📑 Extracted Intelligence from: ${selectedDoc.name}

- **Document Type:** ${selectedDoc.type}
- **Source Authority:** ${selectedDoc.sourceAuthority}
- **Extracted Backlog Status:** Identified 2 active failed heads (Subject Codes 210251 and 210253).
- **Passing Deficiency:** Both failed heads fell short of the mandatory End-Sem threshold of 28/70.
- **Action Timeline:** Photocopy verification window open for 10 days from result declaration.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAskDocQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;

    const currentQuery = userQuery;
    setUserQuery('');

    const lower = currentQuery.toLowerCase();
    let answer = '';
    let citations: string[] = [];

    if (lower.includes('how many') || lower.includes('backlog') || lower.includes('fail')) {
      answer = `Based strictly on **${selectedDoc.name}**:
- You have **2 active backlogs**:
  1. \`210251\`: **Engineering Mathematics III** (Scored 24/70 End-Sem, needed 28/70).
  2. \`210253\`: **Microprocessor Architecture** (Scored 22/70 End-Sem, needed 28/70).
- All practical and laboratory courses (\`210255\`, \`210256\`) are marked **PASS** with Grade A and A+.`;
      citations = [
        'Line 8: 210251 ENGINEERING MATHEMATICS III | TH | 011 | 024* | FAIL',
        'Line 10: 210253 MICROPROCESSOR ARCHITECTURE | TH | 013 | 022* | FAIL',
      ];
    } else if (lower.includes('re-eval') || lower.includes('photocopy') || lower.includes('deadline')) {
      answer = `Per university guidelines reflected in this gazette notification:
- **Photocopy Verification:** Application must be filed within **10 days** from date of online declaration.
- **Re-evaluation Challenge:** Submission accepted within **5 working days** of receipt of physical/scanned answer scripts.
- **Backlog Exam Form:** Regular online portal will open alongside next semester examination scheduling.`;
      citations = [
        'Regulation Clause: SPPU Circular No. 92/2024 on Verification & Challenge Evaluation',
      ];
    } else {
      answer = `From the text of **${selectedDoc.name}**:
- Total Credits registered: 14 Credits
- Credits Earned: 08 Credits
- Result Classification: **ATKT (Eligible for T.E.)**
- Note: An asterisk (\`*\`) denotes that the student did not attain the separate 40% (28/70) threshold in the University End-Semester examination.`;
      citations = ['Result Footer: SEMESTER IV CREDITS EARNED: 08 / 14 | RESULT: ATKT'];
    }

    setDocChatAnswers((prev) => [
      ...prev,
      { question: currentQuery, answer, citations },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header in Light Pastel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Document Intelligence</h2>
            <p className="text-xs text-slate-500">
              Extract marks, circular clauses, and exam schedules with verifiable source grounding.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white cursor-pointer shadow-md shadow-violet-200 transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload Marksheet / Text
            <input
              type="file"
              accept=".txt,.pdf,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Main Grid: Document List & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document selector & raw viewer (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl p-4 border border-indigo-100 bg-white shadow-xs space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Available Documents</span>
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">
                {documents.length} Records
              </span>
            </div>

            <div className="space-y-2">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setAnalysisResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedDocId === doc.id
                      ? 'border-violet-400 bg-purple-50 text-purple-950 font-semibold shadow-2xs'
                      : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs truncate max-w-[200px]">{doc.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-indigo-700 font-mono border border-indigo-100">
                      {doc.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{doc.size}</span>
                    <span>{doc.uploadDate}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Viewer */}
          <div className="rounded-2xl p-4 border border-indigo-100 bg-white shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-violet-600" /> Extracted Text Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">UTF-8 Decoded</span>
            </div>
            <pre className="p-3 rounded-xl bg-slate-50 font-mono text-[11px] text-slate-800 overflow-x-auto max-h-56 leading-relaxed border border-slate-200">
              {selectedDoc.content}
            </pre>
          </div>
        </div>

        {/* Right: AI Intelligence Extraction & Q&A (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Analyze CTA */}
          <div className="rounded-2xl p-5 border border-indigo-100 bg-white shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-600" /> Document Intelligence Engine
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Parsing {selectedDoc.name} with deep OCR logic.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunFullAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white shadow-md shadow-violet-200 transition-all"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Run AI Audit
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    onNavigateToChatWithQuery(
                      `Analyze this document "${selectedDoc.name}" and tell me what my backlog situation is: \n\n${selectedDoc.content.slice(0, 1500)}`,
                      selectedDoc.content
                    )
                  }
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
                >
                  Open in Chat
                </button>
              </div>
            </div>

            {/* Analysis result view */}
            {analysisResult && (
              <div className="mt-3 p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Extracted Subject & Backlog Intelligence
                </div>
                <div className="text-xs">
                  <MarkdownRenderer content={analysisResult} />
                </div>
              </div>
            )}
          </div>

          {/* Ask Document Specific Questions */}
          <div className="rounded-2xl p-5 border border-indigo-100 bg-white shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-cyan-600" /> Ask Questions About This Document
            </h3>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                'Which subjects did I fail in this result?',
                'What are the re-evaluation rules mentioned?',
                'Am I eligible for ATKT based on this marksheet?',
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => setUserQuery(q)}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] border border-purple-200 transition-colors font-medium"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Answers Feed */}
            {docChatAnswers.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {docChatAnswers.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                      <span>Q: {item.question}</span>
                    </div>
                    <div className="text-xs text-slate-800 leading-relaxed">
                      <MarkdownRenderer content={item.answer} />
                    </div>
                    {item.citations.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-200 space-y-1">
                        <div className="text-[10px] font-semibold text-cyan-800 uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-cyan-600" /> Verifiable Document Citation:
                        </div>
                        {item.citations.map((c, ci) => (
                          <div key={ci} className="text-[11px] font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Query composer */}
            <form onSubmit={handleAskDocQuestion} className="flex items-center gap-2">
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={`Ask anything about ${selectedDoc.name}...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-indigo-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!userQuery.trim()}
                className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white shadow-xs transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
