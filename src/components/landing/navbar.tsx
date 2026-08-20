"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, ChevronDown, Menu, Search, X } from 'lucide-react';
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
];

const convertTo = [
  ['jpg-to-pdf', 'JPG to PDF'],
  ['word-to-pdf', 'Word to PDF'],
  ['excel-to-pdf', 'Excel to PDF'],
  ['powerpoint-to-pdf', 'PowerPoint to PDF'],
  ['html-to-pdf', 'HTML to PDF'],
] as const;

const convertFrom = [
  ['pdf-to-word', 'PDF to Word'],
  ['pdf-to-jpg', 'PDF to JPG'],
  ['pdf-to-excel', 'PDF to Excel'],
  ['pdf-to-powerpoint', 'PDF to PowerPoint'],
  ['pdf-to-png', 'PDF to PNG'],
] as const;

const infoLinks = [
  { key: 'common.allTools', href: '/pdf-tools' },
  { key: 'common.conversion', href: '/conversion-tools' },
  { key: 'common.image', href: '/image-tools' },
  { key: 'common.chromeExtension', href: '/chrome-extension' },
  { key: 'common.guides', href: '/blog' },
  { key: 'common.about', href: '/about' },
];

function ConvertMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      className="relative hidden h-full items-center min-[1180px]:flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        data-analytics-id="nav-convert-menu"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex h-10 items-center gap-1 rounded-xl px-2.5 text-[12px] font-extrabold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
      >
        Convert <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-150', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="menu"
            aria-label="Convert tools"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.14 }}
            className="absolute left-1/2 top-full z-[210] w-[min(540px,calc(100vw-2rem))] -translate-x-1/2 pt-2"
          >
            <div className="grid grid-cols-2 gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_22px_65px_rgba(15,23,42,.16)]">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[.12em] text-slate-500">Convert to PDF</p>
                {convertTo.map(([id, label]) => (
                  <Link key={id} role="menuitem" href={toolPath(id)} onClick={() => setOpen(false)} className="flex min-h-10 items-center justify-between rounded-xl px-3 text-[12px] font-extrabold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                    {label}<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[.12em] text-slate-500">Convert from PDF</p>
                {convertFrom.map(([id, label]) => (
                  <Link key={id} role="menuitem" href={toolPath(id)} onClick={() => setOpen(false)} className="flex min-h-10 items-center justify-between rounded-xl px-3 text-[12px] font-extrabold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                    {label}<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
              <Link role="menuitem" href="/conversion-tools" onClick={() => setOpen(false)} className="col-span-2 flex min-h-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-[11px] font-black text-blue-700 transition-colors duration-150 hover:border-blue-200 hover:bg-blue-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">
                View all converters <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        <div className="mx-auto flex h-[64px] w-full max-w-[1500px] items-center gap-2 px-3 sm:px-4 md:h-[68px] min-[1180px]:px-5 xl:px-6">
          <Link href="/" className="mr-1 flex shrink-0 items-center" aria-label="AJN PDF home" data-analytics-id="nav-logo">
            <LogoAnimation className="h-9 w-[126px] sm:w-[132px] md:h-10 md:w-[144px]" />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center min-[1180px]:flex" aria-label={t('nav.primary')}>
            {quickTools.map(({ id, fallback }) => {
              const localized = localizeTool(id, fallback, '', []);
              return <Link key={id} href={toolPath(id)} data-analytics-id={`nav-${id}`} className="inline-flex h-10 items-center rounded-xl px-2.5 text-[12px] font-extrabold text-slate-700 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 xl:px-3">{localized.name}</Link>;
            })}
            <ConvertMenu />
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <AllToolsMenu className="hidden sm:inline-flex" />
            <Button type="button" variant="ghost" size="icon" aria-label={t('nav.searchLabel')} data-analytics-id="nav-search" onClick={() => setSearchOpen(true)} className="h-10 w-10 rounded-xl text-slate-600 hover:bg-blue-50 hover:text-blue-600"><Search className="h-[18px] w-[18px]" /></Button>
            <LanguageSwitcher compact className="hidden lg:inline-flex" />
            <AllToolsMenu iconOnly className="sm:hidden" />
            <Button type="button" variant="ghost" size="icon" aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className="h-10 w-10 rounded-xl min-[1180px]:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} className="overflow-hidden border-t border-slate-200 bg-white min-[1180px]:hidden">
              <nav className="mx-auto grid max-h-[calc(100dvh-64px)] max-w-7xl gap-1.5 overflow-y-auto px-3 py-4 sm:px-4" aria-label={t('nav.mobile')}>
                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
                  {quickTools.map(({ id, fallback }) => {
                    const localized = localizeTool(id, fallback, '', []);
                    return <Link key={id} href={toolPath(id)} onClick={() => setMobileOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] font-black text-slate-800 transition-colors duration-150 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600">{localized.name}</Link>;
                  })}
                </div>
                <Link href="/conversion-tools" onClick={() => setMobileOpen(false)} className="mt-1 flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-extrabold text-slate-800 hover:bg-blue-50 hover:text-blue-700">Convert PDF <ArrowRight className="h-4 w-4" /></Link>
                <div className="my-2 border-t border-slate-200" />
                {infoLinks.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 hover:text-slate-950">{t(link.key)}<ArrowRight className="h-4 w-4" /></Link>)}
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
