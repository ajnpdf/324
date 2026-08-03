'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { TriangleAlert, RefreshCcw, Home } from 'lucide-react';
import { NightSky } from '@/components/dashboard/night-sky';
import Link from 'next/link';

/**
 * AJN Global Error Boundary
 * Prevents white-screen crashes during heavy local processing or network sync issues.
 * Corrected: Standardized icon to TriangleAlert.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-6 text-slate-950 font-sans relative">
      <NightSky />
      
      <div className="max-w-md w-full bg-white border border-black/5 rounded-[3rem] shadow-2xl p-12 text-center space-y-8 animate-in zoom-in-95 duration-500 relative z-10">
        <div className="w-20 h-20 bg-red-500/10 rounded-[2rem] flex items-center justify-center mx-auto border border-red-500/20">
          <TriangleAlert className="w-10 h-10 text-red-500" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-950">System Interrupt</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed">
            The local engine encountered an unexpected state.
          </p>
        </div>

        <div className="p-6 bg-black/5 rounded-2xl text-left border border-black/5">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagnostic Log</p>
          <p className="text-xs font-mono font-bold text-red-600 break-words leading-relaxed">
            {error?.message || "An unknown error occurred during session synchronization."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => reset()}
            className="h-14 w-full bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
          >
            <RefreshCcw className="w-4 h-4" /> Restart Engine
          </button>
          <Link href="/">
            <Button variant="ghost" className="h-12 w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 gap-2">
              <Home className="w-3.5 h-3.5" /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
