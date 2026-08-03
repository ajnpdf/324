"use client";

import React, { useEffect, useState } from 'react';
import { hasConsent } from './ui/cookie-consent';

/**
 * AJN STUDIO AdSense In-Article Unit - Consent Hardened
 * Production client: ca-pub-4495802176396975
 * In-Article Slot: 8877035044
 */
export function AdsInArticle() {
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
    <div className="w-full overflow-hidden my-4 flex justify-center animate-in fade-in duration-1000">
      <ins className="adsbygoogle"
           style={{ display: 'block', textAlign: 'center' }}
           data-ad-layout="in-article"
           data-ad-format="fluid"
           data-ad-client="ca-pub-4495802176396975"
           data-ad-slot="8877035044"></ins>
    </div>
  );
}
