import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  RotateCcw,
  Sparkles,
  Globe,
  Settings,
  ChevronDown,
  Image as ImageIcon,
  MessageSquare,
  Video,
  Check,
  Sun,
  Moon,
  CreditCard,
} from 'lucide-react';
import {
  ChatSession,
  Message,
  ApiStatus,
  Attachment,
  AppSettings,
  ModelInfo,
} from './types/chat';
import { NovaPlanId, NOVA_PLANS, UserUsageData } from './types/subscription';
import {
  loadSessionsFromStorage,
  saveSessionsToStorage,
  getActiveSessionId,
  setActiveSessionId,
  createNewSession,
  generateTitleFromMessage,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput, ChatInputHandle } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { PublishInfoModal } from './components/PublishInfoModal';
import { SettingsModal } from './components/SettingsModal';
import { ImageStudio } from './components/ImageStudio';
import { VideoStudio } from './components/VideoStudio';
import { SubscriptionModal } from './components/SubscriptionModal';
import { NovaLogo } from './components/NovaLogo';
import { detectImageGenerationIntent } from './utils/imageRouting';

const SETTINGS_STORAGE_KEY = 'nova_settings_v4';
const THEME_STORAGE_KEY = 'nova_theme_v1';

const DEFAULT_SETTINGS: AppSettings = {
  modelId: 'gemini-2.5-flash',
  language: 'auto',
  temperature: 0.7,
};

