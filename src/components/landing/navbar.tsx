"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { Button } from '../ui/button';
import { SearchModal } from '../search-modal';
import { ThemeToggle } from '../theme/theme-toggle';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

const links = [
  { key: 'common.home', href: '/' },
  { key: 'common.allTools', href: '/pdf-tools' },
  { key: 'common.conversion', href: '/conversion-tools' },
  { key: 'common.image', href: '/image-tools' },
  { key: 'common.pdf', href: '/pdf-utilities' },
  { key: 'common.discover', href: '/discover' },
  { key: 'common.howItWorks', href: '/transparency' },
  { key: 'common.guides', href: '/blog' },
  { key: 'common.about', href: '/about' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-[100] transition-all duration-300', scrolled || mobileOpen ? 'border-b border-slate-200/80 bg-white/90 shadow-[0_12px_40px_rgba(15,23,42,.08)] backdrop-blur-2xl dark:border-slate-800/90 dark:bg-slate-950/90 dark:shadow-[0_12px_40px_rgba(0,0,0,.32)]' : 'bg-white/62 backdrop-blur-xl dark:bg-slate-950/62')}>
        <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-3 px-4 md:h-[72px] md:px-6 xl:px-8">
          <Link href="/" className="flex items-center" aria-label="AJN PDF home" data-analytics-id="nav-logo">
            <LogoAnimation className="h-9 w-[138px] md:h-11 md:w-[166px]" />
          </Link>

          <nav className="hidden min-w-0 items-center gap-[clamp(.65rem,1.1vw,1.25rem)] xl:flex" aria-label={t('nav.primary')}>
            {links.map((link) => (
              <Link key={link.href} href={link.href} data-analytics-id={`nav-${link.key.replace(/\./g, '-')}`} className="whitespace-nowrap text-[11px] font-extrabold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-300 xl:text-[12px]">
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Button type="button" variant="ghost" size="icon" aria-label={t('nav.searchLabel')} data-analytics-id="nav-search" onClick={() => setSearchOpen(true)} className="h-10 w-10 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"><Search className="h-[18px] w-[18px]" /></Button>
            <LanguageSwitcher compact className="hidden sm:inline-flex" />
            <ThemeToggle />
            <Link href="/pdf-tools" className="hidden lg:block" data-analytics-id="nav-explore-tools"><Button className="h-10 rounded-xl bg-blue-600 px-5 text-[11px] font-black text-white shadow-[0_12px_28px_rgba(37,99,235,.24)] transition hover:-translate-y-0.5 hover:bg-blue-700">{t('home.explore')}</Button></Link>
            <Button type="button" variant="ghost" size="icon" aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className="h-10 w-10 rounded-xl xl:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} className="overflow-hidden border-t border-slate-200/70 bg-white dark:border-slate-800 dark:bg-slate-950 xl:hidden">
              <nav className="mx-auto grid max-w-7xl gap-1.5 px-4 py-4" aria-label={t('nav.mobile')}>
                <div className="mb-2 flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-2 py-1 dark:border-slate-800 dark:bg-slate-900/80 sm:hidden"><span className="pl-2 text-xs font-black text-slate-500 dark:text-slate-400">{t('common.language')}</span><LanguageSwitcher /></div>
                {links.map((link) => (
                  <Link key={link.href} href={link.href} data-analytics-id={`mobile-nav-${link.key.replace(/\./g, '-')}`} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-blue-300">
                    {t(link.key)}<ArrowRight className="h-4 w-4" />
                  </Link>
                ))}
                <Link href="/pdf-tools" onClick={() => setMobileOpen(false)} className="mt-2" data-analytics-id="mobile-open-all-tools"><Button className="h-12 w-full rounded-2xl bg-blue-600 font-black text-white">{t('common.openAllTools')}</Button></Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
