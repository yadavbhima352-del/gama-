import React from 'react';
import {
  PenLine,
  Image as ImageIcon,
  Mic,
  Code2,
  Sparkles,
} from 'lucide-react';
import { NovaLogo } from './NovaLogo';

interface WelcomeScreenProps {
  onAction: (action: 'write' | 'image' | 'analyze' | 'plan' | 'voice' | 'code') => void;
  planName?: string;
  children?: React.ReactNode;
}

interface QuickActionCard {
  id: 'write' | 'image' | 'code' | 'voice';
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const QUICK_ACTIONS: QuickActionCard[] = [
  {
    id: 'write',
    title: 'Help me write',
    description: 'Draft emails, blogs, essays, or polish tone in Hindi & English',
    icon: PenLine,
    color: '#06b6d4',
  },
  {
    id: 'image',
    title: 'Create images',
    description: 'Synthesize artwork, concept art, and high-res imagery',
    icon: ImageIcon,
    color: '#38bdf8',
  },
  {
    id: 'code',
    title: 'Understand code',
    description: 'Build web components, debug errors, or review algorithms',
    icon: Code2,
    color: '#6366f1',
  },
  {
    id: 'voice',
    title: 'Talk with voice',
    description: 'Ask questions using your microphone and hear spoken answers',
    icon: Mic,
    color: '#a855f7',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onAction,
  planName,
  children,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 py-6 md:py-8 max-w-4xl mx-auto w-full select-none">
      {/* Greeting Header */}
      <div className="mb-6 sm:mb-8 text-left">
        <div className="flex items-center gap-2 mb-2">
          <NovaLogo size="sm" />
          {planName && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-400/30 text-cyan-300 font-medium">
              Plan: {planName}
            </span>
          )}
        </div>

        {/* Heading: What can I help you with? */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
          <span className="text-slate-900 dark:text-white">What can I </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
            help you with?
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-normal max-w-xl">
          Multilingual multimodal intelligence. Ask questions in Hindi, Hinglish, or English. Type or click 🎙️ to speak your questions.
        </p>
      </div>

      {/* Four Quick-Action Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 my-2 mb-4">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => onAction(action.id)}
              className="text-left p-4 rounded-2xl bg-white dark:bg-[#111726] hover:bg-slate-50 dark:hover:bg-[#161f33] border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 hover:shadow-lg transition-all group cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${action.color}15`,
                    border: `1px solid ${action.color}35`,
                    color: action.color,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Centered Composer */}
      {children}
    </div>
  );
};
