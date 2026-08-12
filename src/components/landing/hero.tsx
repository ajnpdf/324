"use client";
import Link from 'next/link';
import { ArrowRight, Download, FileCheck2, Gauge, LayoutGrid, Search, Sparkles, UploadCloud, WandSparkles, Zap } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useLanguage } from '@/lib/i18n/language-context';

interface HeroProps { searchValue?: string; onSearchChange?: (value: string) => void; }

export default function Hero({ searchValue = '', onSearchChange }: HeroProps) {
  const { t } = useLanguage();
  const valueWords = t('home.kicker').split('•').map((part) => part.trim());
  const workflow = [
    { icon: UploadCloud, title: t('home.heroChoose'), text: t('home.heroChooseDesc') },
    { icon: WandSparkles, title: t('home.heroAdjust'), text: t('home.heroAdjustDesc') },
    { icon: FileCheck2, title: t('home.heroProcess'), text: t('home.heroProcessDesc') },
    { icon: Download, title: t('home.heroFinish'), text: t('home.heroFinishDesc') },
  ];
  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-28 md:px-6 md:pb-14 md:pt-32 xl:px-8">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-9 rounded-[1.7rem] border border-slate-200/80 bg-white/94 p-6 shadow-[0_24px_70px_rgba(37,62,113,.08)] backdrop-blur-xl md:p-9 lg:grid-cols-[1.04fr_.96fr] lg:gap-12 xl:p-11">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-black text-slate-700">
            <span className="ajn-hero-value-chip"><Sparkles className="h-3.5 w-3.5 text-violet-600" /> {valueWords[0]}</span>
            <span className="ajn-hero-value-chip"><Zap className="h-3.5 w-3.5 text-blue-600" /> {valueWords[1]}</span>
            <span className="ajn-hero-value-chip"><Gauge className="h-3.5 w-3.5 text-emerald-600" /> {valueWords[2]}</span>
          </div>
          <h1 className="mt-6 max-w-[820px] text-[clamp(2.75rem,5.8vw,5.2rem)] font-black leading-[.96] tracking-[-.055em] text-slate-950">
            {t('home.title1')}<span className="mt-1 block text-violet-600">{t('home.title2')}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(1rem,1.35vw,1.14rem)] font-semibold leading-8 text-slate-600">{t('home.subtitle')}</p>
          <div className="mt-7 max-w-2xl">
            <label htmlFor="home-tool-search" className="sr-only">{t('nav.searchLabel')}</label>
            <div className="relative rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_10px_28px_rgba(37,62,113,.07)]">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />
              <Input id="home-tool-search" value={searchValue} onChange={(event) => onSearchChange?.(event.target.value)} placeholder={t('common.searchTools')} className="h-14 rounded-xl border-0 bg-transparent pl-11 pr-4 text-sm font-semibold text-slate-950 shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/20 md:h-[60px] md:text-base" />
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="ajn-primary-action h-12 rounded-xl px-6 text-[12px] font-black"><Link href="#public-tools">{t('home.explore100')} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-12 rounded-xl px-6 text-[12px] font-black"><Link href="/tools/merge-pdf"><LayoutGrid className="mr-2 h-4 w-4" />{t('home.startMerge')}</Link></Button>
          </div>
        </div>

        <div className="ajn-workflow-panel relative overflow-hidden rounded-[1.45rem] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-blue-50/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-black uppercase tracking-[.14em] text-violet-600">{t('home.heroWorkspaceKicker')}</p><h2 className="mt-1 text-xl font-black tracking-[-.03em] text-slate-950">{t('home.heroWorkspaceTitle')}</h2></div><span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">{t('home.heroWorkspaceBadge')}</span></div>
          <div className="ajn-r8-hero-document mt-6">
            <div className="ajn-r8-doc-sheet ajn-r8-doc-back" /><div className="ajn-r8-doc-sheet ajn-r8-doc-mid" />
            <div className="ajn-r8-doc-sheet ajn-r8-doc-front"><span className="ajn-r8-doc-label">PDF</span><span className="ajn-r8-doc-line w-3/4"/><span className="ajn-r8-doc-line w-5/6"/><span className="ajn-r8-doc-line w-2/3"/></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {workflow.map(({ icon: Icon, title, text }, index) => <div key={title} className="relative rounded-xl border border-white bg-white/92 p-3 shadow-[0_8px_24px_rgba(37,62,113,.05)]"><span className="ajn-white-icon-tile mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-blue-600"><Icon className="h-4 w-4" strokeWidth={1.9}/></span><span className="absolute right-3 top-3 text-[10px] font-black text-slate-300">0{index+1}</span><p className="text-[11px] font-black text-slate-900">{title}</p><p className="mt-1 line-clamp-2 text-[9.5px] font-medium leading-4 text-slate-500">{text}</p></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}
