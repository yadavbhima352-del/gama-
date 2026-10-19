import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  BookOpen,
  Settings,
  Image as ImageIcon,
  Video,
  MoreHorizontal,
  Pin,
  PinOff,
  AlertCircle,
  Search,
  Sun,
  Moon,
  CreditCard,
  User,
} from 'lucide-react';
import { ChatSession } from '../types/chat';
import { NovaLogo } from './NovaLogo';
import { NovaPlanId, NOVA_PLANS, UserUsageData } from '../types/subscription';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onTogglePinSession: (id: string) => void;
  onClearAllSessions: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onOpenPublishGuide: () => void;
  onOpenSettings: () => void;
  onOpenSubscription: () => void;
  currentPlanId: NovaPlanId;
  usageData: UserUsageData;
  isApiConfigured: boolean;
  activeMode: 'chat' | 'image' | 'video';
  setActiveMode: (mode: 'chat' | 'image' | 'video') => void;
  activeModelName: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
  onTogglePinSession,
  onClearAllSessions,
  isOpen,
  onToggleOpen,
  onOpenPublishGuide,
  onOpenSettings,
  onOpenSubscription,
  currentPlanId,
  usageData,
  isApiConfigured,
  activeMode,
  setActiveMode,
  activeModelName,
  theme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const plan = NOVA_PLANS[currentPlanId] || NOVA_PLANS.starter;

  // Close 3-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const handleStartRename = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
    setOpenMenuId(null);
  };

  const handleSaveRename = (e: React.FormEvent | React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handlePromptDelete = (session: ChatSession) => {
    setSessionToDelete(session);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete.id);
      setSessionToDelete(null);
    }
  };

  // Filter sessions
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedSessions = filteredSessions.filter((s) => s.isPinned);
  const recentSessions = filteredSessions.filter((s) => !s.isPinned);

  const renderSessionItem = (session: ChatSession, isPinnedGroup: boolean) => {
    const isActive = session.id === activeSessionId && activeMode === 'chat';
    const isEditing = session.id === editingId;
    const isMenuOpen = session.id === openMenuId;

    return (
      <div
        key={session.id}
        onClick={() => {
          if (isEditing) return;
          setActiveMode('chat');
          onSelectSession(session.id);
          if (window.innerWidth < 768) onToggleOpen();
        }}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-all ${
          isActive
            ? 'bg-cyan-950/70 border border-cyan-400/50 text-cyan-200 font-medium shadow-sm'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
        }`}
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-1">
          {session.isPinned ? (
            <Pin
              size={13}
              className={`${
                isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
              } flex-shrink-0 fill-cyan-400/30`}
            />
          ) : (
            <MessageSquare
              size={14}
              className={`${
                isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
              } flex-shrink-0`}
            />
          )}

          {isEditing ? (
            <form
              onSubmit={(e) => handleSaveRename(e, session.id)}
              className="flex items-center gap-1 w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="w-full bg-[#0d1424] text-slate-100 text-xs px-2 py-0.5 rounded border border-cyan-400 outline-none"
              />
              <button
                type="submit"
                className="p-1 text-emerald-400 hover:text-emerald-300"
                title="Save"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={handleCancelRename}
                className="p-1 text-slate-400 hover:text-rose-400"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </form>
          ) : (
            <span className="truncate text-xs">{session.title}</span>
          )}
        </div>

        {/* 3-Dot Actions Menu */}
        {!isEditing && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setOpenMenuId(isMenuOpen ? null : session.id)}
              className={`p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10 ${
                isMenuOpen ? 'opacity-100 bg-black/10 dark:bg-white/10' : ''
              }`}
              title="Options"
            >
              <MoreHorizontal size={14} className="text-slate-400" />
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 p-1 shadow-2xl z-30 flex flex-col gap-0.5"
              >
                <button
                  onClick={() => {
                    onTogglePinSession(session.id);
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer w-full text-left"
                >
                  {session.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
                  <span>{session.isPinned ? 'Unpin' : 'Pin to top'}</span>
                </button>

                <button
                  onClick={() => handleStartRename(session)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer w-full text-left"
                >
                  <Edit2 size={13} />
                  <span>Rename</span>
                </button>

                <button
                  onClick={() => handlePromptDelete(session)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer w-full text-left"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 sm:w-80 bg-slate-50 dark:bg-[#0a0f1d] border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Nova Logo */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200 dark:border-white/10 flex-shrink-0">
          <NovaLogo
            size="md"
            onClick={() => {
              setActiveMode('chat');
              onNewChat();
            }}
          />

          <div className="flex items-center gap-1">
            {/* Theme Toggle (Dark / Light) */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile close drawer */}
            <button
              onClick={onToggleOpen}
              className="md:hidden p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 pb-2 flex-shrink-0">
          <button
            onClick={() => {
              setActiveMode('chat');
              onNewChat();
              if (window.innerWidth < 768) onToggleOpen();
            }}
            className="w-full py-2.5 px-4 rounded-2xl flex items-center gap-2.5 font-bold text-xs sm:text-sm bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.35)] transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-white dark:bg-[#121929] border border-slate-200 dark:border-white/5 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Studio Navigation Options: Chat, Image Studio, Video Studio */}
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="grid grid-cols-3 p-1 bg-slate-200/60 dark:bg-[#121929] rounded-xl border border-slate-300/40 dark:border-white/5 text-xs">
            <button
              onClick={() => {
                setActiveMode('chat');
                if (window.innerWidth < 768) onToggleOpen();
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-white dark:bg-cyan-950 text-slate-950 dark:text-cyan-200 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <MessageSquare size={13} />
              <span>Chat</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('image');
                if (window.innerWidth < 768) onToggleOpen();
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeMode === 'image'
                  ? 'bg-white dark:bg-cyan-950 text-slate-950 dark:text-cyan-200 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ImageIcon size={13} />
              <span>Images</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('video');
                if (window.innerWidth < 768) onToggleOpen();
              }}
              className={`flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeMode === 'video'
                  ? 'bg-white dark:bg-purple-950 text-slate-950 dark:text-purple-200 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Video size={13} />
              <span>Video</span>
            </button>
          </div>
        </div>

        {/* Conversation History List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-3 min-h-0 border-t border-slate-200 dark:border-white/5">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-6 px-4 text-xs text-slate-400">
              {searchQuery ? 'No matching chats.' : 'No conversations yet.'}
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinnedSessions.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Pin size={11} className="text-cyan-400 fill-cyan-400/40" />
                      Pinned
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{pinnedSessions.length}</span>
                  </div>
                  <div className="space-y-1">
                    {pinnedSessions.map((session) => renderSessionItem(session, true))}
                  </div>
                </div>
              )}

              {/* Recent Section */}
              <div className="space-y-1">
                {pinnedSessions.length > 0 && (
                  <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Recent</span>
                    <span className="text-[10px] text-slate-400 font-mono">{recentSessions.length}</span>
                  </div>
                )}
                {recentSessions.map((session) => renderSessionItem(session, false))}
              </div>
            </>
          )}
        </div>

        {/* Clear All Sessions Option */}
        {sessions.length > 1 && (
          <div className="px-3 py-1.5 border-t border-slate-200 dark:border-white/5 flex-shrink-0">
            {showClearConfirm ? (
              <div className="p-2 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center justify-between text-xs">
                <span className="text-rose-300">Clear all chats?</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClearAllSessions();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-[11px] cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1 text-xs text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Clear All Chat History</span>
              </button>
            )}
          </div>
        )}

        {/* FOOTER: SUBSCRIPTION STATUS, SETTINGS & GUIDE */}
        <div className="p-3 border-t border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#070b14] space-y-2 flex-shrink-0">
          {/* Subscription Status Card */}
          <button
            onClick={onOpenSubscription}
            className="w-full p-2.5 rounded-2xl flex items-center justify-between border border-cyan-500/30 bg-white dark:bg-[#0e1626] hover:border-cyan-400/60 transition-all cursor-pointer text-left shadow-sm"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300 flex-shrink-0">
                <CreditCard size={14} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <span>{plan.name} Plan</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({plan.priceDisplay})</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  Chats: {usageData.chatUsed}/{usageData.chatLimit} • Images: {usageData.imagesUsed}/{usageData.imagesLimit}
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold whitespace-nowrap">
              Plans
            </span>
          </button>

          {/* Settings & Guide Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
            <button
              onClick={onOpenPublishGuide}
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs transition-colors cursor-pointer border border-slate-200 dark:border-transparent"
            >
              <BookOpen size={13} />
              <span>Guide</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 p-5 shadow-2xl text-slate-900 dark:text-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-500/40 flex items-center justify-center text-rose-500 flex-shrink-0">
                <AlertCircle size={18} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm">Delete conversation?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  "{sessionToDelete.title}" will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={() => setSessionToDelete(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
