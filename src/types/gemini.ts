export type GeminiTier = 'free' | 'advanced';

export interface GeminiGem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  systemPrompt: string;
  category: 'code' | 'write' | 'ideas' | 'research' | 'language';
  color: string;
  accentBg: string;
  samplePrompts: string[];
}

export const GEMINI_GEMS: GeminiGem[] = [
  {
    id: 'coding-partner',
    name: 'Coding Partner',
    tagline: 'Write, debug, and explain code',
    description: 'Expert programmer that architects full-stack code, squashes bugs, and writes clean TypeScript/Python.',
    icon: 'Terminal',
    systemPrompt:
      'You are Gemini Coding Partner, an elite senior software engineer and tech lead. Provide clean, secure, production-grade code with clear explanations, types, error handling, and comments.',
    category: 'code',
    color: '#38bdf8',
    accentBg: 'rgba(56, 189, 248, 0.15)',
    samplePrompts: [
      'Build a React voice transcription hook with Web Speech API',
      'Explain how WebSockets work vs Server-Sent Events with code',
      'Debug this TypeScript async function and fix race conditions',
    ],
  },
  {
    id: 'writing-editor',
    name: 'Writing Editor',
    tagline: 'Polish copy, emails, and essays',
    description: 'Master wordsmith that elevates your tone, fixes grammar, drafts captivating stories, or drafts emails.',
    icon: 'PenTool',
    systemPrompt:
      'You are Gemini Writing Editor, a master editor and copywriter. Enhance clarity, flow, tone, and grammar while preserving the author’s authentic voice.',
    category: 'write',
    color: '#ec4899',
    accentBg: 'rgba(236, 72, 153, 0.15)',
    samplePrompts: [
      'Polish this professional email to sound respectful yet assertive',
      'Draft a captivating blog introduction about future AI technologies',
      'Rewrite this paragraph in 3 different tones: formal, casual, storytelling',
    ],
  },
  {
    id: 'brainstormer',
    name: 'Brainstormer',
    tagline: 'Discover bold ideas and concepts',
    description: 'Dynamic creative catalyst that generates out-of-the-box product ideas, marketing strategies, and hooks.',
    icon: 'Lightbulb',
    systemPrompt:
      'You are Gemini Brainstormer, a boundless creative strategist and innovator. Think expansively, generate diverse novel angles, and challenge conventional thinking.',
    category: 'ideas',
    color: '#eab308',
    accentBg: 'rgba(234, 179, 8, 0.15)',
    samplePrompts: [
      'Give me 10 innovative startup ideas merging AI with agriculture in India',
      'Brainstorm catchy YouTube video titles about space exploration',
      'Develop 5 engaging game mechanics for a multiplayer mobile puzzle',
    ],
  },
  {
    id: 'research-analyst',
    name: 'Deep Research Analyst',
    tagline: 'Synthesize complex facts and data',
    description: 'Rigorous analyst that breaks down dense topics, summarizes papers, and creates structured comparison briefs.',
    icon: 'BookOpen',
    systemPrompt:
      'You are Gemini Deep Research Analyst. Analyze subjects with precision, provide objective evaluations, cite logical arguments, and summarize takeaways concisely.',
    category: 'research',
    color: '#8b5cf6',
    accentBg: 'rgba(139, 92, 246, 0.15)',
    samplePrompts: [
      'Compare PostgreSQL vs MongoDB for high-scale realtime IoT telemetry',
      'Synthesize key breakthroughs in Quantum Computing from recent years',
      'Break down the economic impact of renewable energy transitions',
    ],
  },
  {
    id: 'polyglot-translator',
    name: 'Polyglot Translator',
    tagline: 'Fluent Hindi, English, and global tongues',
    description: 'Culturally fluent translator that flawlessly bridges Hindi (हिन्दी), Hinglish, English, and regional languages.',
    icon: 'Languages',
    systemPrompt:
      'You are Gemini Polyglot Translator. Deliver culturally nuanced, contextually accurate translations between Hindi, Hinglish, English, and other languages without robotic phrasing.',
    category: 'language',
    color: '#10b981',
    accentBg: 'rgba(16, 185, 129, 0.15)',
    samplePrompts: [
      'Translate this technical guide into natural, conversational Hindi',
      'Convert this formal English contract clause into clear Hinglish',
      'Explain subtle idiomatic expressions between Hindi and English',
    ],
  },
];

export interface SubscriptionPlan {
  id: GeminiTier;
  name: string;
  badge: string;
  price: string;
  billingPeriod: string;
  trial: string;
  description: string;
  features: string[];
  modelsIncluded: string[];
  accentColor: string;
}

export const SUBSCRIPTION_PLANS: Record<GeminiTier, SubscriptionPlan> = {
  free: {
    id: 'free',
    name: 'Gemini',
    badge: 'Standard',
    price: '₹0',
    billingPeriod: 'Free forever',
    trial: 'No credit card needed',
    description: 'Our most capable free AI model for everyday tasks, multimodal vision, and natural multilingual conversations.',
    features: [
      'Gemini 2.5 Flash / 3.5 Flash multimodal intelligence',
      'Voice input (Speech-to-Text) & Voice output (Text-to-Speech)',
      'Document & Image analysis (PDF, PNG, JPG)',
      'Multilingual auto-detection (Hindi, Hinglish, English)',
      '3 Free image generation credits',
      'Standard response speeds',
    ],
    modelsIncluded: ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'],
    accentColor: '#38bdf8',
  },
  advanced: {
    id: 'advanced',
    name: 'Gemini Advanced',
    badge: 'Google One AI Premium',
    price: '₹1,950',
    billingPeriod: '/ month after 1-month trial',
    trial: '1 month free trial',
    description: 'Access our most capable model, Gemini 2.5 Pro, with state-of-the-art reasoning, 1M+ token context, and custom Gems.',
    features: [
      'Gemini 2.5 Pro with Deep Reasoning & Complex Thinking',
      'Massive 1 Million+ token context window',
      'Interactive Python code execution & data charts',
      'Exclusive access to custom Gemini Gems suite',
      'Priority server access & zero queue during peak hours',
      'High-resolution generative image studio (Imagen)',
      '2 TB Cloud Storage with Google One integration',
      'Voice playback with natural neural voices',
    ],
    modelsIncluded: ['gemini-2.5-pro', 'gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite-image'],
    accentColor: '#c084fc',
  },
};
