import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { ContextPanel } from './components/layout/ContextPanel';
import { ChatWorkspace } from './components/chat/ChatWorkspace';
import { BacklogChecker } from './components/academic/BacklogChecker';
import { ATKTAssistant } from './components/academic/ATKTAssistant';
import { DocumentIntelligence } from './components/academic/DocumentIntelligence';
import { StudyPlanner } from './components/academic/StudyPlanner';
import { UniversityRulesDirectory } from './components/academic/UniversityRulesDirectory';
import { SavedResponses } from './components/academic/SavedResponses';
import { AcademicBeaconScene } from './components/three/AcademicBeaconScene';
import { StudentProfileModal } from './components/modals/StudentProfileModal';
import {
  DEFAULT_STUDENT,
  INITIAL_SUBJECTS,
  SAMPLE_DOCUMENTS,
} from './data/mockAcademicData';
import {
  ChatMessage,
  StudentProfile,
  SubjectRecord,
  AcademicDocument,
} from './types/academic';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import {
  PanelLeft,
  PanelRight,
  AlertTriangle,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface ChatSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

export default function App() {
  // Layout states
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Firebase Auth state
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Student academic data
  const [student, setStudent] = useState<StudentProfile>(DEFAULT_STUDENT);
  const [subjects, setSubjects] = useState<SubjectRecord[]>(INITIAL_SUBJECTS);
  const [attachedDoc, setAttachedDoc] = useState<AcademicDocument | null>(null);

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: 'session_welcome',
      title: 'Backlog Audit & ATKT Inquiries',
      date: 'Today',
      messages: [],
    },
  ]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('session_welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [savedMessages, setSavedMessages] = useState<ChatMessage[]>([]);

  // Current session's messages
  const currentSession =
    chatSessions.find((s) => s.id === currentSessionId) || chatSessions[0];
  const messages = currentSession?.messages || [];

  const backlogCount = subjects.filter((s) => s.status === 'Backlog').length;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Load user profile & subjects from Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setStudent((prev) => ({
              ...prev,
              name: data.displayName || user.displayName || prev.name,
              university: data.university || prev.university,
              branch: data.branch || prev.branch,
              currentSemester: data.currentSemester || prev.currentSemester,
            }));
          } else {
            // Initialize user doc in Firestore
            await setDoc(userDocRef, {
              displayName: user.displayName || student.name,
              email: user.email || 'student@university.edu',
              university: student.university,
              branch: student.branch,
              currentSemester: student.currentSemester,
              currentYear: student.currentYear,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }

          // Fetch subjects from Firestore if any
          const subColRef = collection(db, 'users', user.uid, 'subjects');
          const subSnap = await getDocs(subColRef);
          if (!subSnap.empty) {
            const loadedSubs: SubjectRecord[] = [];
            subSnap.forEach((doc) => {
              loadedSubs.push({ id: doc.id, ...(doc.data() as any) });
            });
            setSubjects(loadedSubs);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-in Handler
  const handleSignInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in failed:', err?.message);
    }
  };

  // Sign out Handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign out error:', err?.message);
    }
  };

  // Sync subjects to Firestore when updated
  const handleUpdateSubjects = async (updated: SubjectRecord[]) => {
    setSubjects(updated);

    if (currentUser) {
      try {
        // Persist subjects to Firestore
        for (const sub of updated) {
          const subDocRef = doc(db, 'users', currentUser.uid, 'subjects', sub.id);
          await setDoc(subDocRef, {
            ...sub,
            userId: currentUser.uid,
            updatedAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/subjects`);
      }
    }
  };

  // Send message handler with Google Search Grounding support
  const handleSendMessage = async (content: string, attachedDocName?: string) => {
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      attachedDocName: attachedDocName || attachedDoc?.name,
    };

    const updatedMessages = [...messages, userMessage];
    const newTitle =
      messages.length === 0
        ? content.slice(0, 32) + (content.length > 32 ? '...' : '')
        : currentSession.title;

    setChatSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, title: newTitle, messages: updatedMessages }
          : s
      )
    );

    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            university: student.university,
            branch: student.branch,
            semester: student.currentSemester,
            backlogsCount: backlogCount,
            documentText: attachedDoc?.content,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp || new Date().toISOString(),
        suggestions: data.suggestions || [],
        citations: data.citations || [],
      };

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updatedMessages, assistantMessage] }
            : s
        )
      );

      // Persist chat session to Firestore if user logged in
      if (currentUser) {
        try {
          const chatDocRef = doc(db, 'users', currentUser.uid, 'chats', currentSessionId);
          await setDoc(chatDocRef, {
            title: newTitle,
            userId: currentUser.uid,
            lastMessage: content,
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/chats`);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: `### 🎓 BacklogBot Academic Advisory

Based on your profile at **${student.university}** (${student.branch}, Semester ${student.currentSemester}):

- **Active Backlog Count:** You currently have **${backlogCount} pending backlog(s)**.
- **ATKT Status:** Under standard SPPU/State University regulations, you are permitted to carry forward up to 5 theory heads into the next term, provided earlier milestone years are all-clear.
- **Next Steps:**
  1. Verify your In-Sem and End-Sem mark split in the **Backlog Checker**.
  2. Test your specific year transition in the **ATKT Assistant**.
  3. Ensure your exam application form is submitted before the upcoming circular deadline.`,
        timestamp: new Date().toISOString(),
        suggestions: [
          'How does combined passing work for In-Sem and End-Sem?',
          'What is the grace marks ordinance?',
          'Create a 3-week backlog study schedule.',
        ],
      };

      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...updatedMessages, fallbackMsg] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Consultation',
      date: 'Just now',
      messages: [],
    };
    setChatSessions([newSession, ...chatSessions]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteChat = (id: string) => {
    const remaining = chatSessions.filter((s) => s.id !== id);
    if (remaining.length === 0) {
      handleNewChat();
    } else {
      setChatSessions(remaining);
      if (currentSessionId === id) {
        setCurrentSessionId(remaining[0].id);
      }
    }
  };

  const handleSaveMessage = async (msg: ChatMessage) => {
    if (savedMessages.some((m) => m.id === msg.id)) {
      setSavedMessages(savedMessages.filter((m) => m.id !== msg.id));
    } else {
      const updated = [...savedMessages, { ...msg, isSaved: true }];
      setSavedMessages(updated);

      if (currentUser) {
        try {
          const saveRef = doc(db, 'users', currentUser.uid, 'savedResponses', msg.id);
          await setDoc(saveRef, {
            content: msg.content,
            userId: currentUser.uid,
            createdAt: new Date().toISOString(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/savedResponses`);
        }
      }
    }
  };

  const handleNavigateToChatWithQuery = (query: string, attachedDocText?: string) => {
    setActiveTab('chat');
    handleSendMessage(query);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf9fe] text-slate-800">
      {/* Collapsible Left Sidebar in Light Pastel */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        chatHistory={chatSessions.map((s) => ({ id: s.id, title: s.title, date: s.date }))}
        currentChatId={currentSessionId}
        onSelectChat={(id) => setCurrentSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        backlogCount={backlogCount}
        student={student}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        currentUser={currentUser}
        onSignInWithGoogle={handleSignInWithGoogle}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area in Light Pastel */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Navigation Bar in Light Pastel */}
        <header className="h-14 shrink-0 px-4 sm:px-6 flex items-center justify-between border-b border-indigo-100 bg-white/90 backdrop-blur-md z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 lg:hidden"
              title="Open Navigation"
            >
              <PanelLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 tracking-tight hidden sm:inline">
                BacklogBot
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-purple-950 capitalize">
                {activeTab === 'chat'
                  ? 'AI Workspace'
                  : activeTab === 'checker'
                  ? 'Backlog Checker'
                  : activeTab === 'atkt'
                  ? 'ATKT & Eligibility'
                  : activeTab === 'docs'
                  ? 'Document Intelligence'
                  : activeTab === 'planner'
                  ? 'Study Roadmap'
                  : activeTab === 'beacon3d'
                  ? '3D Campus Citadel'
                  : activeTab === 'rules'
                  ? 'University Ordinances'
                  : 'Saved Responses'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 3D Scene View shortcut button */}
            <button
              onClick={() => setActiveTab(activeTab === 'beacon3d' ? 'chat' : 'beacon3d')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'beacon3d'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
              }`}
              title="Toggle 3D Campus Citadel"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">3D Citadel</span>
            </button>

            {/* Live Backlog Status pill in Light Pastel */}
            <button
              onClick={() => setActiveTab('checker')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                backlogCount > 0
                  ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {backlogCount > 0 ? (
                <>
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>{backlogCount} Backlog{backlogCount > 1 ? 's' : ''}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>All Clear</span>
                </>
              )}
            </button>

            {/* Context Panel Toggle (desktop) */}
            <button
              onClick={() => setIsContextPanelOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-colors hidden xl:flex items-center gap-1 text-xs font-medium ${
                isContextPanelOpen
                  ? 'bg-purple-50 text-purple-900 border-purple-200 shadow-2xs'
                  : 'bg-white text-slate-500 border-slate-200 hover:text-slate-800'
              }`}
              title="Toggle Academic Intelligence Panel"
            >
              <PanelRight className="w-4 h-4" />
              <span className="text-[11px]">Intel Panel</span>
            </button>

            {/* Student Avatar quick profile trigger */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-white border border-indigo-100 hover:border-purple-300 shadow-2xs transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                {student.name.charAt(0)}
              </div>
              <span className="text-xs font-medium text-slate-800 hidden md:inline">
                {student.name.split(' ')[0]}
              </span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Display Pane */}
          <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {activeTab === 'chat' && (
              <ChatWorkspace
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                student={student}
                subjects={subjects}
                onSaveMessage={handleSaveMessage}
                onRegenerateMessage={(last) => handleSendMessage(last)}
                attachedDoc={attachedDoc}
                onClearAttachedDoc={() => setAttachedDoc(null)}
                onOpenDocPicker={() => {
                  setAttachedDoc(SAMPLE_DOCUMENTS[0]);
                }}
                onOpenBeacon3D={() => setActiveTab('beacon3d')}
              />
            )}

            {activeTab === 'beacon3d' && (
              <AcademicBeaconScene
                backlogCount={backlogCount}
                onBackToApp={() => setActiveTab('chat')}
              />
            )}

            {activeTab === 'checker' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <BacklogChecker
                  subjects={subjects}
                  onUpdateSubjects={handleUpdateSubjects}
                  student={student}
                  onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
                />
              </div>
            )}

            {activeTab === 'atkt' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <ATKTAssistant
                  onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
                />
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <DocumentIntelligence
                  onAttachDocToChat={(doc) => {
                    setAttachedDoc(doc);
                    setActiveTab('chat');
                  }}
                  onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
                />
              </div>
            )}

            {activeTab === 'planner' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <StudyPlanner
                  subjects={subjects}
                  onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
                />
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <UniversityRulesDirectory
                  onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
                />
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
                <SavedResponses
                  savedMessages={savedMessages}
                  onRemoveSaved={(id) =>
                    setSavedMessages(savedMessages.filter((m) => m.id !== id))
                  }
                  onNavigateToChat={() => setActiveTab('chat')}
                />
              </div>
            )}
          </main>

          {/* Collapsible Right-Side Academic Intelligence Context Panel */}
          {activeTab !== 'beacon3d' && (
            <ContextPanel
              isOpen={isContextPanelOpen}
              onToggle={() => setIsContextPanelOpen(false)}
              student={student}
              subjects={subjects}
              onOpenProfile={() => setIsProfileModalOpen(true)}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}
        </div>
      </div>

      {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        student={student}
        onSave={(updated) => setStudent(updated)}
      />
    </div>
  );
}
