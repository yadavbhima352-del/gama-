import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Cpu,
  Globe,
  ShieldCheck,
  Check,
  Sparkles,
  Sliders,
  BarChart3,
  Info,
} from 'lucide-react';
import { AppSettings, ModelInfo } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSaveSettings: (newSettings: AppSettings) => void;
  availableModels: ModelInfo[];
  isApiConfigured: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  availableModels,
  isApiConfigured,
}) => {
  const [modelId, setModelId] = useState(settings.modelId);
  const [customPrompt, setCustomPrompt] = useState(settings.systemInstruction || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      modelId,
      language: 'auto',
      systemInstruction: customPrompt.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0a101f] border border-slate-200 dark:border-cyan-500/35 p-6 md:p-8 shadow-2xl text-slate-900 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nova AI Settings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Model selection, instructions, and cost controls</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-5 space-y-6 text-sm">
          {/* Model Selection */}
          <div>
            <label className="block text-xs font-semibold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Cpu size={14} className="text-cyan-500" />
              <span>Default AI Model</span>
            </label>
            <div className="space-y-2.5">
              {availableModels.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setModelId(m.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    modelId === m.id
                      ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-400 text-cyan-950 dark:text-cyan-200 shadow-sm'
                      : 'bg-white dark:bg-[#070d18] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-cyan-400/40'
                  }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-400/40 text-cyan-700 dark:text-cyan-300 font-mono">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">{m.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      modelId === m.id
                        ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                        : 'border-slate-400'
                    }`}
                  >
                    {modelId === m.id && <Check size={12} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic Language Detection Notice */}
          <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2.5">
            <Globe size={16} className="text-cyan-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold block">Automatic Language Detection Active</span>
              <p className="text-[11px] text-cyan-700 dark:text-cyan-300/80 mt-0.5 leading-relaxed">
                Nova AI automatically detects the language of your message (Hindi, Hinglish, English, or global languages) and answers in the exact same language seamlessly without needing a manual switch.
              </p>
            </div>
          </div>

          {/* System Instruction / Persona Customization */}
          <div>
            <label className="block text-xs font-semibold text-cyan-600 dark:text-cyan-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sliders size={14} className="text-cyan-500" />
              <span>Custom System Instruction (Optional)</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Always structure code responses with TypeScript interfaces, explain concepts step-by-step..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-[#070d18] border border-slate-200 dark:border-white/10 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          {/* Cost Control & Security Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Security & Cost Protection</span>
            </div>
            <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-5">
              <li>API Keys are stored strictly on the server; never exposed to browser client code.</li>
              <li>Daily quotas prevent runaway API spend (Starter: 80, Pro: 200, Ultimate: Fair-use).</li>
              <li>Video generation remains locked until owner-approved video credentials are supplied.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