const DEFAULT_MODELS: ModelInfo[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    badge: 'Recommended',
    description: 'High-speed multimodal model with full multilingual and vision capabilities.',
    tier: 'free',
    multimodal: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Advanced',
    description: 'Frontier reasoning model for complex code, deep reasoning, and math.',
    tier: 'paid',
    multimodal: true,
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Reasoning',
    description: 'Ultra-fast frontier reasoning model for multi-turn discussions.',
    tier: 'free',
    multimodal: true,
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'Fast',
    description: 'Reliable, low-latency conversational model.',
    tier: 'free',
    multimodal: true,
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Ultra Fast',
    description: 'Lightweight, low-latency model for rapid Q&A.',
    tier: 'free',
    multimodal: true,
  },
];

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadSessionsFromStorage());
  const [activeSessionId, setActiveId] = useState<string>(() => {
    const saved = getActiveSessionId();
    const initialSessions = loadSessionsFromStorage();
    if (saved && initialSessions.some((s) => s.id === saved)) {
      return saved;
    }
    return initialSessions[0]?.id || createNewSession().id;
  });

  // Theme State: Dark & Light
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  // User Subscription Plan & Quota Tracking
  const [currentPlanId, setCurrentPlanId] = useState<NovaPlanId>('starter');
  const [usageData, setUsageData] = useState<UserUsageData>({
    planId: 'starter',
    dateUTC: new Date().toISOString().split('T')[0],
    chatUsed: 0,
    chatLimit: 80,
    imagesUsed: 0,
    imagesLimit: 11,
    videosUsed: 0,
    videosLimit: 0,
    resetTimeUTC: '00:00 UTC',
    isPaymentConfigured: false,
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  const [activeMode, setActiveMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [isChatImageMode, setIsChatImageMode] = useState(false);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPublishGuideOpen, setIsPublishGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const [availableModels, setAvailableModels] = useState<ModelInfo[]>(DEFAULT_MODELS);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    status: 'checking',
    configured: true,
    model: 'gemini-2.5-flash',
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  // Apply Theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  // Persist sessions
  useEffect(() => {
    saveSessionsToStorage(sessions);
  }, [sessions]);

  // Persist active session id
  useEffect(() => {
    if (activeSessionId) {
      setActiveSessionId(activeSessionId);
    }
  }, [activeSessionId]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Fetch status, models, and usage data on mount
  const fetchUsageData = async () => {
    try {
      const res = await fetch('/api/subscription/usage');
      if (res.ok) {
        const data = await res.json();
        setUsageData(data);
        if (data.planId) setCurrentPlanId(data.planId);
      }
    } catch (e) {
      console.warn('Failed to fetch usage data:', e);
    }
  };

  useEffect(() => {
    async function initData() {
      try {
        const [statusRes, modelsRes] = await Promise.all([
          fetch('/api/status').catch(() => null),
          fetch('/api/models').catch(() => null),
        ]);

        if (statusRes && statusRes.ok) {
          const sData = await statusRes.json();
          setApiStatus(sData);
        }

        if (modelsRes && modelsRes.ok) {
          const mData = await modelsRes.json();
          if (Array.isArray(mData.models) && mData.models.length > 0) {
            setAvailableModels(mData.models);
          }
        }
      } catch (e) {
        console.warn('Initial status/models fetch warning:', e);
      }
    }
    initData();
    fetchUsageData();
  }, []);

  const handleSelectPlan = async (newPlanId: NovaPlanId) => {
    try {
      const res = await fetch('/api/subscription/select-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: newPlanId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentPlanId(newPlanId);
        setUsageData((prev) => ({
          ...prev,
          planId: newPlanId,
          chatLimit: data.chatLimit,
          imagesLimit: data.imagesLimit,
          videosLimit: data.videosLimit,
        }));
      }
    } catch (e) {
      console.error('Failed to update plan:', e);
      setCurrentPlanId(newPlanId);
    }
  };

  // Get active session
  const currentSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentSession?.messages]);

  // Active Model Object
  const activeModel =
    availableModels.find((m) => m.id === settings.modelId) ||
    availableModels[0] || {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      badge: 'Recommended',
    };

  // Create New Chat
  const handleNewChat = () => {
    if (isGenerating) {
      handleStopGenerating();
    }
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(newSession.id);
    setInput('');
    setAttachments([]);
    setIsChatImageMode(false);
  };

  // Delete Session
  const handleDeleteSession = (id: string) => {
    if (sessions.length <= 1) {
      handleClearAllSessions();
      return;
    }

    const remaining = sessions.filter((s) => s.id !== id);
    setSessions(remaining);

    if (activeSessionId === id) {
      setActiveId(remaining[0].id);
    }
  };

  // Rename Session
  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle, updatedAt: Date.now() } : s))
    );
  };

  // Pin / Unpin Session
  const handleTogglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned, updatedAt: Date.now() } : s))
    );
  };

  // Clear All Sessions
  const handleClearAllSessions = () => {
    if (isGenerating) {
      handleStopGenerating();
    }
    const fresh = createNewSession();
    setSessions([fresh]);
    setActiveId(fresh.id);
  };

  // Clear Current Chat Messages
  const handleClearCurrentChat = () => {
    if (isGenerating) {
      handleStopGenerating();
    }
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [], updatedAt: Date.now() }
          : s
      )
    );
  };

  // Welcome Screen Quick Action Handler
  const handleWelcomeAction = (action: 'write' | 'image' | 'analyze' | 'plan' | 'voice' | 'code') => {
    if (action === 'voice') {
      chatInputRef.current?.startVoiceInput();
    } else if (action === 'write') {
      setInput('Help me write an engaging and polished ');
      setTimeout(() => chatInputRef.current?.focusTextarea(), 50);
    } else if (action === 'image') {
      setActiveMode('image');
    } else if (action === 'code') {
      setInput('Build and explain a clean TypeScript implementation for ');
      setTimeout(() => chatInputRef.current?.focusTextarea(), 50);
    } else if (action === 'analyze') {
      chatInputRef.current?.openFilePicker();
    } else if (action === 'plan') {
      setInput('Help me brainstorm and plan a step-by-step strategy for ');
      setTimeout(() => chatInputRef.current?.focusTextarea(), 50);
    }
  };

  // Stop Generating
  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          messages: s.messages.map((m) =>
            m.isStreaming ? { ...m, isStreaming: false } : m
          ),
        };
      })
    );
  };

  // Send Message Flow
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    const currentAttachments = [...attachments];

    if ((!textToSend && currentAttachments.length === 0) || isGenerating) return;

    setInput('');
    setAttachments([]);

    // Check for image generation intent when no files are attached
    const imageIntent =
      currentAttachments.length === 0 && (isChatImageMode || detectImageGenerationIntent(textToSend).isImageRequest)
        ? detectImageGenerationIntent(textToSend)
        : null;

    if (isChatImageMode) {
      setIsChatImageMode(false);
    }

    const userMessage: Message = {
      id: 'msg_user_' + Date.now(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    };

    const assistantPlaceholderId = 'msg_asst_' + Date.now();
    const isImageTask = Boolean(imageIntent && imageIntent.isImageRequest);

    const assistantPlaceholder: Message = {
      id: assistantPlaceholderId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: !isImageTask,
      isImageGenerating: isImageTask,
      modelUsed: isImageTask ? 'gemini-3.1-flash-lite-image' : activeModel.name,
    };

    // Update conversation title if first message
    const isFirstMessage = currentSession.messages.length === 0;
    const sessionTitle = isFirstMessage
      ? generateTitleFromMessage(
          isImageTask ? `Visual: ${imageIntent?.prompt}` : textToSend || currentAttachments[0]?.name || 'Analyzed Files'
        )
      : currentSession.title;

    const updatedMessages = [...currentSession.messages, userMessage];

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== activeSessionId) return s;
        return {
          ...s,
          title: sessionTitle,
          updatedAt: Date.now(),
          messages: [...updatedMessages, assistantPlaceholder],
        };
      })
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // --- SMART ROUTE 1: Image Generation Pipeline ---
    if (isImageTask && imageIntent) {
      try {
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imageIntent.prompt,
            aspectRatio: imageIntent.aspectRatio || '1:1',
            style: imageIntent.style,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw {
            isImageError: true,
            message: data.error || 'Failed to generate image.',
          };
        }

        if (data.imageUrl) {
          // Refresh usage counter
          fetchUsageData();

          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSessionId) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        isImageGenerating: false,
                        isStreaming: false,
                        content: data.description || '',
                        generatedImage: {
                          url: data.imageUrl,
                          prompt: imageIntent.prompt,
                          aspectRatio: data.aspectRatio || imageIntent.aspectRatio || '1:1',
                          style: imageIntent.style,
                          timestamp: Date.now(),
                        },
                        modelUsed: data.modelUsed || 'gemini-3.1-flash-lite-image',
                      }
                    : m
                ),
              };
            })
          );
        } else {
          throw {
            isImageError: true,
            message: 'The image generation model completed without returning an image.',
          };
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('User cancelled image generation.');
        } else {
          console.error('Image generation error:', err);
          const errorMsg =
            err.message || 'Image generation failed. Please check your API quota or key configuration.';
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSessionId) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantPlaceholderId
                    ? {
                        ...m,
                        isImageGenerating: false,
                        isStreaming: false,
                        isImageError: true,
                        error: errorMsg,
                        modelUsed: 'gemini-3.1-flash-lite-image',
                      }
                    : m
                ),
              };
            })
          );
        }
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
      return;
    }

    // --- SMART ROUTE 2: Multimodal & Text Chat Pipeline ---
    try {
      // Build conversation payload for Gemini
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
        attachments: m.attachments,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          model: settings.modelId,
          language: settings.language,
          systemPrompt: settings.systemInstruction,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errorText = 'Failed to generate response.';
        try {
          const errJson = await response.json();
          errorText = errJson.error || errorText;
        } catch {
          errorText = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorText);
      }

      // Update usage count
      fetchUsageData();

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const data = await response.json();
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? { ...m, content: data.text || '', isStreaming: false }
                  : m
              ),
            };
          })
        );
        setIsGenerating(false);
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response stream is unavailable.');

      const decoder = new TextDecoder();
      let accumulatedText = '';
      let streamBuffer = '';
      let streamServerError: string | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const lines = streamBuffer.split(/\r?\n/);
        streamBuffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;

          const dataString = trimmed.replace(/^data:\s*/, '');
          if (dataString === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(dataString);
            if (parsed.error) {
              streamServerError = parsed.error;
            } else if (parsed.text) {
              accumulatedText += parsed.text;
              setSessions((prev) =>
                prev.map((s) => {
                  if (s.id !== activeSessionId) return s;
                  return {
                    ...s,
                    messages: s.messages.map((m) =>
                      m.id === assistantPlaceholderId
                        ? { ...m, content: accumulatedText, isStreaming: true }
                        : m
                    ),
                  };
                })
              );
            }
          } catch {
            // Partial JSON buffer
          }
        }
      }

      // Finalize stream state
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === assistantPlaceholderId
                ? {
                    ...m,
                    content: accumulatedText,
                    isStreaming: false,
                    error: streamServerError || (accumulatedText ? undefined : 'No response generated.'),
                  }
                : m
            ),
          };
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('User cancelled request.');
      } else {
        console.error('Chat error:', err);
        const errorMsg =
          err.message || 'An unexpected error occurred while communicating with Gemini.';
        setSessions((prev) =>
          prev.map((s) => {
            if (s.id !== activeSessionId) return s;
            return {
              ...s,
              messages: s.messages.map((m) =>
                m.id === assistantPlaceholderId
                  ? {
                      ...m,
                      isStreaming: false,
                      error: errorMsg,
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Retry Answer
  const handleRetryLastAnswer = () => {
    if (isGenerating || currentSession.messages.length < 2) return;

    const msgs = currentSession.messages;
    const lastMsg = msgs[msgs.length - 1];

    if (lastMsg.role === 'assistant') {
      const lastUserMsg = msgs[msgs.length - 2];
      if (lastUserMsg && lastUserMsg.role === 'user') {
        const trimmed = msgs.slice(0, msgs.length - 1);
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId ? { ...s, messages: trimmed } : s
          )
        );
        handleSendMessage(lastUserMsg.content);
      }
    }
  };

  // Modify Response
  const handleModifyResponse = (instruction: string) => {
    handleSendMessage(instruction);
  };

  const currentPlan = NOVA_PLANS[currentPlanId] || NOVA_PLANS.starter;

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 overflow-hidden select-text font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveId}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onRenameSession={handleRenameSession}
        onTogglePinSession={handleTogglePinSession}
        onClearAllSessions={handleClearAllSessions}
        isOpen={isSidebarOpen}
        onToggleOpen={() => setIsSidebarOpen((prev) => !prev)}
        onOpenPublishGuide={() => setIsPublishGuideOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSubscription={() => setIsSubscriptionOpen(true)}
        currentPlanId={currentPlanId}
        usageData={usageData}
        isApiConfigured={apiStatus.configured}
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        activeModelName={activeModel.name}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative bg-transparent">
        {/* Top Header */}
        <header className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-3 sm:px-4 md:px-6 bg-white/80 dark:bg-[#0a0f1d]/80 backdrop-blur-md z-10 flex-shrink-0 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 cursor-pointer flex-shrink-0"
              title="Open menu"
            >
              <Menu size={18} />
            </button>

            {/* Nova AI Brand Logo */}
            <NovaLogo
              size="sm"
              onClick={() => {
                setActiveMode('chat');
                handleNewChat();
              }}
              className="flex-shrink-0"
            />

            {/* Quick Model Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setShowModelPicker((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#121927] hover:bg-slate-100 dark:hover:bg-white/10 text-xs text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                <span className="font-semibold">{activeModel.name}</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              {showModelPicker && (
                <div className="absolute top-full left-0 mt-1 w-72 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/15 shadow-2xl py-1.5 z-40">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span>Nova AI Models</span>
                    <span className="text-cyan-400 font-mono">v2.5 / v3</span>
                  </div>
                  {availableModels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSettings((prev) => ({ ...prev, modelId: m.id }));
                        setShowModelPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors cursor-pointer flex items-center justify-between ${
                        settings.modelId === m.id
                          ? 'bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-200 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="pr-2">
                        <span className="block font-medium">{m.name}</span>
                        <span className="text-[10px] text-slate-400 block line-clamp-1">{m.description}</span>
                      </div>
                      {settings.modelId === m.id && (
                        <Check size={14} className="text-cyan-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Mode Switcher Buttons */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-200/60 dark:bg-[#131929] border border-slate-300/40 dark:border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveMode('chat')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeMode === 'chat'
                    ? 'bg-white dark:bg-cyan-950 text-slate-900 dark:text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Chat Mode"
              >
                <MessageSquare size={13} />
                <span className="hidden min-[380px]:inline">Chat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('image')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeMode === 'image'
                    ? 'bg-white dark:bg-cyan-950 text-slate-900 dark:text-cyan-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Image Studio"
              >
                <ImageIcon size={13} />
                <span className="hidden min-[430px]:inline">Images</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('video')}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeMode === 'video'
                    ? 'bg-white dark:bg-purple-950 text-slate-900 dark:text-purple-300 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Video Studio"
              >
                <Video size={13} />
                <span className="hidden min-[480px]:inline">Video</span>
              </button>
            </div>

            {/* Plan Badge Button */}
            <button
              type="button"
              onClick={() => setIsSubscriptionOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-500 dark:text-cyan-300 transition-colors cursor-pointer"
            >
              <CreditCard size={13} />
              <span>{currentPlan.name} ({currentPlan.priceDisplay})</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex-shrink-0"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Settings Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex-shrink-0"
              title="Settings"
            >
              <Settings size={15} />
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md transition-all cursor-pointer flex-shrink-0"
              title="New Conversation"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </header>

        {/* View Switcher: Chat vs Image Studio vs Video Studio */}
        {activeMode === 'video' ? (
          <VideoStudio
            onSwitchToChat={() => setActiveMode('chat')}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        ) : activeMode === 'image' ? (
          <ImageStudio
            onSwitchToChat={() => setActiveMode('chat')}
            onSendToChat={(img) => {
              setActiveMode('chat');
              handleSendMessage(`Image Visual Concept: ${img.prompt}`);
            }}
          />
        ) : currentSession.messages.length === 0 ? (
          /* Welcome Screen with embedded large modern chat composer */
          <div className="flex-1 overflow-y-auto flex flex-col justify-center min-h-0">
            <WelcomeScreen
              onAction={handleWelcomeAction}
              planName={currentPlan.name}
            >
              <ChatInput
                ref={chatInputRef}
                input={input}
                setInput={setInput}
                onSend={() => handleSendMessage()}
                onStop={handleStopGenerating}
                onClear={handleClearCurrentChat}
                isGenerating={isGenerating}
                disabled={isGenerating}
                hasMessages={false}
                attachments={attachments}
                setAttachments={setAttachments}
                activeModelName={activeModel.name}
                isImageMode={isChatImageMode}
                onToggleImageMode={() => setIsChatImageMode((prev) => !prev)}
              />
            </WelcomeScreen>
          </div>
        ) : (
          /* Conversation View with messages scrolling and bottom-pinned input */
          <>
            <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
              <div className="flex-1 flex flex-col py-6 space-y-2">
                {currentSession.messages.map((message, idx) => (
                  <ChatMessage
                    key={message.id || idx}
                    message={message}
                    isLastAssistant={
                      idx === currentSession.messages.length - 1 &&
                      message.role === 'assistant'
                    }
                    onRetry={handleRetryLastAnswer}
                    onOpenStudio={() => setActiveMode('image')}
                    onModifyResponse={handleModifyResponse}
                  />
                ))}
                <div ref={messagesEndRef} className="h-6" />
              </div>
            </div>

            {/* Input Bar: Non-overlapping, pinned cleanly at bottom */}
            <div className="flex-shrink-0 z-20">
              <ChatInput
                ref={chatInputRef}
                input={input}
                setInput={setInput}
                onSend={() => handleSendMessage()}
                onStop={handleStopGenerating}
                onClear={handleClearCurrentChat}
                isGenerating={isGenerating}
                disabled={isGenerating}
                hasMessages={true}
                attachments={attachments}
                setAttachments={setAttachments}
                activeModelName={activeModel.name}
                isImageMode={isChatImageMode}
                onToggleImageMode={() => setIsChatImageMode((prev) => !prev)}
              />
            </div>
          </>
        )}
      </main>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionOpen}
        onClose={() => setIsSubscriptionOpen(false)}
        currentPlanId={currentPlanId}
        usageData={usageData}
        onSelectPlan={handleSelectPlan}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        availableModels={availableModels}
        isApiConfigured={apiStatus.configured}
      />

      {/* Free Publishing Guide Modal */}
      <PublishInfoModal
        isOpen={isPublishGuideOpen}
        onClose={() => setIsPublishGuideOpen(false)}
      />
    </div>
  );
}
