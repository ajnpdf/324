"use client";

import { useEffect } from 'react';

interface AdUnitProps {
  className?: string;
  slot?: string;
  format?: string;
}

/**
 * AJN AdSense Unit - Simple Vertical Integration
 * Defaulting to slot 3648223351 for network consistency.
 */
export function AdUnit({ 
  className, 
  slot = "3648223351", 
  format = "vertical" 
}: AdUnitProps) {
  useEffect(() => {
    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch {
      // Silence background errors
    }
  }, []);

  return (
    <div className={className}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'block', maxWidth: '300px', maxHeight: '250px' }}
        data-ad-client="ca-pub-4495802176396975"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="false"
      />
    </div>
  );
}