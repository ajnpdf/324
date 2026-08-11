"use client";
import Link from 'next/link';
import { ArrowRight, Download, FileCheck2, Search, Share2, SlidersHorizontal } from 'lucide-react';
import { ToolArtwork } from '@/components/ajn/tool-artwork';

export function FeatureShowcase() {
  return <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
    <div className="grid overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(37,62,113,.09)] lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[430px] overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 p-6 md:p-10">
        <div className="ajn-r8-showcase-wave" />
        <div className="relative z-10 mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_22px_55px_rgba(37,62,113,.12)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-3"><ToolArtwork toolId="merge-pdf" toolName="Merge PDF" className="h-11 w-11"/><div><p className="text-sm font-black text-slate-950">Merge PDF</p><p className="text-[10px] font-semibold text-slate-500">2 files ready</p></div></div><SlidersHorizontal className="h-4 w-4 text-slate-400"/></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="ajn-r8-file-preview"><span>Project.pdf</span><b>12 pages</b></div><div className="ajn-r8-file-preview"><span>Appendix.pdf</span><b>4 pages</b></div></div>
          <div className="mt-4 h-2 overflow-hidden rounded-md bg-slate-100"><div className="h-full w-4/5 bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500"/></div>
          <div className="mt-4 flex gap-2"><button className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-[11px] font-black text-white"><Download className="h-4 w-4"/>Download</button><button className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-[11px] font-black text-slate-700"><Share2 className="h-4 w-4"/>Share</button></div>
        </div>
      </div>
      <div className="p-6 md:p-10 lg:p-12"><span className="ajn-section-kicker">A workspace that stays out of your way</span><h2 className="mt-5 text-4xl font-black tracking-[-.04em] text-slate-950 md:text-5xl">Everything important, exactly where you expect it.</h2><p className="mt-5 text-base font-medium leading-7 text-slate-600">AJN PDF keeps files, settings, progress and results together so you can finish document work without jumping through unnecessary screens.</p>
        <div className="mt-8 space-y-4">{[
          [Search,'Find the right tool faster','Search by task, filter by category, then choose the layout that feels most comfortable.'],
          [FileCheck2,'Work with confidence','Relevant options, previews and important limits stay close to the file you are working on.'],
          [Share2,'Finish with a clear next step','Download the completed file, share it when available, or start another task immediately.'],
        ].map(([Icon,title,text]) => { const I=Icon as typeof Search; return <div key={String(title)} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm"><I className="h-[18px] w-[18px]"/></span><div><h3 className="text-sm font-black text-slate-950">{String(title)}</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">{String(text)}</p></div></div>})}</div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/pdf-tools" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black text-white">Explore PDF tools <ArrowRight className="h-4 w-4"/></Link><Link href="/conversion-tools" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700">Browse conversions</Link></div>
      </div>
    </div>
  </section>;
}
