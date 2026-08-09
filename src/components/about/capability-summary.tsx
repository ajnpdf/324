'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Server, ServerOff, TriangleAlert } from 'lucide-react';
import { getConversionToolManifest, type ConversionToolManifest } from '@/lib/pdf-backend';

export function CapabilitySummary({ browserCount }: { browserCount: number }) {
  const [tools, setTools] = useState<ConversionToolManifest[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getConversionToolManifest(controller.signal)
      .then((items) => { setTools(items); setError(false); })
      .catch(() => { setTools([]); setError(true); });
    return () => controller.abort();
  }, []);

  const counts = useMemo(() => {
    const available = (tools || []).filter((tool) => tool.available !== false).length;
    const unavailable = (tools || []).filter((tool) => tool.available === false).length;
    return { available, unavailable };
  }, [tools]);

  return (
    <div className="relative grid gap-4 sm:grid-cols-2">
      <div className="rounded-3xl bg-slate-950 p-6 text-white sm:col-span-2 dark:bg-slate-900">
        <p className="text-[10px] font-black tracking-[.15em] text-blue-300">PUBLIC PRODUCT DIRECTORY</p>
        <p className="mt-3 text-4xl font-black">{browserCount} browser workflows</p>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-300">Browser and temporary server-processing tools are labelled before processing.</p>
      </div>
      <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-500/10">
        {tools === null ? <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-300" /> : error ? <ServerOff className="h-5 w-5 text-amber-600 dark:text-amber-300" /> : <Server className="h-5 w-5 text-blue-600 dark:text-blue-300" />}
        <p className="mt-4 text-3xl font-black text-foreground">{tools === null ? '…' : error ? 'Offline' : counts.available}</p>
        <p className="mt-1 text-xs font-black text-muted-foreground">Available server-processing tools</p>
      </div>
      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-400/20 dark:bg-emerald-500/10">
        {error ? <TriangleAlert className="h-5 w-5 text-amber-600 dark:text-amber-300" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />}
        <p className="mt-4 text-3xl font-black text-foreground">{error ? 'Check service' : counts.unavailable}</p>
        <p className="mt-1 text-xs font-black text-muted-foreground">Dependency-aware unavailable tools</p>
      </div>
    </div>
  );
}
