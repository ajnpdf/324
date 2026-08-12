"use client";
import Link from 'next/link';
import { ArrowRight, Download, FileCheck2, Search, Share2, SlidersHorizontal } from 'lucide-react';
import { ToolArtwork } from '@/components/ajn/tool-artwork';
import { useLanguage } from '@/lib/i18n/language-context';

export function FeatureShowcase() {
  const { t } = useLanguage();
  const benefits = [
    [Search,t('home.showcaseFindTitle'),t('home.showcaseFindDesc')],
    [FileCheck2,t('home.showcaseConfidenceTitle'),t('home.showcaseConfidenceDesc')],
    [Share2,t('home.showcaseFinishTitle'),t('home.showcaseFinishDesc')],
  ] as const;
  return <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
    <div className="grid overflow-hidden rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(37,62,113,.09)] lg:grid-cols-[1.05fr_.95fr]">
      <div className="relative min-h-[430px] overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/45 p-6 md:p-10">
        <div className="relative z-10 mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_22px_55px_rgba(37,62,113,.12)]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-3"><ToolArtwork toolId="merge-pdf" toolName="Merge PDF" className="h-11 w-11"/><div><p className="text-sm font-black text-slate-950">Merge PDF</p><p className="text-[10px] font-semibold text-slate-500">{t('home.showcaseFilesReady')}</p></div></div><SlidersHorizontal className="h-4 w-4 text-slate-500"/></div>
          <div className="mt-4 grid gap-2 sm:grid-cols-2"><div className="ajn-r8-file-preview"><span>Project.pdf</span><b>12 pages</b></div><div className="ajn-r8-file-preview"><span>Appendix.pdf</span><b>4 pages</b></div></div>
          <div className="mt-4 h-2 overflow-hidden rounded-md bg-slate-100"><div className="h-full w-4/5 bg-gradient-to-r from-blue-600 to-emerald-500"/></div>
          <div className="mt-4 flex gap-2"><button type="button" className="flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-slate-950 text-[11px] font-black text-white"><Download className="h-4 w-4"/>{t('common.download')}</button><button type="button" className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-[11px] font-black text-slate-700"><Share2 className="h-4 w-4"/>{t('common.share')}</button></div>
        </div>
      </div>
      <div className="p-6 md:p-10 lg:p-12"><span className="ajn-section-kicker">{t('home.showcaseKicker')}</span><h2 className="mt-5 text-4xl font-black tracking-[-.04em] text-slate-950 md:text-5xl">{t('home.showcaseTitle')}</h2><p className="mt-5 text-base font-medium leading-7 text-slate-600">{t('home.showcaseDesc')}</p>
        <div className="mt-8 space-y-4">{benefits.map(([Icon,title,text]) => <div key={title} className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4"><span className="ajn-white-icon-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-blue-600"><Icon className="h-[18px] w-[18px]"/></span><div><h3 className="text-sm font-black text-slate-950">{title}</h3><p className="mt-1 text-xs font-medium leading-5 text-slate-500">{text}</p></div></div>)}</div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/pdf-tools" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-black text-white">{t('home.explorePdfTools')} <ArrowRight className="h-4 w-4"/></Link><Link href="/conversion-tools" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-700">{t('home.browseConversions')}</Link></div>
      </div>
    </div>
  </section>;
}
