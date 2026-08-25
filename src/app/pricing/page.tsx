import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, CheckCircle2, Crown, ShieldCheck, Sparkles } from 'lucide-react';
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

const planAccent: Record<string, { icon: typeof Crown; surface: string; iconClass: string }> = {
  free: {
    icon: BadgeCheck,
    surface: 'border-slate-200 bg-white',
    iconClass: 'border-slate-200 bg-slate-50 text-slate-700',
  },
  premium: {
    icon: Crown,
    surface: 'border-blue-200 bg-blue-50/40 shadow-[0_20px_50px_rgba(37,99,235,.10)]',
    iconClass: 'border-blue-100 bg-blue-600 text-white',
  },
  business: {
    icon: ShieldCheck,
    surface: 'border-slate-200 bg-white',
    iconClass: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  },
};

export default function PricingPage() {
  const monthlyInr = price('NEXT_PUBLIC_AJN_PREMIUM_30D_INR');
  const yearlyInr = price('NEXT_PUBLIC_AJN_PREMIUM_365D_INR');
  const billingEnabled = process.env.NEXT_PUBLIC_AJN_RAZORPAY_ENABLED === 'true' && monthlyInr > 0 && yearlyInr > 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="pt-[88px] md:pt-[104px]">
        <section className="px-4 pb-10 md:px-8 md:pb-14">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-5 py-9 text-center shadow-[0_20px_55px_rgba(15,23,42,.07)] sm:px-8 md:py-12">
            <div aria-hidden="true" className="pointer-events-none absolute -left-20 -top-24 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-10 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />

            <div className="relative">
              <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.15em] text-blue-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Simple, transparent access
              </span>
              <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-black leading-[1.02] tracking-[-.055em] text-slate-950 md:text-6xl">
                Start free. Upgrade when Premium fits your workflow.
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 md:text-base">
                Core PDF tools stay free. Premium is prepaid account access for 30 or 365 days, with no automatic renewal in this release.
              </p>

              <div className="mx-auto mt-7 grid max-w-3xl gap-2.5 text-left sm:grid-cols-3">
                {[
                  'Core tools without an account',
                  'Server-side payment verification',
                  'Clear plan and processing limits',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-3 shadow-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span className="text-[10.5px] font-bold leading-4 text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-4 pb-16 md:grid-cols-3 md:px-8 md:pb-24">
          {AJN_PLANS.map((plan) => {
            const accent = planAccent[plan.id];
            const Icon = accent.icon;

            return (
              <article
                key={plan.id}
                className={`relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border p-5 shadow-[0_8px_24px_rgba(15,23,42,.045)] sm:p-6 ${accent.surface}`}
              >
                {plan.highlighted ? (
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 via-blue-600 to-emerald-500" aria-hidden="true" />
                ) : null}

                <div className="flex items-start justify-between gap-4">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl border shadow-sm ${accent.iconClass}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {plan.highlighted ? (
                    <span className="rounded-full border border-blue-100 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[.12em] text-blue-700 shadow-sm">
                      Recommended
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-5 text-2xl font-black tracking-[-.035em] text-slate-950">{plan.name}</h2>
                <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-600">{plan.summary}</p>

                <div className="my-6 h-px bg-slate-200/80" />

                <ul className="space-y-3.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-xs font-semibold leading-5 text-slate-700">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-7">
                  {plan.id === 'free' ? (
                    <Link
                      href="/pdf-tools"
                      className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                    >
                      Use Free tools
                    </Link>
                  ) : plan.id === 'premium' ? (
                    billingEnabled ? (
                      <RazorpayCheckout monthlyInr={monthlyInr} yearlyInr={yearlyInr} />
                    ) : (
                      <span className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-4 text-center text-[10px] font-black leading-4 text-slate-500">
                        Secure Razorpay billing is not configured yet
                      </span>
                    )
                  ) : (
                    <Link
                      href="/contact"
                      className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-800 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                    >
                      Contact AJN
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
