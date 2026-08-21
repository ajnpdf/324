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
    summary: 'Higher limits and a cleaner cross-device experience.',
    highlighted: true,
    features: ['Higher file and batch limits when supported', 'Ad-free account experience', 'Saved preferences and account access', 'Priority server capacity when available', 'Desktop and mobile entitlement when released'],
  },
  {
    id: 'business',
    name: 'Business',
    summary: 'API and organization features for teams.',
    features: ['Shared billing', 'Higher API allowance', 'Team administration', 'Organization controls', 'Priority support when enabled'],
  },
];

export const AJN_BILLING_URL = process.env.NEXT_PUBLIC_AJN_BILLING_URL?.trim() || '';
export const AJN_BUZZ_URL = process.env.NEXT_PUBLIC_AJN_BUZZ_URL?.trim() || '';
export const AJN_DESKTOP_DOWNLOAD_URL = process.env.NEXT_PUBLIC_AJN_DESKTOP_DOWNLOAD_URL?.trim() || '';
export const AJN_ANDROID_URL = process.env.NEXT_PUBLIC_AJN_ANDROID_URL?.trim() || '';
export const AJN_IOS_URL = process.env.NEXT_PUBLIC_AJN_IOS_URL?.trim() || '';
