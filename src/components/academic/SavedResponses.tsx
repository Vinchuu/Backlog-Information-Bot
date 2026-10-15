import React from 'react';
import { ChatMessage } from '../../types/academic';
import { Bookmark, Trash2, ArrowRight } from 'lucide-react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface SavedResponsesProps {
  savedMessages: ChatMessage[];
  onRemoveSaved: (id: string) => void;
  onNavigateToChat: () => void;
}

export const SavedResponses: React.FC<SavedResponsesProps> = ({
  savedMessages,
  onRemoveSaved,
  onNavigateToChat,
}) => {
  return (
    <div className="space-y-6">
      {/* Header in Light Pastel */}
      <div className="flex items-center justify-between border-b border-indigo-100 pb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Academic Responses</h2>
            <p className="text-xs text-slate-500">
              Quick access to bookmarked AI advice, re-exam schedules, and eligibility breakdowns.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition-all"
        >
          Return to Chat <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {savedMessages.length === 0 ? (
        <div className="rounded-2xl p-12 text-center border border-indigo-100 bg-white shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Saved Responses Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            While chatting with BacklogBot, click the bookmark icon on any AI response to store it here for offline review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedMessages.map((msg) => (
            <div key={msg.id} className="rounded-2xl p-5 border border-indigo-100 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-indigo-50 pb-2.5">
                <span className="font-mono text-[11px] text-violet-700 font-semibold">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
                <button
                  onClick={() => onRemoveSaved(msg.id)}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-600 text-xs transition-colors"
                  title="Remove from saved"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>

              <div className="text-sm">
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
