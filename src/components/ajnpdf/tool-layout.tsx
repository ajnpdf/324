"use client";

import Link from 'next/link';
import { ChevronLeft, Monitor, Server } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { LogoAnimation } from '@/components/landing/logo-animation';

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  category?: string;
  icon?: string | React.ReactNode;
  processingMode?: 'browser' | 'temporary-server';
}

export function ToolLayout({ children, title, description, category = 'PDF tool', icon = '📄', processingMode = 'browser' }: ToolLayoutProps) {
  const ModeIcon = processingMode === 'browser' ? Monitor : Server;
  const reduceMotion = useReducedMotion();
  return (
    <div className="ajn-page-shell min-h-screen text-slate-950">
      <header className="ajn-tool-header sticky top-0 z-[100] border-b backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-2 px-4 md:h-[72px] md:px-8">
          <Link href="/" aria-label="AJN PDF home"><LogoAnimation className="h-9 w-[140px] md:h-10 md:w-[152px]" /></Link>
          <div className="flex items-center gap-2">
            <span className="ajn-soft-chip hidden sm:inline-flex">{category}</span>
            <span className={`ajn-processing-chip ${processingMode === 'browser' ? 'is-browser' : 'is-server'}`}><ModeIcon className="h-3.5 w-3.5" /><span className="hidden xs:inline">{processingMode === 'browser' ? 'Browser processing' : 'Temporary server'}</span></span>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-28 pt-8 md:px-8 md:py-16">
        <Link href="/pdf-tools" className="relative z-10 inline-flex items-center gap-2 text-xs font-black text-slate-500 transition hover:text-blue-700"><ChevronLeft className="h-4 w-4" />Back to public tools</Link>
        <motion.div initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="ajn-tool-hero-icon flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl">{icon}</div>
          <div><h1 className="text-4xl font-black tracking-[-.045em] text-slate-950 md:text-6xl">{title}</h1><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 md:text-base">{description}</p></div>
        </motion.div>
        <div className="ajn-liquid-card relative z-10 mt-8 rounded-2xl p-3.5 md:mt-10 md:p-6">{children}</div>
      </main>
    </div>
  );
}
