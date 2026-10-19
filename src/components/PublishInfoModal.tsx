import React from 'react';
import { X, Globe, Sparkles, Key, CheckCircle2, Shield, ArrowRight, ExternalLink } from 'lucide-react';

interface PublishInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PublishInfoModal: React.FC<PublishInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#050814] border border-cyan-500/40 p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.35)] text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-sky-500 p-[1px] shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              <div className="w-full h-full rounded-[15px] bg-[#070d1c] flex items-center justify-center">
                <Globe className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>Free Publishing & Deployment Guide</span>
              </h2>
              <p className="text-xs text-slate-400">
                Step-by-step instructions to host Nova AI online without recurring costs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-cyan-950/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Step 1: AI Studio One-Click Share */}
          <div className="p-4 rounded-2xl bg-[#070e1e] border border-cyan-500/25 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-cyan-300">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center text-xs font-mono text-cyan-300">
                1
              </span>
              <span>Publish Directly via Google AI Studio (Instant & Free)</span>
            </div>
            <p className="text-xs text-slate-400">
              Your applet is hosted on Google Cloud Run. If your AI Studio account has sharing enabled:
            </p>
            <ul className="text-xs space-y-1.5 list-disc pl-5 text-slate-300">
              <li>Click the <strong className="text-cyan-300">Share</strong> button in the top right corner of the AI Studio workspace.</li>
              <li>Toggle public or unlisted sharing to generate a live shareable URL (e.g. <code className="text-cyan-300 bg-cyan-950/80 px-1 py-0.5 rounded">ais-pre-...run.app</code>).</li>
              <li>Your server-side secret <code className="text-cyan-300 bg-cyan-950/80 px-1 py-0.5 rounded">GEMINI_API_KEY</code> is safely managed in the Cloud environment without exposing it to visitors.</li>
            </ul>
          </div>

          {/* Step 2: Free Gemini API Key */}
          <div className="p-4 rounded-2xl bg-[#070e1e] border border-cyan-500/25 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-sky-300">
              <span className="w-6 h-6 rounded-full bg-sky-950 border border-sky-400/50 flex items-center justify-center text-xs font-mono text-sky-300">
                2
              </span>
              <span>Gemini 3.8 Flash Free-Tier Eligibility</span>
            </div>
            <p className="text-xs text-slate-400">
              Google provides a completely free tier for Gemini API models that does not require paid billing:
            </p>
            <ul className="text-xs space-y-1.5 list-disc pl-5 text-slate-300">
              <li>Go to <strong className="text-sky-300">Google AI Studio</strong> (aistudio.google.com).</li>
              <li>Generate an API key under <strong className="text-sky-300">Get API key</strong>.</li>
              <li>The free tier includes up to 15 RPM (requests per minute) and 1 million TPM for personal projects without entering a credit card.</li>
              <li>Ensure you keep the key in your hosting environment variables as <code className="text-sky-300 bg-sky-950/80 px-1 py-0.5 rounded">GEMINI_API_KEY</code>.</li>
            </ul>
          </div>

          {/* Step 3: Self-Hosting on Free Web Platforms */}
          <div className="p-4 rounded-2xl bg-[#070e1e] border border-cyan-500/25 space-y-2.5">
            <div className="flex items-center gap-2 font-semibold text-blue-300">
              <span className="w-6 h-6 rounded-full bg-blue-950 border border-blue-400/50 flex items-center justify-center text-xs font-mono text-blue-300">
                3
              </span>
              <span>Publishing to Render / Railway / Vercel Free Tiers</span>
            </div>
            <p className="text-xs text-slate-400">
              If you wish to host on your own domain or external provider for free:
            </p>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="p-2.5 rounded-xl bg-[#040813] border border-cyan-500/15">
                <span className="font-semibold text-slate-200 block mb-1">Option A: Render Web Service (Free Tier)</span>
                <span>Push this code to GitHub, connect to Render.com, set Build Command to <code className="text-cyan-300 bg-black/60 px-1 py-0.5 rounded">npm run build</code>, Start Command to <code className="text-cyan-300 bg-black/60 px-1 py-0.5 rounded">npm start</code>, and add the <code className="text-cyan-300 bg-black/60 px-1 py-0.5 rounded">GEMINI_API_KEY</code> environment variable.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#040813] border border-cyan-500/15">
                <span className="font-semibold text-slate-200 block mb-1">Option B: Google Cloud Run (Free Tier)</span>
                <span>Cloud Run includes 2 million free requests per month, which easily covers personal chatbot usage without activating paid commitments.</span>
              </div>
            </div>
          </div>

          {/* Important Security Notice */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-3">
            <Shield className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <p className="text-xs text-cyan-200">
              <strong>Security Guaranteed:</strong> Nova AI uses a server-side proxy route (<code className="text-cyan-300">/api/chat</code>). Your API key is never bundled into the client JavaScript bundle.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-cyan-500/20 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-sky-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
