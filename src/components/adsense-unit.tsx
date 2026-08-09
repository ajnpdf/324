"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ADSENSE_PUBLISHER } from '@/lib/ad-slots';
import { isAdEligiblePath } from '@/components/adsense-script-loader';

declare global {
  interface Window { adsbygoogle?: unknown[]; }
}

const CONSENT_EVENT = 'ajn-cookie-consent-changed';
const READY_EVENT = 'ajn-adsense-ready';

interface AdSenseUnitProps {
  slot?: string;
  className?: string;
  width?: number;
  height?: number;
  responsive?: boolean;
  label?: string;
}

export function AdSenseUnit({
  slot,
  className = '',
  width,
  height,
  responsive = false,
  label = 'Advertisement',
}: AdSenseUnitProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const initialized = useRef(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const syncConsent = () => {
      const host = window.location.hostname.toLowerCase();
      const productionHost = host === 'ajnpdf.com' || host === 'www.ajnpdf.com';
      setAllowed(productionHost && isAdEligiblePath(window.location.pathname) && localStorage.getItem('ajn_cookie_consent') === 'accepted');
    };
    syncConsent();
    window.addEventListener(CONSENT_EVENT, syncConsent);
    window.addEventListener('storage', syncConsent);
    return () => {
      window.removeEventListener(CONSENT_EVENT, syncConsent);
      window.removeEventListener('storage', syncConsent);
    };
  }, []);

  useEffect(() => {
    if (!allowed || !slot) return;

    const requestAd = () => {
      if (initialized.current || !adRef.current || !window.adsbygoogle) return;
      try {
        window.adsbygoogle.push({});
        initialized.current = true;
      } catch {
        // Ad blockers, review status, privacy tools, or empty inventory may prevent rendering.
      }
    };

    requestAd();
    window.addEventListener(READY_EVENT, requestAd);
    return () => window.removeEventListener(READY_EVENT, requestAd);
  }, [allowed, slot]);

  // Keep verification independent through the AdSense meta tag and /ads.txt.
  // Ads themselves load only after advertising consent and only in production.
  if (!slot || process.env.NODE_ENV !== 'production' || !allowed) return null;

  const adStyle: React.CSSProperties = responsive
    ? { display: 'block', width: '100%' }
    : { display: 'inline-block', width: width || 300, height: height || 250, maxWidth: '100%' };

  return (
    <aside aria-label={label} className={`w-full overflow-hidden flex flex-col items-center justify-center ${className}`}>
      <span className="mb-2 text-[8px] font-black uppercase tracking-[0.18em] text-slate-400">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client={ADSENSE_PUBLISHER}
        data-ad-slot={slot}
        {...(responsive ? { 'data-ad-format': 'auto', 'data-full-width-responsive': 'true' } : {})}
      />
    </aside>
  );
}
