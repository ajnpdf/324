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
    { icon: Download, title: t('home.heroFinish'), text: t('home.heroFinishDesc') }];

  return (
    <section data-ajn-home-hero="primary" className="relative overflow-hidden px-3 pb-5 pt-[78px] sm:px-4 md:px-6 md:pb-9 md:pt-24 xl:px-8">
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-7 rounded-[1.4rem] border border-slate-200/90 bg-white p-4 shadow-[0_18px_52px_rgba(37,62,113,.065)] sm:p-5 md:p-7 lg:grid-cols-[1.06fr_.94fr] lg:gap-10 xl:p-9">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-slate-700 md:text-[11px]">
            {valueWords.slice(0, 3).map((word, index) => {
              const Icon = index === 0 ? Sparkles : index === 1 ? Zap : Gauge;
              return <span className="ajn-hero-value-chip" key={word}><Icon className="h-3.5 w-3.5 text-blue-700" /> {word}</span>;
            })}
          </div>
          <h1 className="mt-4 max-w-[900px] text-balance text-[clamp(2.05rem,8.4vw,2.7rem)] font-black leading-[1.04] tracking-[-.043em] text-slate-950 sm:text-[clamp(2.35rem,7vw,3.15rem)] md:mt-5 md:text-[clamp(2.8rem,4.4vw,4rem)] md:leading-[1.015]">
            {t('home.title1')}{t('home.title2') ? <> <span className="text-blue-700">{t('home.title2')}</span></> : null}
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-600 md:mt-5 md:text-[clamp(1rem,1.25vw,1.12rem)] md:leading-7">{t('home.subtitle')}</p>
          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row md:mt-6 md:gap-3">
            <Button asChild className="ajn-primary-action h-11 rounded-xl px-5 text-[11px] font-black md:h-12 md:px-6 md:text-[12px]"><Link href="#public-tools">{t('home.explore100')} <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-11 rounded-xl px-5 text-[11px] font-black md:h-12 md:px-6 md:text-[12px]"><Link href="/merge-pdf"><LayoutGrid className="mr-2 h-4 w-4" />{t('home.startMerge')}</Link></Button>
          </div>
          <p className="mt-3 text-[11px] font-bold leading-5 text-slate-600 md:hidden">{t('home.mobileSearchHint')}</p>
        </div>

        <div className="ajn-workflow-panel relative hidden overflow-hidden rounded-[1.35rem] border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-5 lg:block xl:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-[11px] font-black uppercase tracking-[.12em] text-blue-700">{t('home.heroWorkspaceKicker')}</p><h2 className="mt-1 text-xl font-black tracking-[-.03em] text-slate-950">{t('home.heroWorkspaceTitle')}</h2></div>
            <span className="rounded-xl border border-blue-100 bg-white px-3 py-1.5 text-[10px] font-black text-blue-800">{t('home.heroWorkspaceBadge')}</span>
          </div>
          <div className="ajn-r8-hero-document mt-5">
            <div className="ajn-r8-doc-sheet ajn-r8-doc-back" /><div className="ajn-r8-doc-sheet ajn-r8-doc-mid" />
            <div className="ajn-r8-doc-sheet ajn-r8-doc-front"><span className="ajn-r8-doc-label">PDF</span><span className="ajn-r8-doc-line w-3/4"/><span className="ajn-r8-doc-line w-5/6"/><span className="ajn-r8-doc-line w-2/3"/></div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
            {workflow.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="relative rounded-xl border border-slate-100 bg-white p-3 shadow-[0_8px_22px_rgba(37,62,113,.045)]">
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
