import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  FileText,
  File,
  Maximize2,
  X,
  Download,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  Volume2,
  VolumeX,
  Pause,
  Play,
  ThumbsUp,
  ThumbsDown,
  Share2,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { Message } from '../types/chat';
import { geminiTTS, containsHindi } from '../utils/speech';

interface ChatMessageProps {
  message: Message;
  isLastAssistant: boolean;
  onRetry?: () => void;
  onOpenStudio?: () => void;
  onModifyResponse?: (instruction: string) => void;
  isAdvanced?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAssistant,
  onRetry,
  onOpenStudio,
  onModifyResponse,
  isAdvanced = false,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice playback state
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showModifyMenu, setShowModifyMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Subscribe to global TTS events
  useEffect(() => {
    const unsubscribe = geminiTTS.subscribe(({ isPlaying, isPaused, messageId }) => {
      if (messageId === message.id) {
        setIsPlayingVoice(isPlaying);
        setIsVoicePaused(isPaused);
      } else {
        setIsPlayingVoice(false);
        setIsVoicePaused(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [message.id]);

  const handleToggleVoice = () => {
    if (isPlayingVoice) {
      geminiTTS.pause();
    } else if (isVoicePaused) {
      geminiTTS.resume();
    } else {
      geminiTTS.speak(message.id, message.content);
    }
  };

  const handleStopVoice = () => {
    geminiTTS.stop();
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text:', e);
    }
  };

  const handleCopyCode = async (codeText: string, index: number) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIndex(index);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } catch (e) {
      console.error('Failed to copy code snippet:', e);
    }
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([message.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-response-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadGenerated = (url: string, promptText: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-image-${promptText.slice(0, 25).replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isHindiResponse = containsHindi(message.content);

  return (
    <>
      <div
        className={`w-full py-4 px-3 sm:px-6 md:px-8 transition-colors ${
          isUser ? 'flex justify-end' : 'flex justify-start'
        }`}
      >
        <div className={`max-w-4xl w-full ${isUser ? 'flex justify-end' : 'flex flex-col'}`}>
          {isUser ? (
            /* User Message Bubble on Right */
            <div className="flex flex-col items-end max-w-2xl">
              {/* Attached Files */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                  {message.attachments.map((att) => {
                    const isImg = att.type.startsWith('image/');
                    return isImg ? (
                      <div
                        key={att.id}
                        onClick={() => setLightboxImage(att.dataUrl)}
                        className="relative group/img cursor-pointer rounded-2xl overflow-hidden border border-white/10 shadow-lg"
                      >
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="max-h-40 max-w-[220px] object-cover group-hover/img:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-cyan-300">
                          <Maximize2 size={16} />
                        </div>
                      </div>
                    ) : (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1e293b]/70 border border-white/10 text-xs text-slate-200"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-400/30 flex items-center justify-center text-blue-300">
                          {att.type === 'application/pdf' ? <FileText size={15} /> : <File size={15} />}
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-slate-200 truncate max-w-[150px]">{att.name}</span>
                          <span className="text-[10px] text-slate-400">{formatFileSize(att.size)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Text Bubble */}
              {message.content && (
                <div className="inline-block text-left p-3.5 sm:p-4 rounded-3xl rounded-tr-sm bg-[#1e2330] border border-white/10 text-slate-100 shadow-md">
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed break-words font-normal">
                    {message.content}
                  </p>
                </div>
              )}
              <span className="text-[10px] text-slate-500 mt-1 px-1">{formatTime(message.timestamp)}</span>
            </div>
          ) : (
            /* Assistant Message on Left */
            <div className="w-full max-w-3xl">
              {/* TOP HEADER WITH BRAND & VOICE AUDIO OPTION */}
              <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                {/* Left: Nova AI Emblem & Model Info */}
                <div className="flex items-center gap-2 text-xs">
                  {/* Nova AI Celestial Pulsar Emblem */}
                  <div className="w-5 h-5 relative flex items-center justify-center flex-shrink-0 rounded-lg bg-gradient-to-tr from-cyan-400 to-sky-500 p-[1px]">
                    <div className="w-full h-full rounded-[7px] bg-[#070d1a] flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-cyan-300">
                        <path
                          d="M12 2L13.8 8.8C14.3 10.7 15.8 12.2 17.7 12.7L22 14L17.7 15.3C15.8 15.8 14.3 17.3 13.8 19.2L12 22L10.2 19.2C9.7 17.3 8.2 15.8 6.3 15.3L2 14L6.3 12.7C8.2 12.2 9.7 10.7 10.2 8.8L12 2Z"
                          fill="#22d3ee"
                        />
                      </svg>
                    </div>
                  </div>

                  <span className="font-bold text-slate-900 dark:text-white tracking-tight">Nova AI</span>
                  
                  {message.modelUsed && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono">
                      {message.modelUsed}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-[10px] text-slate-400">{formatTime(message.timestamp)}</span>
                </div>

                {/* RIGHT: PROMINENT VOICE OPTION AT THE TOP OF THE ANSWER */}
                {message.content && !message.isStreaming && !message.error && (
                  <div className="flex items-center gap-1.5 bg-[#121927] border border-cyan-500/30 rounded-full px-2.5 py-1 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <button
                      type="button"
                      onClick={handleToggleVoice}
                      title={
                        isPlayingVoice
                          ? 'Pause audio voice (आवाज़ रोकें)'
                          : isVoicePaused
                          ? 'Resume audio voice (आवाज़ जारी रखें)'
                          : 'Listen to this answer aloud (उत्तर की आवाज़ सुनें)'
                      }
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isPlayingVoice
                          ? 'text-cyan-300 font-bold'
                          : isVoicePaused
                          ? 'text-amber-300 font-medium'
                          : 'text-slate-300 hover:text-cyan-300'
                      }`}
                    >
                      {isPlayingVoice ? (
                        <>
                          {/* Animated sound wave bars */}
                          <div className="flex items-center gap-0.5 h-3.5">
                            <span className="w-1 bg-cyan-400 rounded-full wave-bar-1" />
                            <span className="w-1 bg-sky-400 rounded-full wave-bar-2" />
                            <span className="w-1 bg-blue-400 rounded-full wave-bar-3" />
                            <span className="w-1 bg-purple-400 rounded-full wave-bar-4" />
                          </div>
                          <span>Speaking... (रोकें)</span>
                        </>
                      ) : isVoicePaused ? (
                        <>
                          <Play size={13} className="text-amber-400 fill-amber-400" />
                          <span>Resume (पुनः सुनें)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={14} className="text-cyan-400" />
                          <span>{isHindiResponse ? 'उत्तर सुनें (Listen)' : 'Listen'}</span>
                        </>
                      )}
                    </button>

                    {(isPlayingVoice || isVoicePaused) && (
                      <button
                        type="button"
                        onClick={handleStopVoice}
                        title="Stop audio playback"
                        className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1 cursor-pointer"
                      >
                        <VolumeX size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Image Generation in Progress */}
              {message.isImageGenerating ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#090e17] border border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col gap-3 max-w-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                      <RefreshCw size={18} className="animate-spin text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-cyan-200">
                        Generating Visual Concept...
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 font-mono">
                        Connecting to Gemini Image Studio (Imagen)
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-900/80 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
                    <div className="bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 h-full w-2/3 animate-[pulse_1.5s_ease-in-out_infinite]" />
                  </div>
                  <span className="text-[11px] text-slate-400 italic">
                    Synthesizing high-resolution imagery and composition...
                  </span>
                </div>
              ) : message.generatedImage ? (
                /* Generated Image Display */
                <div className="rounded-2xl bg-[#090e18] border border-cyan-500/35 overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.2)] max-w-xl">
                  <div className="relative group/canvas bg-black flex items-center justify-center overflow-hidden">
                    <img
                      src={message.generatedImage.url}
                      alt={message.generatedImage.prompt}
                      className="w-full max-h-[500px] object-contain transition-transform duration-300 group-hover/canvas:scale-[1.01]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/canvas:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-[11px] text-cyan-200 truncate max-w-[260px] font-mono">
                        {message.generatedImage.prompt}
                      </span>
                      <button
                        onClick={() => setLightboxImage(message.generatedImage!.url)}
                        className="p-1.5 rounded-lg bg-black/60 text-cyan-300 hover:text-white border border-cyan-500/40 cursor-pointer"
                        title="Enlarge Image"
                      >
                        <Maximize2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0c121e] border-t border-cyan-500/20">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/30 text-cyan-300 font-mono">
                          {message.generatedImage.aspectRatio || '1:1'}
                        </span>
                        {message.generatedImage.style && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-400/30 text-blue-300">
                            {message.generatedImage.style}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadGenerated(
                            message.generatedImage!.url,
                            message.generatedImage!.prompt
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer transition-all"
                      >
                        <Download size={13} strokeWidth={2.5} />
                        <span>Save PNG</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed break-words">
                      {message.content || `"${message.generatedImage.prompt}"`}
                    </p>
                  </div>
                </div>
              ) : message.error ? (
                /* Assistant Error State */
                <div
                  className={`p-4 sm:p-5 rounded-2xl border text-sm flex flex-col gap-3 shadow-lg ${
                    message.isImageError
                      ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {message.isImageError ? (
                      <ShieldAlert size={20} className="text-amber-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="text-rose-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">
                        {message.isImageError ? 'Image Generation Notice' : 'Request Notice'}
                      </h4>
                      <p className="text-xs mt-1 leading-relaxed opacity-90">{message.error}</p>
                    </div>
                  </div>

                  {message.isImageError && onOpenStudio && (
                    <div className="flex justify-end pt-2 border-t border-amber-500/20">
                      <button
                        onClick={onOpenStudio}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Open Image Studio
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Standard Markdown Response */
                <div className="text-slate-100 text-sm sm:text-base leading-relaxed break-words">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-3.5 leading-relaxed text-slate-200 font-normal">{children}</p>,
                      h1: ({ children }) => (
                        <h1 className="text-xl sm:text-2xl font-bold text-white mt-5 mb-2 pb-1 border-b border-white/10">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg sm:text-xl font-bold text-white mt-4 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base sm:text-lg font-semibold text-white mt-3 mb-1.5">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => <ul className="list-disc pl-5 mb-3.5 space-y-1.5 text-slate-200">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 mb-3.5 space-y-1.5 text-slate-200">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-cyan-400/60 pl-4 py-1 my-3 bg-white/[0.02] rounded-r-lg text-slate-300 italic">
                          {children}
                        </blockquote>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-4 border border-white/10 rounded-xl">
                          <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
                        </div>
                      ),
                      thead: ({ children }) => <thead className="bg-white/5 border-b border-white/10">{children}</thead>,
                      th: ({ children }) => <th className="p-3 font-semibold text-white">{children}</th>,
                      td: ({ children }) => <td className="p-3 border-t border-white/5 text-slate-300">{children}</td>,
                      code({ node, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !String(children).includes('\n');
                        const codeString = String(children).replace(/\n$/, '');

                        if (isInline) {
                          return (
                            <code className="px-1.5 py-0.5 rounded-md text-xs font-mono bg-white/10 text-cyan-200 border border-white/10">
                              {children}
                            </code>
                          );
                        }

                        const codeId = Math.random();
                        return (
                          <div className="relative group/code my-4 rounded-xl overflow-hidden border border-white/15 bg-[#080d1a] shadow-md">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#0d1424] border-b border-white/10 text-xs">
                              <span className="font-mono text-cyan-300 font-medium lowercase">
                                {match ? match[1] : 'code'}
                              </span>
                              <button
                                onClick={() => handleCopyCode(codeString, Math.floor(codeId * 1000))}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-[11px] cursor-pointer"
                              >
                                {copiedCodeIndex === Math.floor(codeId * 1000) ? (
                                  <>
                                    <Check size={12} className="text-emerald-400" />
                                    <span className="text-emerald-400 font-medium">Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy size={12} />
                                    <span>Copy code</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-cyan-100 bg-[#050812] leading-relaxed">
                              <code>{children}</code>
                            </pre>
                          </div>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>

                  {/* Active reasoning indicator */}
                  {message.isStreaming && !message.content && (
                    <div className="flex items-center gap-2.5 py-2 text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Nova AI is thinking...
                      </span>
                    </div>
                  )}

                  {/* Cursor */}
                  {message.isStreaming && message.content && <span className="typing-cursor" />}
                </div>
              )}

              {/* SIGNATURE GEMINI TOOLBAR UNDER MESSAGE */}
              {!message.isStreaming && message.content && (
                <div className="flex items-center gap-1 sm:gap-2 mt-3 pt-2 text-slate-400 text-xs flex-wrap">
                  {/* Listen Voice Button (also at bottom) */}
                  <button
                    onClick={handleToggleVoice}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      isPlayingVoice
                        ? 'bg-cyan-950/60 border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                    title="Play response aloud (उत्तर की आवाज़ सुनें)"
                  >
                    {isPlayingVoice ? <Pause size={13} /> : <Volume2 size={13} />}
                    <span>{isPlayingVoice ? 'Pause' : 'Listen'}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    title="Copy response to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Good / Bad Response Feedback */}
                  <button
                    onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      feedback === 'up'
                        ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-300'
                        : 'border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                    title="Good response"
                  >
                    <ThumbsUp size={13} />
                  </button>

                  <button
                    onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      feedback === 'down'
                        ? 'bg-rose-950/40 border-rose-400/40 text-rose-300'
                        : 'border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`}
                    title="Bad response"
                  >
                    <ThumbsDown size={13} />
                  </button>

                  {/* Modify Response (Gemini's signature feature) */}
                  {onModifyResponse && (
                    <div className="relative">
                      <button
                        onClick={() => setShowModifyMenu(!showModifyMenu)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                        title="Modify response tone or length"
                      >
                        <SlidersHorizontal size={13} />
                        <span className="hidden sm:inline">Modify</span>
                        <ChevronDown size={11} />
                      </button>

                      {showModifyMenu && (
                        <div className="absolute bottom-full left-0 mb-2 w-48 rounded-xl bg-[#0f172a] border border-white/15 p-1.5 shadow-xl z-20 flex flex-col gap-1 text-xs text-slate-200">
                          <span className="px-2 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            Modify Response
                          </span>
                          <button
                            onClick={() => {
                              onModifyResponse('Make your previous response shorter and more concise in the same language.');
                              setShowModifyMenu(false);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            Shorter (छोटा करें)
                          </button>
                          <button
                            onClick={() => {
                              onModifyResponse('Provide a more detailed and thorough explanation of your previous response.');
                              setShowModifyMenu(false);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            Longer (विस्तार से)
                          </button>
                          <button
                            onClick={() => {
                              onModifyResponse('Simplify your previous response so it is easier to understand with simpler language.');
                              setShowModifyMenu(false);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            Simpler (सरल भाषा में)
                          </button>
                          <button
                            onClick={() => {
                              onModifyResponse('Rewrite your response in a more casual, friendly, and conversational tone.');
                              setShowModifyMenu(false);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            More casual (दोस्ताना)
                          </button>
                          <button
                            onClick={() => {
                              onModifyResponse('Rewrite your response in an articulate, formal, and professional business tone.');
                              setShowModifyMenu(false);
                            }}
                            className="text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                          >
                            More professional (पेशेवर)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Share & Export */}
                  <button
                    onClick={handleDownloadMarkdown}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white transition-all cursor-pointer"
                    title="Export response as Markdown (.md)"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">Export</span>
                  </button>

                  {/* Retry Button */}
                  {isLastAssistant && onRetry && (
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 hover:text-white transition-all cursor-pointer ml-auto"
                      title="Regenerate this response"
                    >
                      <RotateCcw size={13} />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={lightboxImage}
              alt="Enlarged attachment"
              className="max-h-[85vh] max-w-full rounded-2xl border border-cyan-500/40 shadow-[0_0_40px_rgba(34,211,238,0.4)] object-contain"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-3 -right-3 p-2 rounded-full bg-slate-900 border border-cyan-400 text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
