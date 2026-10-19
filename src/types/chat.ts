export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string; // Base64 data URL for preview and payload
}

export interface GeneratedImageData {
  url: string;
  prompt: string;
  aspectRatio?: string;
  style?: string;
  timestamp: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  error?: string;
  attachments?: Attachment[];
  modelUsed?: string;
  generatedImage?: GeneratedImageData;
  isImageGenerating?: boolean;
  isImageError?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  modelId?: string;
  isPinned?: boolean;
}

export interface ApiStatus {
  status: string;
  configured: boolean;
  model: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  tier: 'free' | 'paid';
  multimodal: boolean;
}

export type LanguagePreference = 'auto' | 'english' | 'hindi' | 'hinglish';

export interface AppSettings {
  modelId: string;
  language: LanguagePreference;
  temperature: number;
  systemInstruction?: string;
}

export interface PromptSuggestion {
  category: string;
  title: string;
  prompt: string;
  iconName: 'Code' | 'Brain' | 'Sparkles' | 'Rocket' | 'Languages';
}
