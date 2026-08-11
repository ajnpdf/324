"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '../components/landing/navbar';
import Hero from '../components/landing/hero';
import { ServicesGrid } from '../components/landing/services-grid';
import { cn } from '../lib/utils';
import { Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import { ADSENSE_SLOTS } from '../lib/ad-slots';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { sendAjnAnalytics } from '../components/analytics/site-analytics';
import { useLanguage } from '@/lib/i18n/language-context';
import { PremiumBackground } from '@/components/premium/premium-background';
import { MobileHomeHero } from '@/components/landing/mobile-home-hero';

const FormatStrip = dynamic(() => import('../components/landing/format-strip').then((module) => module.FormatStrip));
const ProcessingArchitecture = dynamic(() => import('../components/landing/live-demo').then((module) => module.LiveDemo));
const ToolCategories = dynamic(() => import('../components/landing/tool-categories').then((module) => module.ToolCategories));
const HowItWorks = dynamic(() => import('../components/landing/how-it-works').then((module) => module.HowItWorks));
const TrustSecurity = dynamic(() => import('../components/landing/trust-security').then((module) => module.TrustSecurity));
const Workflows = dynamic(() => import('../components/landing/social-proof').then((module) => module.SocialProof));
const FAQSection = dynamic(() => import('../components/landing/faq-section').then((module) => module.FAQSection));
const MainFooter = dynamic(() => import('../components/landing/main-footer').then((module) => module.MainFooter));
const AdSenseUnit = dynamic(() => import('../components/adsense-unit').then((module) => module.AdSenseUnit), { ssr: false });

const categories = [
  { id: 'all', key: 'filters.all' },
  { id: 'conversion', key: 'filters.conversion' },
  { id: 'image', key: 'filters.image' },
  { id: 'pdf', key: 'filters.pdf' },
];

export default function HomePage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const normalized = search.trim();
    if (!normalized) return;
    const timer = window.setTimeout(() => {
      const length = normalized.length;
      const queryLengthBucket = length <= 3 ? '1-3' : length <= 7 ? '4-7' : length <= 15 ? '8-15' : '16+';
      sendAjnAnalytics({
        event_name: 'search',
        path: window.location.pathname,
        category: activeCategory,
        query_length_bucket: queryLengthBucket,
        element_id: 'home-tool-search',
      });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [search, activeCategory]);

  const chooseCategory = (category: string) => {
    setActiveCategory(category);
    sendAjnAnalytics({
      event_name: 'category_filter',
      path: window.location.pathname,
      category,
      element_id: `home-category-${category}`,
    });
  };

  return (
    <div className="ajn-page-shell">
      <Navbar />
      <main>
        <MobileHomeHero />
        <div className="hidden md:block">
          <Hero searchValue={search} onSearchChange={setSearch} />
          <FormatStrip />
        </div>

        <section className="relative mx-auto max-w-7xl scroll-mt-[72px] px-4 pb-10 pt-4 md:px-8 md:py-28" id="public-tools">
          <PremiumBackground compact />
          <div className="border-b border-slate-200 pb-3 md:pb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
              <div className="max-w-3xl">
                <span className="ajn-section-kicker hidden md:inline-flex">{t('home.directoryKicker')}</span>
                <h1 className="flex items-baseline justify-between gap-3 text-[1.65rem] font-black leading-tight tracking-[-.045em] text-slate-950 md:hidden">
                  <span>{t('common.tools')}</span>
                  <span className="text-[11px] font-black tracking-normal text-blue-600">{BUILD_PUBLIC_TOOLS.length} {t('common.available')}</span>
                </h1>
                <h2 className="mt-5 hidden text-6xl font-black tracking-[-.04em] text-slate-950 md:block">{t('home.chooseTool')}</h2>
                <p className="mt-4 hidden text-sm font-medium leading-6 text-slate-600 md:block">{t('home.directoryDesc')}</p>
              </div>

              <div className="hidden w-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm md:flex">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => chooseCategory(category.id)}
                    aria-pressed={activeCategory === category.id}
                    className={cn('rounded-xl px-4 py-2.5 text-[11px] font-black transition', activeCategory === category.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300')}
                  >
                    {t(category.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sticky top-[72px] z-30 -mx-4 border-b border-slate-200/80 bg-white/[0.96] px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] backdrop-blur-xl md:hidden">
            <label htmlFor="mobile-home-tool-search" className="sr-only">{t('nav.searchLabel')}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
              <Input
                id="mobile-home-tool-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('common.searchTools')}
                enterKeyHint="search"
                autoComplete="off"
                className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 shadow-sm focus-visible:ring-blue-500/30"
              />
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Filter tools by category">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => chooseCategory(category.id)}
                  aria-pressed={activeCategory === category.id}
                  className={cn('shrink-0 rounded-xl border px-3.5 py-2 text-[10px] font-black transition', activeCategory === category.id ? 'border-blue-600 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300')}
                >
                  {t(category.key)}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 md:mt-10"><ServicesGrid query={search} category={activeCategory} /></div>
        </section>
        <div className="ajn-ad-zone my-8 md:my-12"><AdSenseUnit slot={ADSENSE_SLOTS.homePrimary} width={400} height={80} className="min-h-[80px]" label="Homepage advertisement" /></div>
        <ProcessingArchitecture />
        <ToolCategories />
        <HowItWorks />
        <div className="ajn-ad-zone my-8 md:my-12"><AdSenseUnit slot={ADSENSE_SLOTS.homeSecondary} width={300} height={150} className="min-h-[150px]" label="Homepage content advertisement" /></div>
        <TrustSecurity />
        <Workflows />
        <FAQSection />
        <MainFooter />
      </main>
    </div>
  );
}
