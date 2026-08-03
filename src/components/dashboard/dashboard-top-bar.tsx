"use client";

import { Zap, ShieldCheck, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';
import Link from 'next/link';
import { LogoAnimation } from '../landing/logo-animation';
import { LanguageSelector } from './language-selector';
import { useState, useEffect } from 'react';
import { engine, GlobalAppState } from '@/lib/engine';
import { cn } from '@/lib/utils';

export function DashboardTopBar() {
  const [engineState, setEngineState] = useState<GlobalAppState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return engine.subscribe(setEngineState);
  }, []);

  return (
    <div className="flex flex-col sticky top-0 z-[60] font-sans">
      <header className="h-16 bg-white/30 backdrop-blur-2xl border-b border-white/20 flex items-center justify-between px-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-4 flex-1">
          <div className="lg:hidden flex items-center gap-2 pr-4 border-r border-white/10">
             <LogoAnimation className="w-16 h-8" showGlow={false} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {mounted && (
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-black/5 shadow-inner">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  engineState?.engineStatus === 'busy' ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                )} />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-900">
                  {engineState?.engineStatus === 'busy' ? 'BUSY' : 'READY'}
                </span>
              </div>
              <div className="h-3 w-px bg-black/5" />
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Load</span>
                <span className={cn(
                  "text-[10px] font-black tabular-nums",
                  (engineState?.bufferPressure || 0) > 80 ? "text-red-500" : "text-slate-900"
                )}>
                  {engineState?.bufferPressure || 0}%
                </span>
              </div>
              <div className="h-3 w-px bg-black/5" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          )}

          <LanguageSelector />

          <Link href="/pdf-tools">
            <Button className="bg-primary hover:bg-primary/90 text-white font-black text-[9px] h-9 px-3 md:px-4 rounded-xl shadow-md uppercase tracking-widest">
              Directory
            </Button>
          </Link>
        </div>
      </header>
    </div>
  );
}
