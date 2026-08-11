"use client";

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CheckCircle2, LockKeyhole, Monitor, Search, Server, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PremiumBackground } from '../premium/premium-background';

import { useLanguage } from '@/lib/i18n/language-context';

interface HeroProps { searchValue?: string; onSearchChange?: (value: string) => void; }

export default function Hero({ searchValue = '', onSearchChange }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();
  const enter = (delay = 0) => ({ initial: reduceMotion ? false : { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } });
  const trustItems = [
    { icon: Monitor, title: t('processing.browser'), text: t('home.trustBrowserSession') },
    { icon: Server, title: t('processing.server'), text: t('home.trustServerTemporary') },
    { icon: Trash2, title: t('common.clear'), text: t('home.trustServerCleanup') },
    { icon: CheckCircle2, title: t('footer.noSignup'), text: t('home.trustNoAccount') },
  ];
  return (
    <section className="relative overflow-hidden px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-36 xl:px-8">
      <PremiumBackground />
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 rounded-[2rem] border border-white/70 bg-white/45 p-5 shadow-[0_30px_90px_rgba(26,61,132,.08)] backdrop-blur-sm dark:border-white/5 dark:bg-slate-950/25 md:p-8 lg:grid-cols-[1.02fr_.98fr] lg:gap-12 xl:gap-16 xl:p-10">
        <div className="min-w-0">
          <motion.div {...enter(0)} className="ajn-section-kicker"><Sparkles className="h-3.5 w-3.5 text-red-500" />{t('home.kicker')}</motion.div>
          <motion.h1 {...enter(0.05)} className="mt-6 max-w-3xl text-[clamp(2.75rem,6.4vw,5.6rem)] font-black leading-[.94] tracking-[-.055em] text-slate-950 dark:text-slate-50">
            {t('home.title1')}<span className="mt-1 block"><span className="ajn-gradient-text">{t('home.title2')}</span></span>
          </motion.h1>
          <motion.p {...enter(0.1)} className="mt-6 max-w-2xl text-[clamp(1rem,1.45vw,1.16rem)] font-semibold leading-8 text-slate-600 dark:text-slate-300">{t('home.subtitle')}</motion.p>
          <motion.div {...enter(0.15)} className="mt-7 max-w-2xl">
            <label htmlFor="home-tool-search" className="sr-only">{t('nav.searchLabel')}</label>
            <div className="ajn-glass-card relative rounded-2xl p-2"><Search className="pointer-events-none absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" /><Input id="home-tool-search" value={searchValue} onChange={(event) => onSearchChange?.(event.target.value)} placeholder={t('common.searchTools')} className="h-14 rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm font-semibold text-slate-950 shadow-none focus-visible:ring-2 focus-visible:ring-blue-500/25 dark:text-slate-50 md:h-16 md:text-base" /></div>
          </motion.div>
          <motion.div {...enter(0.2)} className="mt-6 flex flex-col gap-3 sm:flex-row"><Link href="/pdf-tools" data-analytics-id="hero-explore-tools"><Button className="ajn-primary-action h-12 w-full rounded-2xl px-6 text-[12px] font-black sm:w-auto">{t('home.explore')} <ArrowRight className="ml-2 h-4 w-4" /></Button></Link><Link href="/transparency" data-analytics-id="hero-processing-transparency"><Button variant="outline" className="ajn-secondary-action h-12 w-full rounded-2xl px-6 text-[12px] font-black sm:w-auto">{t('home.processing')}</Button></Link></motion.div>
        </div>
        <motion.div initial={reduceMotion ? false : { opacity: 0, scale: .96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: .65, delay: .12 }} className="relative mx-auto w-full max-w-[620px] min-w-0">
          <div className="ajn-visual-stage"><Image src="/images/ajn-product-visual.svg" alt="AJN PDF document processing preview" width={1200} height={800} className="h-auto w-full rounded-[1.75rem]" /><motion.div animate={reduceMotion ? undefined : { y: [0, -7, 0] }} transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }} className="absolute -left-2 top-[37%] hidden h-14 w-14 items-center justify-center rounded-2xl bg-red-600 text-white shadow-[0_18px_35px_rgba(233,35,63,.26)] sm:flex"><LockKeyhole className="h-6 w-6" /></motion.div></div>
        </motion.div>
      </div>
      <motion.div {...enter(0.25)} className="relative mx-auto mt-6 grid w-full max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">{trustItems.map(({ icon: Icon, title, text }) => <div key={title} className="ajn-feature-chip"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"><Icon className="h-4.5 w-4.5" /></div><div className="min-w-0"><p className="text-xs font-black text-slate-900 dark:text-slate-100">{title}</p><p className="mt-1 text-[11px] font-medium leading-5 text-slate-500 dark:text-slate-400">{text}</p></div></div>)}</motion.div>
    </section>
  );
}
