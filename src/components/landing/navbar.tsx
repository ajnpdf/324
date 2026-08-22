"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Code2, FileSignature, Images, Laptop, Menu, Search, Smartphone, UserRound, X } from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { Button } from '../ui/button';
import { SearchModal } from '../search-modal';
import { LanguageSwitcher } from '../i18n/language-switcher';
import { useLanguage } from '@/lib/i18n/language-context';
import { toolPath } from '@/lib/tool-routes';
import { cn } from '@/lib/utils';
import { AllToolsMenu } from './all-tools-menu';
import { useAuth } from '@/lib/auth-context';

const quickTools = [
  { id: 'merge-pdf', fallback: 'Merge' },
  { id: 'compress-pdf', fallback: 'Compress' },
  { id: 'split-pdf', fallback: 'Split' },
  { id: 'add-text', fallback: 'Edit' },
  { id: 'sign-pdf', fallback: 'Sign' },
] as const;

const products = [
  { label: 'AJN Desktop', href: '/desktop', icon: Laptop },
  { label: 'AJN Mobile', href: '/mobile', icon: Smartphone },
  { label: 'AJN Sign', href: '/sign', icon: FileSignature },
  { label: 'AJN API', href: '/developers', icon: Code2 },
  { label: 'AJN IMG', href: '/img', icon: Images },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const { t, tool: localizeTool } = useLanguage();
  const auth = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  return (
    <>
      <header className={cn('fixed inset-x-0 top-0 z-[100] border-b transition-all duration-150', scrolled || mobileOpen ? 'border-slate-200 bg-white/95 shadow-[0_8px_28px_rgba(15,23,42,.06)] backdrop-blur-xl' : 'border-slate-200/70 bg-white/92 backdrop-blur-lg')}>
        <div className="mx-auto flex h-[64px] w-full max-w-[1540px] items-center gap-2 px-3 sm:px-4 md:h-[68px] min-[1080px]:px-5 xl:px-6">
          <Link href="/" className="mr-2 flex shrink-0 items-center" aria-label="AJN PDF home" data-analytics-id="nav-logo"><LogoAnimation className="h-9 w-[126px] sm:w-[132px] md:h-10 md:w-[144px]" /></Link>

          <nav className="hidden min-w-0 flex-1 items-center gap-0.5 min-[1080px]:flex" aria-label={t('nav.primary')}>
            <Link href="/pdf-tools" className="inline-flex h-10 items-center rounded-xl px-3 text-[12px] font-extrabold text-slate-700 transition hover:bg-violet-50 hover:text-violet-700">PDF Tools</Link>
            {quickTools.map(({ id, fallback }) => { const localized = localizeTool(id, fallback, '', []); return <Link key={id} href={toolPath(id)} className="inline-flex h-10 items-center rounded-xl px-2.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">{localized.name}</Link>; })}
            <Link href="/pricing" className="inline-flex h-10 items-center rounded-xl px-2.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-violet-50 hover:text-violet-700">Pricing</Link>
            <details className="group relative">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-1 rounded-xl px-2.5 text-[11px] font-extrabold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">Products <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180"/></summary>
              <div className="absolute left-0 top-[46px] w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_55px_rgba(15,23,42,.14)]">{products.map(({label,href,icon:Icon})=><Link key={label} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-violet-50 hover:text-violet-800"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-violet-700"><Icon className="h-4 w-4"/></span>{label}</Link>)}</div>
            </details>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
            <AllToolsMenu className="hidden sm:inline-flex" />
            <Button type="button" variant="ghost" size="icon" aria-label={t('nav.searchLabel')} data-analytics-id="nav-search" onClick={() => setSearchOpen(true)} className="h-10 w-10 rounded-xl text-slate-600 hover:bg-violet-50 hover:text-violet-700"><Search className="h-[18px] w-[18px]" /></Button>
            <LanguageSwitcher compact className="hidden xl:inline-flex" />
            {auth.session ? <Link href="/account" className="hidden min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-800 hover:border-violet-200 hover:bg-violet-50 sm:inline-flex"><UserRound className="h-4 w-4 text-violet-700"/>Account</Link> : <><Link href="/login" className="hidden min-h-10 items-center rounded-xl px-3 text-[11px] font-black text-slate-700 hover:bg-slate-50 sm:inline-flex">Log in</Link><Link href="/signup" className="hidden min-h-10 items-center rounded-xl bg-violet-700 px-3.5 text-[11px] font-black text-white shadow-sm hover:bg-violet-800 md:inline-flex">Sign up</Link></>}
            <AllToolsMenu iconOnly className="sm:hidden" />
            <Button type="button" variant="ghost" size="icon" aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.menu')} aria-expanded={mobileOpen} onClick={() => setMobileOpen((value) => !value)} className="h-10 w-10 rounded-xl min-[1080px]:hidden">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</Button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }} className="overflow-hidden border-t border-slate-200 bg-white min-[1080px]:hidden">
              <nav className="mx-auto grid max-h-[calc(100dvh-64px)] max-w-7xl gap-1.5 overflow-y-auto px-3 py-4 sm:px-4" aria-label={t('nav.mobile')}>
                <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3">{quickTools.map(({ id, fallback }) => { const localized = localizeTool(id, fallback, '', []); return <Link key={id} href={toolPath(id)} onClick={() => setMobileOpen(false)} className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center text-[11px] font-black text-slate-800 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700">{localized.name}</Link>; })}</div>
                <div className="my-2 border-t border-slate-200" />
                {[{label:'All PDF Tools',href:'/pdf-tools'},{label:'Pricing',href:'/pricing'},...products].map((item)=><Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm font-extrabold text-slate-700 hover:bg-slate-50 hover:text-slate-950">{item.label}<span aria-hidden="true">›</span></Link>)}
                <div className="my-2 border-t border-slate-200" />
                <Link href={auth.session?'/account':'/login'} onClick={()=>setMobileOpen(false)} className="flex min-h-11 items-center rounded-xl bg-violet-50 px-3 text-sm font-black text-violet-800">{auth.session?'Account':'Log in'}</Link>
                {!auth.session?<Link href="/signup" onClick={()=>setMobileOpen(false)} className="flex min-h-11 items-center rounded-xl bg-violet-700 px-3 text-sm font-black text-white">Create account</Link>:null}
                <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 xl:hidden"><span className="text-xs font-black text-slate-500">{t('common.language')}</span><LanguageSwitcher /></div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
