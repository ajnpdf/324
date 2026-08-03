'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, RefreshCcw, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

/**
 * AJN Tool Error Boundary
 * Specialized for local processing failures (memory overflow, corrupted binaries).
 */
export default function ToolError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] w-full max-w-2xl mx-auto p-12 text-center space-y-10 font-sans text-slate-950">
      <div className="w-24 h-24 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center border border-amber-500/20 shadow-inner">
        <ShieldAlert className="w-12 h-12 text-amber-600" />
      </div>

      <div className="space-y-3">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Process Terminated</h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-sm mx-auto">
          The tool could not finalize the requested transformation.
        </p>
      </div>

      <div className="w-full p-8 bg-white border-2 border-black/5 rounded-[2.5rem] shadow-xl text-left space-y-4">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Error Detail</p>
        <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
          "{error.message || "Integrity check failed during local buffer sync."}"
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button 
          onClick={() => reset()}
          className="h-14 flex-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCcw className="w-4 h-4" /> Restart Tool
        </button>
        <Link href="/pdf-tools" className="flex-1">
          <Button variant="outline" className="h-14 w-full bg-white border-black/5 text-slate-900 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black/5 shadow-sm gap-2">
            <LayoutGrid className="w-4 h-4" /> View All Tools
          </Button>
        </Link>
      </div>
    </div>
  );
}
