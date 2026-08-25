"use client";

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Search,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const trustPoints = [
  { icon: Zap, label: 'Fast everyday PDF workflows' },
  { icon: ShieldCheck, label: 'Clear processing disclosures' },
  { icon: FileCheck2, label: 'Core tools work without an account' },
] as const;

const quickStarts = [
  { label: 'Merge PDFs', href: '/merge-pdf', hint: 'Combine files in order' },
  { label: 'Compress PDF', href: '/compress-pdf', hint: 'Reduce PDF size' },
  { label: 'Sign PDF', href: '/sign-pdf', hint: 'Add your signature' },
] as const;

export default function Hero() {
  return (
    <section
      data-ajn-home-hero="primary"
      className="relative overflow-hidden px-4 pb-5 pt-[86px] sm:px-5 md:pb-8 md:pt-[108px]"
    >
      <div className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,.08)]">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-8 h-64 w-64 rounded-full bg-emerald-100/60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-red-100/50 blur-3xl" />

        <div className="relative grid gap-9 px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)] lg:items-center lg:gap-12 lg:px-12 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.14em] text-blue-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Free Online PDF Tools
            </div>

            <h1 className="mt-5 max-w-4xl text-balance text-[clamp(2.55rem,7vw,5rem)] font-black leading-[.96] tracking-[-.06em] text-slate-950">
              PDF work,
              <span className="block text-blue-700">made clear and fast.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600 sm:text-base md:text-lg md:leading-8">
              Merge, split, compress, edit, organize, sign and protect PDF files online. Repair tools are also available when a PDF structure needs recovery.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="#public-tools"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.22)] transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[0_16px_34px_rgba(37,99,235,.26)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <Search className="h-4 w-4" aria-hidden="true" />
                Choose a PDF tool
              </Link>
              <Link
                href="/merge-pdf"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-800 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Start with Merge PDF
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
              {trustPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-3 shadow-[0_4px_14px_rgba(15,23,42,.035)] backdrop-blur-sm">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <span className="text-[10.5px] font-bold leading-4 text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <aside className="relative rounded-[1.65rem] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_40px_rgba(15,23,42,.08)] backdrop-blur-sm sm:p-5" aria-label="Popular PDF tools">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.16em] text-blue-700">Start here</p>
                <h2 className="mt-1 text-lg font-black tracking-[-.03em] text-slate-950">Popular PDF tasks</h2>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              {quickStarts.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/60 hover:shadow-[0_10px_24px_rgba(15,23,42,.06)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-[11px] font-black text-white shadow-sm">
                    0{index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-slate-900">{item.label}</span>
                    <span className="mt-0.5 block text-[10.5px] font-semibold text-slate-500">{item.hint}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-700" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
