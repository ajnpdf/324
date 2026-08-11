"use client";

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileCheck2,
  Gauge,
  Monitor,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  WandSparkles,
  Zap,
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PremiumBackground } from '../premium/premium-background';
import { useLanguage } from '@/lib/i18n/language-context';

interface HeroProps { searchValue?: string; onSearchChange?: (value: string) => void; }

export default function Hero({ searchValue = '', onSearchChange }: HeroProps) {
  const { t } = useLanguage();
  const valueWords = t('home.kicker').split('•').map((part) => part.trim());
  const trustItems = [
    { icon: ShieldCheck, title: t('home.trustSimple'), text: t('home.trustBrowserSession') },
    { icon: Monitor, title: t('processing.browser'), text: t('home.trustBrowserSession') },
    { icon: Server, title: t('processing.server'), text: t('home.trustServerTemporary') },
    { icon: CheckCircle2, title: t('footer.noSignup'), text: t('home.trustNoAccount') },
  ];
  const workflow = [
    { icon: UploadCloud, title: t('upload.choose'), text: t('upload.requirements') },
    { icon: WandSparkles, title: t('processing.processing'), text: t('home.trustClear') },
    { icon: FileCheck2, title: t('common.preview'), text: t('common.ready') },
    { icon: Download, title: t('common.download'), text: t('result.ready') },
  ];

  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-28 md:px-6 md:pb-14 md:pt-32 xl:px-8">
      <PremiumBackground />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-9 rounded-[2rem] border border-slate-200/80 bg-white/92 p-6 shadow-[0_24px_70px_rgba(37,62,113,.08)] backdrop-blur-xl md:p-9 lg:grid-cols-[1.03fr_.97fr] lg:gap-12 xl:p-11">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-black text-slate-700">
            <span className="ajn-hero-value-chip"><Sparkles className="h-3.5 w-3.5 text-violet-600" /> {valueWords[0]}</span>
            <span className="ajn-hero-value-chip"><Zap className="h-3.5 w-3.5 text-blue-600" /> {valueWords[1]}</span>
            <span className="ajn-hero-value-chip"><Gauge className="h-3.5 w-3.5 text-emerald-600" /> {valueWords[2]}</span>
          </div>

          <h1 className="mt-6 max-w-[820px] text-[clamp(2.75rem,5.8vw,5.2rem)] font-black leading-[.96] tracking-[-.055em] text-slate-950">
            {t('home.title1')}
            <span className="mt-1 block">{t('home.title2')}</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[clamp(1rem,1.35vw,1.14rem)] font-semibold leading-8 text-slate-600">{t('home.subtitle')}</p>

          <div className="mt-7 max-w-2xl">
            <label htmlFor="home-tool-search" className="sr-only">{t('nav.searchLabel')}</label>
            <div className="relative rounded-2xl border border-slate-200 bg-white p-1.5 shadow-[0_10px_28px_rgba(37,62,113,.07)]">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600" />
              <Input
                id="home-tool-search"
                value={searchValue}
                onChange={(event) => onSearchChange?.(event.target.value)}
                placeholder={t('common.searchTools')}
                className="h-14 rounded-xl border-0 bg-transparent pl-11 pr-4 text-sm font-semibold text-slate-950 shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/20 md:h-[60px] md:text-base"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="ajn-primary-action h-12 rounded-2xl px-6 text-[12px] font-black">
              <Link href="/pdf-tools" data-analytics-id="hero-explore-tools">{t('home.explore')} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-12 rounded-2xl px-6 text-[12px] font-black">
              <Link href="/transparency" data-analytics-id="hero-processing-transparency">{t('home.processing')}</Link>
            </Button>
          </div>
        </div>

        <div className="ajn-workflow-panel relative overflow-hidden rounded-[1.6rem] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-blue-50/70 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.14em] text-violet-600">AJN PDF</p>
              <h2 className="mt-1 text-xl font-black tracking-[-.03em] text-slate-950">{t('home.processing')}</h2>
            </div>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">{t('landing.simpleWorkflow')}</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {workflow.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="relative rounded-2xl border border-white bg-white/90 p-3 shadow-[0_8px_24px_rgba(37,62,113,.05)]">
                <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-blue-600 ring-1 ring-slate-100">
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <span className="absolute right-3 top-3 text-[10px] font-black text-slate-300">0{index + 1}</span>
                <p className="truncate text-[11px] font-black text-slate-900">{title}</p>
                <p className="mt-1 line-clamp-2 text-[9.5px] font-medium leading-4 text-slate-500">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {trustItems.map(({ icon: Icon, title }) => (
              <div key={title} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white/80 px-2.5 py-2 text-[9.5px] font-extrabold text-slate-600">
                <Icon className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                <span className="truncate">{title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
