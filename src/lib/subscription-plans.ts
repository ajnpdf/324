export const WEB_PLANS = {
  pro_monthly: {
    key: 'pro_monthly',
    title: 'AJN PDF Pro Monthly',
    planId: process.env.RAZORPAY_PLAN_PRO_MONTHLY,
    totalCount: 120,
  },
  pro_yearly: {
    key: 'pro_yearly',
    title: 'AJN PDF Pro Yearly',
    planId: process.env.RAZORPAY_PLAN_PRO_YEARLY,
    totalCount: 10,
  },
} as const;

export type WebPlanKey = keyof typeof WEB_PLANS;

export const PLAY_PRODUCT_IDS = new Set(
  [
    process.env.GOOGLE_PLAY_PRODUCT_MONTHLY || 'ajn_pdf_premium_monthly',
    process.env.GOOGLE_PLAY_PRODUCT_YEARLY || 'ajn_pdf_premium_yearly',
  ].filter(Boolean),
);