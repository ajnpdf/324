"use client";

import React, { useEffect, useState } from 'react';
import { hasConsent } from './ui/cookie-consent';

/**
 * AJN STUDIO AdSense Display Unit - Consent Hardened
 * Production client: ca-pub-4495802176396975
 * Primary Slot: 3648223351
 */
export function AdSenseUnit() {
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    // Only push ads if user granted advertising consent
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

  if (!canShow) {
    return null; // Strictly block rendering if consent is not granted
  }

  return (
    <div className="w-full overflow-hidden my-4 flex justify-center min-h-[100px] animate-in fade-in duration-1000">
      <ins className="adsbygoogle"
           style={{ display: 'block' }}
           data-ad-client="ca-pub-4495802176396975"
           data-ad-slot="3648223351"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    </div>
  );
}
