import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  Square,
  Trash2,
  ArrowUp,
  Paperclip,
  X,
  FileText,
  File,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Mic,
  MicOff,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Attachment } from '../types/chat';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech';

export interface ChatInputHandle {
  openFilePicker: () => void;
  focusTextarea: () => void;
  startVoiceInput: () => void;
}

export interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  onClear: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  hasMessages: boolean;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  activeModelName: string;
  isImageMode?: boolean;
  onToggleImageMode?: () => void;
  webSearchEnabled?: boolean;
  onToggleWebSearch?: () => void;
  isAdvanced?: boolean;
}

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
];

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(({
  input,
  setInput,
  onSend,
  onStop,
  onClear,
  isGenerating,
  disabled = false,
  hasMessages,
  attachments,
  setAttachments,
  activeModelName,
  isImageMode = false,
  onToggleImageMode,
  webSearchEnabled = false,
  onToggleWebSearch,
  isAdvanced = false,
}, ref) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognizerRef = useRef<any>(null);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    openFilePicker: () => {
      fileInputRef.current?.click();
    },
    focusTextarea: () => {
      textareaRef.current?.focus();
    },
    startVoiceInput: () => {
      handleToggleVoiceInput();
    },
  }));

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 180);
      textareaRef.current.style.height = `${Math.max(newHeight, 52)}px`;
    }
  }, [input]);

  // Clean up recognizer on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const handleToggleVoiceInput = () => {
    if (isListening) {
      // Stop listening
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    setSpeechError(null);

    if (!isSpeechRecognitionSupported()) {
      setSpeechError('Voice input is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    try {
      const recognizer = createSpeechRecognizer(
        (transcript, isFinal) => {
          if (transcript) {
            const current = input.trim();
            if (!current) {
              setInput(transcript);
            } else if (!current.endsWith(transcript)) {
              setInput(`${current} ${transcript}`);
            }
          }
        },
        (error) => {
          setSpeechError(error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        },
        'hi-IN'
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        recognizer.start();
        setIsListening(true);
      }
    } catch (e: any) {
      console.warn('Failed to start speech recognizer:', e);
      setSpeechError(e?.message || 'Could not access microphone.');
      setIsListening(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && (input.trim() || attachments.length > 0)) {
        if (isListening && recognizerRef.current) {
          try {
            recognizerRef.current.stop();
          } catch {}
          setIsListening(false);
        }
        onSend();
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setFileError(null);

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setFileError(`"${file.name}" exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`);
        return;
      }

      const isAllowed =
        ALLOWED_MIME_TYPES.includes(file.type) ||
        file.name.endsWith('.md') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.json');

      if (!isAllowed) {
        setFileError(`"${file.name}" is not a supported file type.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            name: file.name,
            type: file.type || 'text/plain',
            size: file.size,
            dataUrl,
          },
        ]);
      };

      reader.onerror = () => {
        setFileError(`Failed to read "${file.name}". Please try again.`);
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const canSend = !isGenerating && !disabled && (input.trim().length > 0 || attachments.length > 0);

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 md:px-8 pb-3 sm:pb-4 pt-1 flex-shrink-0">
      {/* File Size or Type Error Banner */}
      {fileError && (
        <div className="mb-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
            <span>{fileError}</span>
          </div>
          <button
            onClick={() => setFileError(null)}
            className="text-rose-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Speech Error Banner */}
      {speechError && (
        <div className="mb-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-400 flex-shrink-0" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-amber-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div
        className={`relative rounded-3xl p-3 sm:p-4 transition-all duration-200 border ${
          isListening
            ? 'animate-listening-glow bg-white dark:bg-[#0f172a]'
            : 'bg-white dark:bg-[#111726] border-slate-200 dark:border-white/10 hover:border-cyan-400/50 shadow-md'
        }`}
      >
        <div className="flex flex-col gap-2">
          {/* Active Listening Indicator Banner */}
          {isListening && (
            <div className="flex items-center justify-between pb-2 border-b border-cyan-500/20 text-xs text-cyan-300">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5 h-4">
                  <span className="w-1 bg-cyan-400 rounded-full wave-bar-1" />
                  <span className="w-1 bg-sky-400 rounded-full wave-bar-2" />
                  <span className="w-1 bg-purple-400 rounded-full wave-bar-3" />
                  <span className="w-1 bg-pink-400 rounded-full wave-bar-4" />
                </div>
                <span className="font-medium animate-pulse">
                  Listening... speak your question in Hindi or English (बोलें...)
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-900 cursor-pointer"
              >
                Done (रुकें)
              </button>
            </div>
          )}

          {/* Attachment Chips Preview Bar */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-white/10">
              {attachments.map((att) => {
                const isImage = att.type.startsWith('image/');
                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-[#0e1626] border border-white/15 text-xs text-slate-200"
                  >
                    {isImage ? (
                      <img
                        src={att.dataUrl}
                        alt={att.name}
                        className="w-8 h-8 rounded-lg object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-300">
                        {att.type === 'application/pdf' ? <FileText size={16} /> : <File size={16} />}
                      </div>
                    )}
                    <div className="flex flex-col max-w-[140px] md:max-w-[200px]">
                      <span className="truncate font-medium text-[11px] text-slate-200">{att.name}</span>
                      <span className="text-[10px] text-slate-400">{formatFileSize(att.size)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(att.id)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors ml-1 cursor-pointer"
                      title="Remove file"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating
                ? 'Nova AI is thinking and responding...'
                : isListening
                ? 'Listening to your voice... (बोलते रहें...)'
                : isImageMode
                ? 'Describe the image to generate (e.g. "Photorealistic golden retriever running in a sunset meadow")...'
                : attachments.length > 0
                ? 'Ask anything about the attached file(s)...'
                : 'Message Nova AI or describe an image... (Type or click 🎙️ to talk)'
            }
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent resize-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base outline-none font-normal leading-relaxed max-h-[180px] overflow-y-auto"
          />

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            {/* Left Controls: Attach Files, Create Image, Voice Input, Web Search */}
            <div className="flex items-center gap-1 sm:gap-1.5 text-xs flex-wrap">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.txt,.md,.json,.csv"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Attach Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || disabled}
                title="Attach images, PDFs, or documents"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
              >
                <Paperclip size={16} className="text-cyan-400" />
                <span className="hidden sm:inline font-medium">Attach</span>
              </button>

              {/* Create Image Button */}
              {onToggleImageMode && (
                <button
                  type="button"
                  onClick={onToggleImageMode}
                  disabled={isGenerating || disabled}
                  title={isImageMode ? 'Back to Text Chat' : 'Create Image with Imagen'}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                    isImageMode
                      ? 'bg-cyan-950/80 text-cyan-200 border-cyan-400/50 shadow-sm'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <ImageIcon size={15} className={isImageMode ? 'text-cyan-300' : 'text-slate-400'} />
                  <span className="font-medium">
                    {isImageMode ? 'Image Mode' : 'Create Image'}
                  </span>
                </button>
              )}

              {/* VOICE INPUT (MICROPHONE) BUTTON - HIGH PRIORITY */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                disabled={isGenerating || disabled}
                title={
                  isListening
                    ? 'Stop listening (आवाज़ रिकॉर्डिंग रोकें)'
                    : 'Ask by speaking your question (बोल के प्रश्न पूछें)'
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer border ${
                  isListening
                    ? 'bg-rose-950/80 text-rose-200 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse'
                    : 'border-transparent text-slate-300 hover:text-cyan-300 hover:bg-white/10'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff size={16} className="text-rose-400" />
                    <span className="font-bold text-xs text-rose-300">Recording...</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} className="text-cyan-400" />
                    <span className="hidden sm:inline font-medium">Voice</span>
                  </>
                )}
              </button>

              {/* Clear Chat Button */}
              {hasMessages && (
                <button
                  type="button"
                  onClick={onClear}
                  title="Clear conversation"
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all text-xs cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Right Controls: Generating indicator, Stop / Send Button */}
            <div className="flex items-center gap-2">
              {isGenerating && (
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium pr-1">
                  <Loader2 size={13} className="animate-spin text-cyan-400" />
                  <span className="hidden sm:inline text-[11px]">Thinking...</span>
                </div>
              )}

              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
                >
                  <Square size={13} fill="currentColor" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={!canSend}
                  title="Send to Nova AI (Enter)"
                  className={`inline-flex items-center justify-center gap-1 p-2 sm:px-3.5 sm:py-2 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    canSend
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                      : 'bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="hidden sm:inline">Send</span>
                  <ArrowUp size={16} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-3 mt-1.5">
        <span className="hidden sm:inline">
          Nova AI can make mistakes, so double-check responses • Speaks & listens in Hindi & English
        </span>
        <span className="ml-auto font-mono text-[10px] text-cyan-500 dark:text-cyan-400/90">
          Model: {activeModelName}
        </span>
      </div>
    </div>
  );
});
