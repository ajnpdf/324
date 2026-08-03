'use client';

import { useEffect, useState } from 'react';
import { hasConsent } from './cookie-consent';
import { usePremiumEntitlement } from '@/hooks/use-premium-entitlement';

interface AdUnitProps {
  className?: string;
  slot?: string;
  format?: string;
}

export function AdUnit({
  className,
  slot = process.env.NEXT_PUBLIC_ADSENSE_PRIMARY_SLOT || '3648223351',
  format = 'auto',
}: AdUnitProps) {
  const [mounted, setMounted] = useState(false);
  const { premium, loading } = usePremiumEntitlement();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || premium || !hasConsent('advertising')) return;
    try {
      const adsbygoogle = ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []);
      adsbygoogle.push({});
    } catch {
      // Never allow advertising failures to affect file processing.
    }
  }, [loading, mounted, premium, slot]);

  if (!mounted || loading || premium || !hasConsent('advertising')) return null;

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4495802176396975'}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}