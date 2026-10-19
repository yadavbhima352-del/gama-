// Gemini Speech Utility: Text-to-Speech (TTS) and Speech-to-Text (STT)

export interface VoiceState {
  isPlaying: boolean;
  isPaused: boolean;
  currentMessageId: string | null;
  rate: number;
}

// Clean markdown syntax for clean spoken speech
export function cleanMarkdownForSpeech(text: string): string {
  if (!text) return '';

  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' [Code snippet omitted for audio playback] ')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown images and links
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // Remove headers (#, ##, ###)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italics
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    // Remove bullet points and numbered lists markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[*\-_]{3,}\s*$/gm, '')
    // Remove extra whitespace and line breaks
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// Detect if text contains Hindi / Devanagari script
export function containsHindi(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

// Global Speech Synthesis Controller
class GeminiTTSController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentMessageId: string | null = null;
  private listeners: ((state: { isPlaying: boolean; isPaused: boolean; messageId: string | null }) => void)[] = [];
  private speechRate: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Warm up voices
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }

  public subscribe(listener: (state: { isPlaying: boolean; isPaused: boolean; messageId: string | null }) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(isPlaying: boolean, isPaused: boolean, messageId: string | null) {
    this.listeners.forEach((listener) => listener({ isPlaying, isPaused, messageId }));
  }

  public speak(messageId: string, rawText: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    // If currently speaking this message, toggle pause/resume
    if (this.currentMessageId === messageId && this.currentUtterance) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        this.notify(true, false, messageId);
        return;
      } else if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        this.notify(false, true, messageId);
        return;
      }
    }

    // Stop any existing speech
    this.stop();

    const cleanText = cleanMarkdownForSpeech(rawText);
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;
    this.currentMessageId = messageId;
    utterance.rate = this.speechRate;

    // Pick appropriate voice
    const isHindi = containsHindi(cleanText);
    const voices = window.speechSynthesis.getVoices();

    if (isHindi) {
      utterance.lang = 'hi-IN';
      const hindiVoice = voices.find(
        (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('lekha')
      );
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      utterance.lang = 'en-US';
      const naturalVoice = voices.find(
        (v) =>
          (v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')))
      );
      if (naturalVoice) utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.notify(true, false, messageId);
    };

    utterance.onpause = () => {
      this.notify(false, true, messageId);
    };

    utterance.onresume = () => {
      this.notify(true, false, messageId);
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      this.currentMessageId = null;
      this.notify(false, false, null);
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      this.currentUtterance = null;
      this.currentMessageId = null;
      this.notify(false, false, null);
    };

    window.speechSynthesis.speak(utterance);
  }

  public pause() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.notify(false, true, this.currentMessageId);
    }
  }

  public resume() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.notify(true, false, this.currentMessageId);
    }
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      const prevId = this.currentMessageId;
      this.currentMessageId = null;
      this.notify(false, false, null);
    }
  }

  public setRate(rate: number) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
  }

  public getRate(): number {
    return this.speechRate;
  }

  public getCurrentMessageId(): string | null {
    return this.currentMessageId;
  }
}

export const geminiTTS = new GeminiTTSController();

// Speech Recognition (Voice Input) Hook/Helper
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function createSpeechRecognizer(
  onResult: (transcript: string, isFinal: boolean) => void,
  onError: (error: string) => void,
  onEnd: () => void,
  language = 'hi-IN,en-US'
) {
  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    return null;
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognizer = new SpeechRecognitionClass();

  recognizer.continuous = true;
  recognizer.interimResults = true;
  // Try multi-language or user preference
  recognizer.lang = language.includes('hi') ? 'hi-IN' : 'en-US';

  recognizer.onresult = (event: any) => {
    let interim = '';
    let final = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const part = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        final += part;
      } else {
        interim += part;
      }
    }

    onResult(final || interim, Boolean(final));
  };

  recognizer.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    if (event.error === 'not-allowed') {
      onError('Microphone permission was denied. Please allow microphone access to talk.');
    } else if (event.error !== 'no-speech') {
      onError(`Speech recognition error: ${event.error}`);
    }
  };

  recognizer.onend = () => {
    onEnd();
  };

  return recognizer;
}
