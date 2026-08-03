"use client";

import React, { useEffect, useState } from 'react';
import { hasConsent } from './cookie-consent';

/**
 * AJN AMP Ad Unit Node - Consent Hardened
 * Integrated for mobile-first optimized ad delivery.
 */
export function AmpAdUnit() {
  const [canShow, setCanShow] = useState(false);

  useEffect(() => {
    if (hasConsent('advertising')) {
      setCanShow(true);
    }
  }, []);

  if (!canShow) return null;

  return (
    <div className="w-full overflow-hidden my-2 flex justify-center animate-in fade-in duration-1000">
      {React.createElement('amp-ad', {
        width: "100vw",
        height: "320",
        type: "adsense",
        "data-ad-client": "ca-pub-4495802176396975",
        "data-ad-slot": "3648223351",
        "data-auto-format": "rspv",
        "data-full-width": ""
      }, React.createElement('div', { overflow: "" }))}
    </div>
  );
}
