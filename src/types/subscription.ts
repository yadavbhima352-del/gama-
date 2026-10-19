export type NovaPlanId = 'starter' | 'pro' | 'ultimate';

export interface PlanConfig {
  id: NovaPlanId;
  name: string;
  badge?: string;
  priceINR: number;
  priceDisplay: string;
  billingPeriod: string;
  chatPerDay: number | 'Unlimited';
  imagesPerDay: number;
  videosPerDay: number;
  features: string[];
  fairUsePolicy?: string;
  recommended?: boolean;
}

export const NOVA_PLANS: Record<NovaPlanId, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    priceINR: 399,
    priceDisplay: '₹399',
    billingPeriod: '/ month',
    chatPerDay: 80,
    imagesPerDay: 11,
    videosPerDay: 0,
    features: [
      '80 chat messages per day',
      '11 AI image generations per day',
      'No video generation',
      'Multilingual auto-detection (Hindi, Hinglish, English)',
      'Document and image vision (PDF, PNG, JPG)',
      'Standard response speeds',
      'Voice input & voice answer playback',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    badge: 'Popular',
    recommended: true,
    priceINR: 1000,
    priceDisplay: '₹1,000',
    billingPeriod: '/ month',
    chatPerDay: 200,
    imagesPerDay: 20,
    videosPerDay: 0,
    features: [
      '200 chat messages per day',
      '20 AI image generations per day',
      'No video generation',
      'Priority model response speed',
      'Full 30+ Image Studio artistic presets',
      'Extended conversation context window',
      'Voice input & voice answer playback',
    ],
  },
  ultimate: {
    id: 'ultimate',
    name: 'Ultimate',
    badge: 'Power User',
    priceINR: 2000,
    priceDisplay: '₹2,000',
    billingPeriod: '/ month',
    chatPerDay: 'Unlimited',
    imagesPerDay: 40,
    videosPerDay: 3,
    fairUsePolicy: 'Unlimited chat is subject to a fair-use limit of 1,000 requests/day to prevent automated abuse and maintain service quality.',
    features: [
      'Unlimited chat messages per day (Fair-use policy applies: 1,000 msgs/day)',
      '40 AI image generations per day',
      '3 video generations per day (Requires approved Video API setup)',
      'Highest priority computing and zero queue',
      'Advanced reasoning & code synthesis',
      'Access to upcoming experimental models',
    ],
  },
};

export interface UserUsageData {
  planId: NovaPlanId;
  dateUTC: string;
  chatUsed: number;
  chatLimit: number | 'Unlimited';
  imagesUsed: number;
  imagesLimit: number;
  videosUsed: number;
  videosLimit: number;
  resetTimeUTC: string;
  isPaymentConfigured: boolean;
}
