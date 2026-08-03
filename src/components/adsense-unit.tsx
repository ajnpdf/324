'use client';

import { useEffect, useState } from 'react';
import { hasConsent } from './ui/cookie-consent';
import { usePremiumEntitlement } from '@/hooks/use-premium-entitlement';

export function AdSenseUnit() {
  const [mounted, setMounted] = useState(false);
  const { premium, loading } = usePremiumEntitlement();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading || premium || !hasConsent('advertising')) return;
    try {
      const adsbygoogle = ((window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle ||= []);
      adsbygoogle.push({});
    } catch {
      // Ad blockers and network failures must not break document tools.
    }
  }, [loading, mounted, premium]);

  if (!mounted || loading || premium || !hasConsent('advertising')) return null;

  return (
    <div className="my-4 flex min-h-[100px] w-full justify-center overflow-hidden">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4495802176396975'}
        data-ad-slot={process.env.NEXT_PUBLIC_ADSENSE_PRIMARY_SLOT || '3648223351'}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}