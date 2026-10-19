import React, { useState } from 'react';
import {
  Video,
  AlertCircle,
  Key,
  Shield,
  Layers,
  Sparkles,
  Info,
  Clock,
  Film,
  ExternalLink,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { NovaLogo } from './NovaLogo';

interface VideoStudioProps {
  onSwitchToChat: () => void;
  onOpenSettings: () => void;
}

export const VideoStudio: React.FC<VideoStudioProps> = ({
  onSwitchToChat,
  onOpenSettings,
}) => {
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<'5s' | '10s'>('5s');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');

  // Video generation requires explicit Google Veo / Vertex AI video model configuration by owner
  const isVideoApiConfigured = false;

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 py-6 w-full max-w-5xl mx-auto flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Video size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Nova Video Studio</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/40 text-purple-300 font-mono">
                Setup Required
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Generative AI cinematic video synthesis powered by high-capacity video models
            </p>
          </div>
        </div>

        <button
          onClick={onSwitchToChat}
          className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
        >
          Back to Chat
        </button>
      </div>

      {/* Main Studio Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Prompt & Config Controls */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0b1220] border border-white/10 space-y-4">
            <label className="text-xs font-semibold text-slate-300 block uppercase tracking-wider">
              Video Description Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Cinematic tracking shot of a futuristic drone navigating glowing cyan skyscrapers at dusk in rainy neon Tokyo..."
              rows={4}
              className="w-full bg-[#070b14] border border-white/10 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500/40 resize-none"
            />

            {/* Video Parameters */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  Duration
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDuration('5s')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      duration === '5s'
                        ? 'bg-purple-950 border-purple-400/50 text-purple-200'
                        : 'border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    5 Seconds
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuration('10s')}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      duration === '10s'
                        ? 'bg-purple-950 border-purple-400/50 text-purple-200'
                        : 'border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    10 Seconds
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                  Aspect Ratio
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['16:9', '9:16', '1:1'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAspectRatio(r)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        aspectRatio === r
                          ? 'bg-cyan-950 border-cyan-400/50 text-cyan-200'
                          : 'border-white/10 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button (Disabled with explanation) */}
            <div className="pt-2">
              <button
                disabled
                className="w-full py-3 rounded-xl bg-slate-800/80 border border-white/10 text-slate-400 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
              >
                <Film size={16} />
                <span>Video Generation Disabled (API Setup Required)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Setup Required State & Owner Approval Notice */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/30 via-[#0d1222] to-[#070b14] border border-purple-500/30 shadow-lg space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-400/40 text-purple-300 flex-shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Owner Video API Setup Required</h3>
                <p className="text-xs text-purple-200/80 mt-1 leading-relaxed">
                  Video generation consumes significant compute resources. To prevent unexpected costs, video generation remains disabled until the project owner explicitly connects and approves a verified video generation API.
                </p>
              </div>
            </div>

            {/* Specs & Requirements */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Supported Engines:</span>
                <span className="text-cyan-300">Google Veo / Vertex AI</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Resolution:</span>
                <span className="text-slate-200">1080p Full HD</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Cost Control:</span>
                <span className="text-emerald-400">Owner Budget Cap Enforced</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-slate-400">Ultimate Plan Allowance:</span>
                <span className="text-purple-300">3 Videos/day (when active)</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-2 pt-2 border-t border-purple-500/20 text-xs text-slate-300">
              <span className="font-semibold text-white block">How to enable:</span>
              <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                <li>Configure your video generation model in Google Cloud / AI Studio.</li>
                <li>Add your authorized API secret in Settings &gt; Secrets.</li>
                <li>Review compute costs and confirm video quotas.</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
