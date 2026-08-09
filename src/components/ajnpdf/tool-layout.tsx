"use client";

import Link from 'next/link';
import { ChevronLeft, Monitor, Server } from 'lucide-react';
import { motion } from 'framer-motion';
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
  return (
    <div className="ajn-page-shell min-h-screen text-slate-950">
      <header className="sticky top-0 z-[100] border-b border-slate-200/80 bg-white/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" aria-label="AJN PDF home"><LogoAnimation className="h-10 w-[152px]" /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-black text-slate-600 sm:inline-flex">{category}</span>
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black ${processingMode === 'browser' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}><ModeIcon className="h-3.5 w-3.5" />{processingMode === 'browser' ? 'Browser processing' : 'Temporary server'}</span>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-10 md:px-8 md:py-16">
        <Link href="/pdf-tools" className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-blue-700"><ChevronLeft className="h-4 w-4" />Back to public tools</Link>
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 via-blue-600 to-emerald-500 text-3xl text-white shadow-[0_18px_42px_rgba(37,99,235,.24)]">{icon}</div>
          <div><h1 className="text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">{title}</h1><p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 md:text-base">{description}</p></div>
        </motion.div>
        <div className="ajn-glass-card mt-10 rounded-[2rem] p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
