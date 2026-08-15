'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileStack, Gauge, Globe2, HardDrive, Monitor, Timer, WifiOff } from 'lucide-react';
import { checkPdfBackendHealth, type PdfBackendHealth } from '@/lib/pdf-backend';
import { getToolLimitProfile } from '@/lib/tool-limits';
import { useLanguage } from '@/lib/i18n/language-context';

const INITIAL_HEALTH: PdfBackendHealth = {
  status: 'offline',
  message: 'Checking online tools…',
  messageKey: 'backend.checking',
};

export function ToolRuntimeFactsInline({ toolId }: { toolId: string }) {
  const { t } = useLanguage();
  const profile = useMemo(() => getToolLimitProfile(toolId), [toolId]);
  const [health, setHealth] = useState<PdfBackendHealth>(INITIAL_HEALTH);
  const [checking, setChecking] = useState(profile.executionMode === 'server');

  useEffect(() => {
    if (profile.executionMode !== 'server') return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    void checkPdfBackendHealth(controller.signal).then((next) => {
      window.clearTimeout(timeout);
      setHealth(next);
      setChecking(false);
    });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [profile.executionMode]);

  const liveMaxFile = profile.executionMode === 'server' && health.maxFileMb ? Math.min(profile.maxFileSizeMb, health.maxFileMb) : profile.maxFileSizeMb;
  const liveMaxTotal = profile.executionMode === 'server' ? health.maxTotalMb || profile.maxTotalSizeMb : undefined;
  const liveTimeout = profile.executionMode === 'server' ? health.processingTimeoutSeconds || profile.processingTimeoutSeconds : undefined;
  const serviceOnline = health.status === 'online';

  const facts = [
    {
      icon: profile.executionMode === 'local' ? Monitor : Globe2,
      label: t('runtime.processing'),
      value: profile.executionMode === 'local' ? t('runtime.onDevice') : t('runtime.secureService'),
    },
    { icon: HardDrive, label: t('runtime.maxFile'), value: `${liveMaxFile} MB` },
    { icon: FileStack, label: t('runtime.maxFiles'), value: String(profile.maxFiles) },
    ...(liveMaxTotal ? [{ icon: Gauge, label: t('runtime.maxTotal'), value: `${liveMaxTotal} MB` }] : []),
    ...(profile.maxPdfPages ? [{ icon: FileStack, label: t('runtime.maxPdfPages'), value: String(profile.maxPdfPages) }] : []),
    ...(liveTimeout ? [{ icon: Timer, label: t('runtime.timeout'), value: `${liveTimeout}s` }] : []),
  ];

  return (
    <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,.05)] sm:mb-6" aria-label={t('runtime.limits')}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <p className="text-xs font-black text-slate-950">{t('runtime.limits')}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-600">{profile.executionMode === 'local' ? t('runtime.localNote') : t('runtime.temporary')}</p>
          </div>
          {profile.executionMode === 'server' && (
            <span className={`inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-[10px] font-black ${checking ? 'border-slate-200 bg-slate-50 text-slate-700' : serviceOnline ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`} role="status" aria-live="polite">
              {checking ? <Gauge className="h-3.5 w-3.5" /> : serviceOnline ? <CheckCircle2 className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
              {checking ? t('runtime.serviceChecking') : serviceOnline ? t('runtime.serviceOnline') : t('runtime.serviceUnavailable')}
            </span>
          )}
        </div>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/75 px-3 py-3">
              <dt className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.08em] text-slate-600"><Icon className="h-3.5 w-3.5 text-blue-700" />{label}</dt>
              <dd className="mt-1.5 text-sm font-black text-slate-950">{value}</dd>
            </div>
          ))}
        </dl>
    </section>
  );
}
