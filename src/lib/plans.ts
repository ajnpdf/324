export type PlanId = 'free' | 'premium' | 'business';

export type PlanDefinition = {
  id: PlanId;
  name: string;
  summary: string;
  features: string[];
  highlighted?: boolean;
};

export const AJN_PLANS: PlanDefinition[] = [
  {
    id: 'free',
    name: 'Free',
    summary: 'Core PDF tools for everyday work.',
    features: ['20 public PDF tools', 'Browser and temporary-server workflows', 'Standard file limits', 'No account required for core tools'],
  },
  {
    id: 'premium',
    name: 'Premium',
    summary: 'Prepaid Premium account access with a verified cross-device entitlement.',
    highlighted: true,
    features: ['30-day or 365-day prepaid access', 'Ad-free experience while signed in', 'Premium account status synced through Firebase', 'No automatic renewal in this release'],
  },
  {
    id: 'business',
    name: 'Business',
    summary: 'Organization billing and API controls are available only by direct arrangement.',
    features: ['Contact AJN for availability', 'No self-serve Business checkout yet', 'No unsupported organization claims'],
  },
];

export const AJN_BILLING_URL = process.env.NEXT_PUBLIC_AJN_BILLING_URL?.trim() || '';
export const AJN_BUZZ_URL = process.env.NEXT_PUBLIC_AJN_BUZZ_URL?.trim() || '';
export const AJN_DESKTOP_DOWNLOAD_URL = process.env.NEXT_PUBLIC_AJN_DESKTOP_DOWNLOAD_URL?.trim() || '';
export const AJN_ANDROID_URL = process.env.NEXT_PUBLIC_AJN_ANDROID_URL?.trim() || '';
export const AJN_IOS_URL = process.env.NEXT_PUBLIC_AJN_IOS_URL?.trim() || '';
