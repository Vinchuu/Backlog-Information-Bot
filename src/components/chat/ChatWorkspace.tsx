import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, StudentProfile, SubjectRecord, AcademicDocument } from '../../types/academic';
import {
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  FileText,
  X,
  ArrowRight,
  ShieldCheck,
  Globe,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, attachedDocName?: string) => void;
  isLoading: boolean;
  student: StudentProfile;
  subjects: SubjectRecord[];
  onSaveMessage: (message: ChatMessage) => void;
  onRegenerateMessage: (lastUserMsg: string) => void;
  attachedDoc: AcademicDocument | null;
  onClearAttachedDoc: () => void;
  onOpenDocPicker: () => void;
  onOpenBeacon3D?: () => void;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  student,
  subjects,
  onSaveMessage,
  onRegenerateMessage,
  attachedDoc,
  onClearAttachedDoc,
  onOpenDocPicker,
  onOpenBeacon3D,
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestedCards = [
    {
      title: 'How many backlogs do I have?',
      subtitle: `Audit active heads under ${student.university.split(' ')[0]}`,
      prompt: 'How many backlogs do I have right now? Give me a full breakdown of theory vs practical backlogs and pending credits.',
    },
    {
      title: 'Explain ATKT rules.',
      subtitle: 'Vertical progression eligibility & max allowed heads',
      prompt: `Explain the ATKT rules for ${student.university} (${student.regulationScheme}). Can I be promoted from ${student.currentYear} to the next class?`,
    },
    {
      title: 'Help me plan my backlog exams.',
      subtitle: 'Create a 3-week study roadmap with high-yield topics',
      prompt: 'Help me plan my backlog exams. Create a day-by-day revision strategy for Engineering Mathematics III and Microprocessors.',
    },
    {
      title: 'Show me my subject-wise backlog status.',
      subtitle: 'Detailed marksheet audit and minimum passing scores',
      prompt: 'Show me my subject-wise backlog status with in-sem and end-sem marks. What is the passing mark requirement?',
    },
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(text, attachedDoc?.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isInitialWelcome = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#faf9fe]">
      {/* Pastel background ambient gradient orbs */}
      <div className="absolute top-12 left-1/3 -translate-x-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-sky-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Messages Scroll Area */}
      <div ref={containerRef} className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isInitialWelcome ? (
          /* Initial Welcome Hero Screen in Light Pastel */
          <div className="max-w-3xl mx-auto py-8 sm:py-14 text-center space-y-7 animate-fadeIn">
            {/* Expressive AI Assistant visual ring */}
            <div className="relative inline-block mx-auto">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-purple-200 animate-float">
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
                  <Bot className="w-10 h-10 text-violet-600" />
                </div>
              </div>
            </div>

            {/* Headline and Supporting Text */}
            <div className="space-y-2.5">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Your Backlogs.{' '}
                <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  Your Next Move.
                </span>
              </h1>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                Understand your academic status, explore your options, and plan your next step with verified engineering university regulations & Google Search Grounding.
              </p>
            </div>

            {/* Student Context & 3D Beacon Pill */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 text-xs text-slate-700 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  Auditing for <strong className="text-slate-900">{student.name}</strong> • {student.branch} ({student.currentYear})
                </span>
              </div>

              {onOpenBeacon3D && (
                <button
                  onClick={onOpenBeacon3D}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100/80 hover:bg-purple-200 text-xs font-semibold text-purple-900 border border-purple-200 shadow-xs transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-violet-600" />
                  <span>3D Campus Citadel</span>
                </button>
              )}
            </div>

            {/* Suggested Prompt Cards in Pastel Tint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-2">
              {suggestedCards.map((card, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(card.prompt)}
                  className="p-4 rounded-2xl border border-indigo-100/90 bg-white/90 hover:bg-white text-left hover:border-violet-300 hover:shadow-md hover:shadow-purple-100 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-violet-700 transition-colors">
                      {card.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{card.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Chat Thread */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant';

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 sm:gap-4 ${
                    isAssistant ? 'items-start' : 'items-start flex-row-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isAssistant
                        ? 'bg-gradient-to-tr from-violet-600 to-indigo-600 text-white'
                        : 'bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs'
                    }`}
                  >
                    {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  {/* Message Body */}
                  <div className={`space-y-2 max-w-[85%] sm:max-w-[82%]`}>
                    <div
                      className={`p-4 sm:p-5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                        isAssistant
                          ? 'bg-white border border-indigo-100 text-slate-800 shadow-sm'
                          : 'bg-violet-600 text-white font-medium rounded-tr-sm shadow-sm'
                      }`}
                    >
                      {/* Attached doc indicator if user sent with attachment */}
                      {message.attachedDocName && (
                        <div className="mb-2.5 flex items-center gap-1.5 text-xs bg-white/20 px-2.5 py-1 rounded-md text-white font-mono border border-white/20">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Attached: {message.attachedDocName}</span>
                        </div>
                      )}

                      {/* Content */}
                      <MarkdownRenderer content={message.content} />

                      {/* Google Search Grounding Citations */}
                      {isAssistant && message.citations && message.citations.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-purple-100 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-800">
                            <Globe className="w-3.5 h-3.5 text-cyan-600" />
                            <span>Grounded via Google Search:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {message.citations.map((c, ci) => (
                              <a
                                key={ci}
                                href={c.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-[11px] text-cyan-900 border border-cyan-200 transition-colors font-medium"
                              >
                                <span>{c.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Assistant Message Actions Toolbar */}
                    {isAssistant && (
                      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(message.id, message.content)}
                            className="p-1 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors flex items-center gap-1 text-[11px]"
                            title="Copy response"
                          >
                            {copiedId === message.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => onSaveMessage(message)}
                            className={`p-1 rounded hover:bg-slate-100 transition-colors flex items-center gap-1 text-[11px] ${
                              message.isSaved ? 'text-amber-600 font-semibold' : 'hover:text-slate-800'
                            }`}
                            title="Bookmark response"
                          >
                            {message.isSaved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-amber-600" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    )}

                    {/* Follow-up Quick Suggestions */}
                    {isAssistant && message.suggestions && message.suggestions.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-violet-600" /> Suggested Follow-ups:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {message.suggestions.map((suggestion, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => onSendMessage(suggestion)}
                              className="text-left text-xs px-3 py-1.5 rounded-xl bg-purple-50/80 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-all shadow-2xs font-medium"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3 sm:gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 text-slate-600 flex items-center gap-2 shadow-xs">
                  <span className="text-xs font-medium">BacklogBot is querying university regulations & live search...</span>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Modern Composer Anchored at Bottom in Light Pastel */}
      <div className="p-3 sm:p-5 border-t border-indigo-100 bg-white/95 backdrop-blur-md">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* Active Attachment Pill */}
          {attachedDoc && (
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="truncate font-semibold">{attachedDoc.name}</span>
                <span className="text-[10px] text-purple-600 font-mono">({attachedDoc.size})</span>
              </div>
              <button
                onClick={onClearAttachedDoc}
                className="p-1 text-purple-400 hover:text-rose-600 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Floating Composer Container */}
          <div className="relative rounded-2xl border border-indigo-200 focus-within:border-violet-500 bg-white shadow-md focus-within:shadow-lg focus-within:shadow-purple-100/50 transition-all p-2 flex items-end gap-2">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={onOpenDocPicker}
              className="p-2.5 rounded-xl text-slate-400 hover:text-violet-600 hover:bg-purple-50 transition-colors shrink-0"
              title="Attach marksheet or academic circular"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                attachedDoc
                  ? `Ask questions about ${attachedDoc.name}...`
                  : 'Ask BacklogBot anything (e.g. "Can I take Sem 5 with 2 backlogs?", "Explain grace marks")...'
              }
              className="flex-1 max-h-40 min-h-[40px] py-2 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
            />

            {/* Send Action */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-30 disabled:pointer-events-none text-white shadow-md shadow-violet-200 transition-all shrink-0"
              title="Send (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer Shortcuts & Grounding Note */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1 text-slate-500">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Grounded in official {student.university.split(' ')[0]} ordinances + Google Search</span>
            </span>
            <span className="hidden sm:inline">
              <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">Enter</kbd> send •{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px]">Shift+Enter</kbd> new line
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
