'use client';

import { ToolWorkspace } from '../../../components/junction/unit-workspace';
import { NightSky } from '../../../components/dashboard/night-sky';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Activity, Home, Zap } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { useLanguage } from '../../../lib/i18n/language-context';

/**
 * AJN Tool Box Workspace - Professional Hub
 */
function SectorContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'Document';
  const { t } = useLanguage();

  return (
    <div className="h-screen text-slate-950 flex flex-col overflow-hidden relative">
      <NightSky />
      
      <header className="h-16 md:h-20 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group">
            <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
          </Link>
          <div className="h-6 w-px bg-black/5 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">{t('activeSession')}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Hi-Perf Mode</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/pdf-tools">
            <Button variant="outline" className="h-9 border-black/10 bg-white/50 hover:bg-primary hover:text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all gap-2 px-4 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5" /> Exit Box
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="h-10 w-10 p-0 flex items-center justify-center rounded-xl bg-white/40 border border-black/5">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative z-10">
        <ToolWorkspace defaultCategory={initialCat} />
      </main>
    </div>
  );
}

export default function UnitsPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-transparent flex items-center justify-center font-black uppercase tracking-[0.5em] text-primary/20">Syncing Tool Box...</div>}>
      <SectorContent />
    </Suspense>
  );
}
