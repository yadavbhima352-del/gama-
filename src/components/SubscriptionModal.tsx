import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Shield,
  AlertCircle,
  Clock,
  Info,
  CreditCard,
  Video,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { NovaPlanId, NOVA_PLANS, UserUsageData } from '../types/subscription';
import { NovaLogo } from './NovaLogo';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: NovaPlanId;
  usageData: UserUsageData;
  onSelectPlan: (planId: NovaPlanId) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlanId,
  usageData,
  onSelectPlan,
}) => {
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<NovaPlanId | null>(null);
  const [showCheckoutNotice, setShowCheckoutNotice] = useState(false);

  if (!isOpen) return null;

  const plans = Object.values(NOVA_PLANS);

  const handleStartCheckout = (planId: NovaPlanId) => {
    setSelectedPlanForCheckout(planId);
    setShowCheckoutNotice(true);
  };

  const handleConfirmPlanSwitch = (planId: NovaPlanId) => {
    onSelectPlan(planId);
    setShowCheckoutNotice(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#0a101d] border border-cyan-500/30 p-5 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-10 cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-xl mx-auto mb-8 pt-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-semibold mb-3">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Nova AI Subscription Plans</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Transparent Pricing for High-Performance AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Choose a plan tailored to your workflow. Daily quotas reset every 24 hours at 00:00 UTC.
          </p>
        </div>

        {/* Current Usage Stats Bar */}
        <div className="mb-8 p-4 rounded-2xl bg-[#0f172a] border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
            <div className="p-2 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
              <MessageSquare size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Daily Chat Usage</span>
              <span className="font-bold text-white text-sm">
                {usageData.chatUsed} / {usageData.chatLimit}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
            <div className="p-2 rounded-lg bg-sky-950/80 text-sky-400 border border-sky-500/30">
              <ImageIcon size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Daily Images</span>
              <span className="font-bold text-white text-sm">
                {usageData.imagesUsed} / {usageData.imagesLimit}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
            <div className="p-2 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-500/30">
              <Video size={16} />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block">Daily Videos</span>
              <span className="font-bold text-white text-sm">
                {usageData.videosUsed} / {usageData.videosLimit}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {plans.map((plan) => {
            const isCurrent = currentPlanId === plan.id;
            const isRec = plan.recommended;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-5 sm:p-6 flex flex-col justify-between border transition-all ${
                  isRec
                    ? 'bg-gradient-to-b from-[#0e1a33] to-[#070d1a] border-cyan-400/50 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
                    : 'bg-[#0b1222]/80 border-white/10 hover:border-white/20'
                }`}
              >
                {/* Badge if any */}
                {plan.badge && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white">{plan.priceDisplay}</span>
                    <span className="text-xs text-slate-400 ml-1">{plan.billingPeriod}</span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5 py-3 border-y border-white/10 text-xs font-medium text-cyan-200">
                    <div>💬 {plan.chatPerDay} chats/day</div>
                    <div>🎨 {plan.imagesPerDay} images/day</div>
                    <div>🎥 {plan.videosPerDay > 0 ? `${plan.videosPerDay} videos/day*` : 'No video generation'}</div>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-2 text-xs text-slate-300 my-4">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={13} className="text-cyan-400 mt-0.5 flex-shrink-0" />
                        <span className="leading-tight">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.fairUsePolicy && (
                    <p className="text-[10px] text-slate-400 italic mb-4 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                      * {plan.fairUsePolicy}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  {isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-center text-xs font-bold text-cyan-300">
                      Current Active Plan
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleStartCheckout(plan.id)}
                      className={`w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        isRec
                          ? 'bg-gradient-to-r from-cyan-500 to-sky-400 hover:from-cyan-400 hover:to-sky-300 text-slate-950 shadow-[0_0_15px_rgba(34,211,238,0.35)]'
                          : 'bg-white/10 hover:bg-white/20 text-white'
                      }`}
                    >
                      Select {plan.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Integration Ready Payment Notice */}
        <div className="mt-8 p-4 rounded-2xl bg-[#070c18] border border-cyan-500/20 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Shield size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200 block">
                Payment Security & Integration Status
              </span>
              <span>
                To protect users, card transactions and UPI payments remain in Integration-Ready mode until the project owner attaches verified payment gateway credentials (Razorpay/Stripe).
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Modal Confirmation / Test Mode Activation */}
        {showCheckoutNotice && selectedPlanForCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="w-full max-w-md rounded-2xl bg-[#0c1424] border border-cyan-400/50 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">
                    Upgrade to {NOVA_PLANS[selectedPlanForCheckout].name}
                  </h4>
                  <span className="text-xs text-cyan-300">
                    {NOVA_PLANS[selectedPlanForCheckout].priceDisplay} / month
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 text-xs text-slate-300 mb-5">
                <div className="flex justify-between">
                  <span>Chat limit:</span>
                  <span className="font-bold text-white">
                    {NOVA_PLANS[selectedPlanForCheckout].chatPerDay} / day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Image limit:</span>
                  <span className="font-bold text-white">
                    {NOVA_PLANS[selectedPlanForCheckout].imagesPerDay} / day
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Video limit:</span>
                  <span className="font-bold text-white">
                    {NOVA_PLANS[selectedPlanForCheckout].videosPerDay} / day
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 text-cyan-200">
                  <span>Quota reset:</span>
                  <span>Every day at 00:00 UTC</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs mb-5">
                <strong>Integration Note:</strong> Live billing gateway is currently in Test / Setup mode. Activating will assign this plan’s server-side quotas to your session for testing.
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCheckoutNotice(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmPlanSwitch(selectedPlanForCheckout)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-sky-400 text-slate-950 shadow-md hover:brightness-110 transition-all cursor-pointer"
                >
                  Confirm & Activate Plan
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
