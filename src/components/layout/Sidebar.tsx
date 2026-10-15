import React, { useState } from 'react';
import {
  MessageSquarePlus,
  MessageSquare,
  Calculator,
  Scale,
  FileText,
  Calendar,
  BookOpen,
  Bookmark,
  PanelLeftClose,
  GraduationCap,
  Sparkles,
  Trash2,
  Settings,
  LogIn,
  LogOut,
  Compass,
  Cloud,
  CheckCircle,
} from 'lucide-react';
import { StudentProfile } from '../../types/academic';
import { User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  chatHistory: Array<{ id: string; title: string; date: string }>;
  currentChatId: string;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  backlogCount: number;
  student: StudentProfile;
  onOpenProfile: () => void;
  currentUser: FirebaseUser | null;
  onSignInWithGoogle: () => void;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  chatHistory,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  backlogCount,
  student,
  onOpenProfile,
  currentUser,
  onSignInWithGoogle,
  onSignOut,
}) => {
  const [searchHistory, setSearchHistory] = useState('');

  const navItems = [
    { id: 'chat', label: 'AI Chat Workspace', icon: MessageSquare, badge: null },
    {
      id: 'checker',
      label: 'Backlog Checker',
      icon: Calculator,
      badge: backlogCount > 0 ? `${backlogCount} Pending` : 'All Clear',
      badgeColor: backlogCount > 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    },
    { id: 'atkt', label: 'ATKT & Eligibility', icon: Scale, badge: null },
    { id: 'docs', label: 'Document Intelligence', icon: FileText, badge: 'OCR' },
    { id: 'planner', label: 'Study Planner', icon: Calendar, badge: 'Roadmap' },
    { id: 'rules', label: 'University Ordinances', icon: BookOpen, badge: null },
    { id: 'beacon3d', label: '3D Campus Beacon', icon: Compass, badge: 'Three.js' },
    { id: 'saved', label: 'Saved Responses', icon: Bookmark, badge: null },
  ];

  const filteredHistory = chatHistory.filter((c) =>
    c.title.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 flex flex-col w-72 h-full bg-white/95 border-r border-indigo-100 shadow-sm transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand header in Pastel Violet / Lavender */}
        <div className="flex items-center justify-between p-4 border-b border-indigo-50 bg-gradient-to-r from-purple-50/70 to-indigo-50/50">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md shadow-violet-200">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center text-violet-600">
                  <GraduationCap className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900">BacklogBot</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-purple-100 text-purple-700 border border-purple-200">
                  AI + Search
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Academic Intelligence</p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button in Pastel Violet */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              setActiveTab('chat');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-200 transition-all group"
          >
            <MessageSquarePlus className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span>New Academic Chat</span>
          </button>
        </div>

        {/* Primary Navigation List */}
        <div className="px-3 py-1 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-purple-100/80 text-violet-900 border border-purple-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-purple-50/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Recent Chat History */}
        <div className="flex-1 flex flex-col min-h-0 px-3 py-2 border-t border-indigo-50 mt-2">
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent Consultations
            </span>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
              {chatHistory.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {chatHistory.length === 0 ? (
              <div className="text-[11px] text-slate-400 italic px-2 py-3 text-center">
                No recent conversations.
              </div>
            ) : (
              filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all ${
                    currentChatId === chat.id && activeTab === 'chat'
                      ? 'bg-purple-50 text-purple-950 font-semibold border border-purple-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectChat(chat.id);
                      setActiveTab('chat');
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="flex-1 flex items-center gap-2 truncate text-left"
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    <span className="truncate">{chat.title}</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer: Firebase Auth Google Login & Student Profile */}
        <div className="p-3 border-t border-indigo-50 space-y-2 bg-gradient-to-b from-white to-purple-50/40">
          {currentUser ? (
            <div className="p-2.5 rounded-xl border border-purple-100 bg-white space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <img
                    src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName || 'U'}`}
                    alt="avatar"
                    className="w-6 h-6 rounded-full border border-purple-200 shrink-0"
                  />
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 truncate">
                      {currentUser.displayName || 'Google Student'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                      <Cloud className="w-3 h-3" /> Firestore Synced
                    </div>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onSignInWithGoogle}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-indigo-200 shadow-xs transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-600" />
              <span>Sign In with Google</span>
            </button>
          )}

          {/* Student Profile Quick Tile */}
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center justify-between p-2 rounded-xl border border-indigo-50 bg-purple-50/50 hover:bg-purple-50 transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {student.name.charAt(0)}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 truncate">{student.name}</div>
                <div className="text-[10px] text-slate-500 truncate">
                  Sem {student.currentSemester} • {student.branch.split(' ')[0]}
                </div>
              </div>
            </div>
            <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 transition-colors shrink-0" />
          </button>
        </div>
      </aside>
    </>
  );
};
