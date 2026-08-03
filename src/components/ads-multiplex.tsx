"use client";

import React, { useEffect, useState } from 'react';
import { hasConsent } from './ui/cookie-consent';

/**
 * AJN STUDIO AdSense Multiplex Unit - Consent Hardened
 * Production client: ca-pub-4495802176396975
 * Multiplex Slot: 1601180258
 */
export function AdsMultiplex() {
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    if (hasConsent('advertising')) {
      setCanShow(true);
      try {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      } catch (err) {
        // Silence background failures
      }
    }
  }, []);

  if (!canShow) return null;

  return (
    <div className="w-full overflow-hidden my-4 flex justify-center min-h-[250px] animate-in fade-in duration-1000">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-format="autorelaxed"
           data-ad-client="ca-pub-4495802176396975"
           data-ad-slot="1601180258"></ins>
    </div>
  );
}
