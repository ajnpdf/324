'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, ServerOff } from 'lucide-react';
import { checkPdfBackendHealth, type PdfBackendHealth } from '@/lib/pdf-backend';
import { useLanguage } from '@/lib/i18n/language-context';

export function usePdfBackendStatus() {
  const [health, setHealth] = useState<PdfBackendHealth>({ status: 'offline', message: 'Checking secure processing service…', messageKey: 'backend.checking' });
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);
    const next = await checkPdfBackendHealth(controller.signal);
    window.clearTimeout(timeout);
    setHealth(next);
    setChecking(false);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { health, checking, refresh, online: health.status === 'online' };
}

export function BackendStatus({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();
  const { health, checking, refresh, online } = usePdfBackendStatus();
  const toneClass = online ? 'ajn-status-success' : health.status === 'not-configured' ? 'ajn-status-warning' : 'ajn-status-error';

  return (
    <div role="status" aria-live="polite" className={`ajn-backend-status ${toneClass}`} style={{ padding: compact ? 10 : 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        {checking ? <Loader2 size={17} className="animate-spin" /> : online ? <CheckCircle2 size={17} /> : <ServerOff size={17} />}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900 }}>{t('backend.service')}: {checking ? t('backend.checking') : online ? t('backend.available') : t('backend.unavailable')}</div>
          {!compact && <div style={{ marginTop: 3, fontSize: 10, fontWeight: 700, opacity: .8 }}>{t(health.messageKey)}</div>}
        </div>
      </div>
      <button type="button" onClick={() => void refresh()} disabled={checking} aria-label={t('backend.checkAgain')} className="ajn-status-refresh" style={{ cursor: checking ? 'wait' : 'pointer' }}>
        <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
