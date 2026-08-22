import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Crown } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';
import { RazorpayCheckout } from '@/components/billing/razorpay-checkout';
import { AJN_PLANS } from '@/lib/plans';

export const metadata: Metadata = {
  title: { absolute: 'AJN PDF Pricing - Free and Premium Plans' },
  description: 'AJN PDF Free, Premium and Business plans with secure Razorpay billing for Premium access.',
};

function price(name: string) {
  const value = Number(process.env[name] || 0);
  return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
}

export default function PricingPage() {
  const monthlyInr = price('NEXT_PUBLIC_AJN_PREMIUM_30D_INR');
  const yearlyInr = price('NEXT_PUBLIC_AJN_PREMIUM_365D_INR');
  const billingEnabled = process.env.NEXT_PUBLIC_AJN_RAZORPAY_ENABLED === 'true' && monthlyInr > 0 && yearlyInr > 0;

  return <div className="min-h-screen bg-white"><Navbar/><main className="pt-[96px] md:pt-[112px]"><section className="mx-auto max-w-7xl px-4 pb-10 text-center md:px-8"><Crown className="mx-auto h-8 w-8 text-violet-700"/><h1 className="mt-4 text-balance text-4xl font-black tracking-[-.05em] text-slate-950 md:text-6xl">Simple plans for PDF work.</h1><p className="mx-auto mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">Core PDF tools stay free. Premium is prepaid account access for 30 or 365 days. There is no automatic renewal in this release.</p></section><section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 md:grid-cols-3 md:px-8 md:pb-24">{AJN_PLANS.map(plan=><article key={plan.id} className={`relative rounded-[1.6rem] border p-6 shadow-sm ${plan.highlighted?'border-violet-300 bg-violet-50/50 shadow-violet-100':'border-slate-200 bg-white'}`}>{plan.highlighted?<span className="absolute right-4 top-4 rounded-full bg-violet-700 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white">Recommended</span>:null}<h2 className="text-2xl font-black tracking-tight text-slate-950">{plan.name}</h2><p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-600">{plan.summary}</p><ul className="mt-6 space-y-3">{plan.features.map(feature=><li key={feature} className="flex gap-2 text-xs font-semibold leading-5 text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"/>{feature}</li>)}</ul><div className="mt-7">{plan.id==='free'?<Link href="/pdf-tools" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-800">Use Free tools</Link>:plan.id==='premium'?(billingEnabled?<RazorpayCheckout monthlyInr={monthlyInr} yearlyInr={yearlyInr}/>:<span className="flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-4 text-center text-[10px] font-black text-slate-500">Secure Razorpay billing is not configured yet</span>):<Link href="/contact" className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-800">Contact AJN</Link>}</div></article>)}</section></main><MainFooter/></div>;
}
