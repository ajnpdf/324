"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import { Navbar } from '../components/landing/navbar';
import Hero from '../components/landing/hero';
import { ServicesGrid } from '../components/landing/services-grid';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { ADSENSE_SLOTS } from '../lib/ad-slots';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { sendAjnAnalytics } from '../components/analytics/site-analytics';
import { useLanguage } from '@/lib/i18n/language-context';

const FeatureShowcase = dynamic(() => import('../components/landing/feature-showcase').then((module) => module.FeatureShowcase));
const ChromeExtensionPromo = dynamic(() => import('../components/landing/chrome-extension-promo').then((module) => module.ChromeExtensionPromo));
const HowItWorks = dynamic(() => import('../components/landing/how-it-works').then((module) => module.HowItWorks));
const TrustSecurity = dynamic(() => import('../components/landing/trust-security').then((module) => module.TrustSecurity));
const FAQSection = dynamic(() => import('../components/landing/faq-section').then((module) => module.FAQSection));
const MainFooter = dynamic(() => import('../components/landing/main-footer').then((module) => module.MainFooter));
const AdSenseUnit = dynamic(() => import('../components/adsense-unit').then((module) => module.AdSenseUnit), { ssr: false });

const categories = [
  { id: 'all', key: 'filters.all' },
  { id: 'conversion', key: 'filters.conversion' },
  { id: 'image', key: 'filters.image' },
  { id: 'pdf', key: 'filters.pdf' },
  { id: 'ocr', key: 'filters.ocr' },
  { id: 'edit', key: 'filters.edit' },
  { id: 'organize', key: 'filters.organize' },
  { id: 'security', key: 'filters.security' },
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
        <Hero />

        <section className="relative mx-auto max-w-7xl scroll-mt-[72px] px-4 pb-10 pt-4 md:px-8 md:pb-20 md:pt-12" id="public-tools">
          <div className="border-b border-slate-200 pb-4 md:pb-7">
            <span className="ajn-section-kicker hidden md:inline-flex">{t('home.directoryKicker')}</span>
            <div className="mt-0 flex items-end justify-between gap-4 md:mt-5">
              <div className="max-w-3xl">
                <h2 className="text-[1.65rem] font-black leading-tight tracking-[-.045em] text-slate-950 md:text-5xl">{t('home.chooseTool')}</h2>
                <p className="mt-3 hidden text-sm font-medium leading-6 text-slate-600 md:block">{t('home.directoryDesc')}</p>
              </div>
              <span className="shrink-0 text-[11px] font-black text-blue-700">{BUILD_PUBLIC_TOOLS.length} {t('common.available')}</span>
            </div>
          </div>

          <div data-ajn-home-search="primary" className="sticky top-[64px] z-30 -mx-4 border-b border-slate-200/80 bg-white/[0.97] px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] backdrop-blur-xl md:static md:mx-0 md:mt-6 md:rounded-2xl md:border md:px-4 md:shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <label htmlFor="home-tool-search" className="sr-only">{t('nav.searchLabel')}</label>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-700" />
                <Input
                  id="home-tool-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('common.searchTools')}
                  enterKeyHint="search"
                  autoComplete="off"
                  className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-3 text-sm font-semibold text-slate-950 shadow-sm focus-visible:ring-blue-500/30 md:h-12"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t('home.filterAria')}>
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => chooseCategory(category.id)}
                    aria-pressed={activeCategory === category.id}
                    className={cn(
                      'min-h-10 shrink-0 rounded-xl border px-3.5 py-2 text-[10px] font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',
                      activeCategory === category.id
                        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800',
                    )}
                  >
                    {t(category.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 md:mt-8"><ServicesGrid query={search} category={activeCategory} /></div>
        </section>

        <AdSenseUnit slot={ADSENSE_SLOTS.homePrimary} width={400} height={80} className="ajn-ad-zone my-8 min-h-[80px] md:my-12" label={t('common.advertisement')} />
        <ChromeExtensionPromo />
        <HowItWorks />
        <FeatureShowcase />
        <AdSenseUnit slot={ADSENSE_SLOTS.homeSecondary} width={300} height={150} className="ajn-ad-zone my-8 min-h-[150px] md:my-12" label={t('common.advertisement')} />
        <TrustSecurity />
        <FAQSection />
        <MainFooter />
      </main>
    </div>
  );
}
