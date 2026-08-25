"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers3, Search } from 'lucide-react';
import { Navbar } from '../components/landing/navbar';
import Hero from '../components/landing/hero';
import { ServicesGrid } from '../components/landing/services-grid';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { ADSENSE_SLOTS } from '../lib/ad-slots';
import { sendAjnAnalytics } from '../components/analytics/site-analytics';
import { useLanguage } from '@/lib/i18n/language-context';

const ProductEcosystem = dynamic(() => import('../components/landing/product-ecosystem').then((module) => module.ProductEcosystem));
const HowItWorks = dynamic(() => import('../components/landing/how-it-works').then((module) => module.HowItWorks));
const TrustSecurity = dynamic(() => import('../components/landing/trust-security').then((module) => module.TrustSecurity));
const FAQSection = dynamic(() => import('../components/landing/faq-section').then((module) => module.FAQSection));
const MainFooter = dynamic(() => import('../components/landing/main-footer').then((module) => module.MainFooter));
const AdSenseUnit = dynamic(() => import('../components/adsense-unit').then((module) => module.AdSenseUnit), { ssr: false });

const categories = [
  { id: 'all', label: 'All PDF Tools' },
  { id: 'edit', label: 'Edit & Sign' },
  { id: 'organize', label: 'Organize' },
  { id: 'security', label: 'Security' },
] as const;

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
    <div className="ajn-page-shell bg-white">
      <Navbar />
      <main>
        <Hero />

        <section
          className="relative mx-auto max-w-7xl scroll-mt-[72px] px-4 pb-12 pt-5 md:px-8 md:pb-20 md:pt-8"
          id="public-tools"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[.16em] text-blue-700">
                <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
                PDF toolkit
              </div>
              <h2 className="mt-2 text-[1.85rem] font-black leading-tight tracking-[-.045em] text-slate-950 md:text-4xl">
                Find the right PDF tool.
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                Search by task or filter by workflow. Every tool opens in a focused workspace.
              </p>
            </div>
            <p className="max-w-sm text-xs font-semibold leading-5 text-slate-500 sm:text-right">
              Built for desktop and mobile with keyboard-friendly controls and clear processing states.
            </p>
          </div>

          <div
            data-ajn-home-search="primary"
            className="sticky top-[64px] z-30 -mx-4 border-y border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] backdrop-blur-xl md:static md:mx-0 md:mt-6 md:rounded-2xl md:border md:p-3.5 md:shadow-[0_10px_30px_rgba(15,23,42,.055)]"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <label htmlFor="home-tool-search" className="sr-only">{t('nav.searchLabel')}</label>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-700" />
                <Input
                  id="home-tool-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search PDF tools — merge, compress, sign, protect…"
                  enterKeyHint="search"
                  autoComplete="off"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm font-semibold text-slate-950 shadow-none transition focus:bg-white focus-visible:ring-blue-500/25"
                />
              </div>
              <div
                className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                aria-label="Filter PDF tools"
              >
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category.id}
                    onClick={() => chooseCategory(category.id)}
                    aria-pressed={activeCategory === category.id}
                    className={cn(
                      'min-h-10 shrink-0 rounded-xl border px-3.5 py-2 text-[10px] font-black transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
                      activeCategory === category.id
                        ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800',
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 md:mt-9">
            <ServicesGrid query={search} category={activeCategory} />
          </div>
        </section>

        <AdSenseUnit
          slot={ADSENSE_SLOTS.homePrimary}
          width={400}
          height={80}
          className="ajn-ad-zone my-8 min-h-[80px] md:my-12"
          label={t('common.advertisement')}
        />
        <ProductEcosystem />
        <HowItWorks />
        <AdSenseUnit
          slot={ADSENSE_SLOTS.homeSecondary}
          width={300}
          height={150}
          className="ajn-ad-zone my-8 min-h-[150px] md:my-12"
          label={t('common.advertisement')}
        />
        <TrustSecurity />
        <FAQSection />
        <MainFooter />
      </main>
    </div>
  );
}
