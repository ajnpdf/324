"use client";

import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, LayoutGrid, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';
import { Button } from '../ui/button';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';

const previewFiles = [
  ['Report.pdf', '2.4 MB'],
  ['Proposal.pdf', '1.8 MB'],
  ['Statement.pdf', '1.2 MB'],
] as const;

export default function Hero() {
  return (
    <section data-ajn-home-hero="primary" className="relative overflow-hidden px-3 pb-5 pt-[78px] sm:px-4 md:px-6 md:pb-10 md:pt-24 xl:px-8">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-7 rounded-[1.6rem] border border-slate-200/90 bg-white p-5 shadow-[0_22px_60px_rgba(37,62,113,.08)] sm:p-6 md:p-8 lg:grid-cols-[1.03fr_.97fr] lg:gap-10 xl:p-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-[10px] font-black text-violet-700 md:text-[11px]"><Sparkles className="h-3.5 w-3.5" /> {BUILD_PUBLIC_TOOLS.length} focused tools</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 md:text-[11px]"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> No account required</span>
          </div>

          <h1 className="mt-5 max-w-[780px] text-balance text-[clamp(2.15rem,8vw,2.9rem)] font-black leading-[1.03] tracking-[-.05em] text-slate-950 sm:text-[clamp(2.45rem,7vw,3.3rem)] md:text-[clamp(3rem,4.5vw,4.4rem)]">
            All the PDF tools you need. <span className="text-violet-600">Simple, fast, focused.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-6 text-slate-600 md:text-[1.05rem] md:leading-7">
            Edit, organize, protect, sign, optimize and manage PDFs and images with a smaller set of workflows we are actively maintaining.
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button asChild className="ajn-primary-action h-11 rounded-xl px-5 text-[11px] font-black md:h-12 md:px-6 md:text-[12px]"><Link href="#public-tools">Explore {BUILD_PUBLIC_TOOLS.length} tools <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-11 rounded-xl px-5 text-[11px] font-black md:h-12 md:px-6 md:text-[12px]"><Link href="/merge-pdf"><LayoutGrid className="mr-2 h-4 w-4" />Start with Merge PDF</Link></Button>
          </div>

          <div className="mt-6 grid max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              ['Focused', '27 maintained tools'],
              ['Clear', 'Inputs and results'],
              ['Responsive', 'Mobile to desktop'],
              ['Transparent', 'Browser or online mode'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
                <p className="text-[10px] font-black text-slate-900">{title}</p>
                <p className="mt-1 text-[9.5px] font-semibold leading-4 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute -left-10 top-14 h-44 w-44 rounded-full bg-violet-100/60 blur-3xl" />
          <div className="relative rounded-[1.45rem] border border-slate-200 bg-slate-50/70 p-4 shadow-[0_22px_55px_rgba(37,62,113,.12)] xl:p-5">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700"><FileText className="h-5 w-5" /></span>
                <div><p className="text-sm font-black text-slate-950">Merge PDF</p><p className="text-[10px] font-semibold text-slate-500">Workspace preview</p></div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-black text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Ready</span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[9px] font-black">
              <span className="rounded-lg bg-violet-600 px-2 py-2 text-center text-white">1 Upload</span>
              <span className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-slate-500">2 Arrange</span>
              <span className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-slate-500">3 Download</span>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-violet-200 bg-white p-3">
              {previewFiles.map(([name, size]) => (
                <div key={name} className="flex items-center gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600"><FileText className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-[10.5px] font-black text-slate-900">{name}</p><p className="text-[9px] font-semibold text-slate-400">{size}</p></div>
                  <span className="text-[9px] font-black text-slate-300">PDF</span>
                </div>
              ))}
              <button type="button" tabIndex={-1} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-violet-600 text-[10px] font-black text-white"><UploadCloud className="h-4 w-4" /> Merge selected files</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
