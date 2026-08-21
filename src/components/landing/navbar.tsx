"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Menu, Search, X } from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { Button } from '../ui/button';
import { SearchModal } from '../search-modal';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { useLanguage } from '@/lib/i18n/language-context';
import { toolPath } from '@/lib/tool-routes';
import { cn } from '@/lib/utils';
import { AllToolsMenu } from './all-tools-menu';

const quickTools = [
  { id: 'merge-pdf', fallback: 'Merge PDF' },
  { id: 'split-pdf', fallback: 'Split PDF' },
  { id: 'compress-pdf', fallback: 'Compress PDF' },
] as const;

const directoryLinks = [
  { label: 'All Tools', href: '/pdf-tools' },
  { label: 'PDF Tools', href: '/pdf-utilities' },
  { label: 'Image Tools', href: '/image-tools' },
] as const;

const infoLinks = [
  ...directoryLinks,
  { label: 'Guides', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Service status', href: '/status' },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { t, tool: localizeTool } = useLanguage();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-[100] border-b transition-all duration-150', scrolled || mobileOpen ? 'border-slate-200 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,.06)] backdrop-blur-xl' : 'border-slate-200/70 bg-white/92 backdrop-blur-lg')}>
        <div className="mx-auto flex h-[64px] w-full max-w-[1500px] items-center gap-2 px-3 sm:px-4 md:h-[68px] min-[1080px]:px-5 xl:px-6">
          <Link href="/" className="mr-2 flex shrink-0 items-center" aria-label="AJN PDF home" data-analytics-id="nav-logo">
            <LogoAnimation className="h-9 w-[126px] sm:w-[132px] md:h-10 md:w-[144px]" />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 min-[1080px]:flex" aria-label={t('nav.primary')}>
            {directoryLinks.map((link) => (
              <Link key={link.href} href={link.href} className="inline-flex h-10 items-center rounded-xl px-3 text-[12px] font-extrabold text-slate-700 transition-colors duration-150 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">{link.label}</Link>
            ))}
            <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden="true" />
            {quickTools.map(({ id, fallback }) => {
              const localized = localizeTool(id, fallback, '', []);
              return <Link key={id} href={toolPath(id)} data-analytics-id={`nav-${id}`} className="inline-flex h-10 items-center rounded-xl px-2.5 text-[11px] font-extrabold text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">{localized.name}</Link>;
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <AllToolsMenu className="hidden sm:inline-flex" />
            <Button type="button" variant="ghost" size="icon" aria-label={t('nav.searchLabel')} data-analytics-id="nav-search" onClick={() => setSearchOpen(true)} className="h-10 w-10 rounded-xl text-slate-600 hover:bg-violet-50 hover:text-violet-700"><Search className="h-[18px] w-[18px]" /></Button>
            <LanguageSwitcher compact className="hidden lg:inline-flex" />
            <AllToolsMenu iconOnly className="sm:hidden" />
            <Button type="button" variant="ghost" size="icon" aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className="h-10 w-10 rounded-xl min-[1080px]:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} className="overflow-hidden border-t border-slate-200 bg-white min-[1080px]:hidden">
              <nav className="mx-auto grid max-h-[calc(100dvh-64px)] max-w-7xl gap-1.5 overflow-y-auto px-3 py-4 sm:px-4" aria-label={t('nav.mobile')}>
                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
                  {quickTools.map(({ id, fallback }) => {
                    const localized = localizeTool(id, fallback, '', []);
                    return <Link key={id} href={toolPath(id)} onClick={() => setMobileOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] font-black text-slate-800 transition-colors duration-150 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">{localized.name}</Link>;
                  })}
                </div>
                <div className="my-2 border-t border-slate-200" />
                {infoLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 hover:text-slate-950">{link.label}<ArrowRight className="h-4 w-4" /></Link>)}
                <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:hidden"><span className="text-xs font-black text-slate-500">{t('common.language')}</span><LanguageSwitcher /></div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
