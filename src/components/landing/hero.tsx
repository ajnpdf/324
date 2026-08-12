"use client";

import Link from 'next/link';
import { ArrowRight, Download, FileCheck2, Gauge, LayoutGrid, Sparkles, UploadCloud, WandSparkles, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { useLanguage } from '@/lib/i18n/language-context';

export default function Hero() {
  const { t } = useLanguage();
  const valueWords = t('home.kicker').split('•').map((part) => part.trim()).filter(Boolean);
  const workflow = [
    { icon: UploadCloud, title: t('home.heroChoose'), text: t('home.heroChooseDesc') },
    { icon: WandSparkles, title: t('home.heroAdjust'), text: t('home.heroAdjustDesc') },
    { icon: FileCheck2, title: t('home.heroProcess'), text: t('home.heroProcessDesc') },
    { icon: Download, title: t('home.heroFinish'), text: t('home.heroFinishDesc') },
  ];

  return (
    <section data-ajn-home-hero="primary" className="relative overflow-hidden px-4 pb-6 pt-[82px] md:px-6 md:pb-10 md:pt-28 xl:px-8">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 rounded-[1.55rem] border border-slate-200/80 bg-white p-5 shadow-[0_20px_58px_rgba(37,62,113,.07)] md:p-8 lg:grid-cols-[1.04fr_.96fr] lg:gap-12 xl:p-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-slate-700 md:text-[11px]">
            {valueWords.slice(0, 3).map((word, index) => {
              const Icon = index === 0 ? Sparkles : index === 1 ? Zap : Gauge;
              const tone = index === 0 ? 'text-violet-700' : index === 1 ? 'text-blue-700' : 'text-emerald-700';
              return <span className="ajn-hero-value-chip" key={word}><Icon className={`h-3.5 w-3.5 ${tone}`} /> {word}</span>;
            })}
          </div>
          <h1 className="mt-5 max-w-[820px] text-[clamp(2.2rem,8.5vw,3.2rem)] font-black leading-[.98] tracking-[-.052em] text-slate-950 md:mt-6 md:text-[clamp(3rem,5.8vw,5.2rem)]">
            {t('home.title1')} <span className="text-violet-700">{t('home.title2')}</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-600 md:mt-6 md:text-[clamp(1rem,1.35vw,1.14rem)] md:leading-8">{t('home.subtitle')}</p>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row md:mt-7 md:gap-3">
            <Button asChild className="ajn-primary-action h-11 rounded-xl px-5 text-[11px] font-black md:h-12 md:px-6 md:text-[12px]"><Link href="#public-tools">{t('home.explore100')} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-11 rounded-xl px-5 text-[11px] font-black md:h-12 md:px-6 md:text-[12px]"><Link href="/tools/merge-pdf"><LayoutGrid className="mr-2 h-4 w-4" />{t('home.startMerge')}</Link></Button>
          </div>
          <p className="mt-4 text-[11px] font-bold leading-5 text-slate-600 md:hidden">{t('home.mobileSearchHint')}</p>
        </div>

        <div className="ajn-workflow-panel relative hidden overflow-hidden rounded-[1.45rem] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-blue-50/70 p-6 lg:block">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[11px] font-black uppercase tracking-[.14em] text-violet-700">{t('home.heroWorkspaceKicker')}</p><h2 className="mt-1 text-xl font-black tracking-[-.03em] text-slate-950">{t('home.heroWorkspaceTitle')}</h2></div>
            <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-800">{t('home.heroWorkspaceBadge')}</span>
          </div>
          <div className="ajn-r8-hero-document mt-6">
            <div className="ajn-r8-doc-sheet ajn-r8-doc-back" /><div className="ajn-r8-doc-sheet ajn-r8-doc-mid" />
            <div className="ajn-r8-doc-sheet ajn-r8-doc-front"><span className="ajn-r8-doc-label">PDF</span><span className="ajn-r8-doc-line w-3/4"/><span className="ajn-r8-doc-line w-5/6"/><span className="ajn-r8-doc-line w-2/3"/></div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {workflow.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="relative rounded-xl border border-white bg-white/95 p-3 shadow-[0_8px_24px_rgba(37,62,113,.05)]">
                <span className="ajn-white-icon-tile mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-blue-700"><Icon className="h-4 w-4" strokeWidth={1.9}/></span>
                <span className="absolute right-3 top-3 text-[10px] font-black text-slate-500">0{index + 1}</span>
                <p className="text-[11px] font-black text-slate-900">{title}</p><p className="mt-1 line-clamp-2 text-[9.5px] font-medium leading-4 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
