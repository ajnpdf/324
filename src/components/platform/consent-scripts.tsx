'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { hasConsent } from '@/components/ui/cookie-consent';
import { usePremiumEntitlement } from '@/hooks/use-premium-entitlement';

export function ConsentScripts() {
  const [mounted, setMounted] = useState(false);
  const { premium } = usePremiumEntitlement();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const advertising = hasConsent('advertising') && !premium;
  const analytics = hasConsent('analytics');
  const adsenseClient =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT || 'ca-pub-4495802176396975';
  const analyticsId =
    process.env.NEXT_PUBLIC_GA_ID || 'G-VYLQPFYTQB';

  return (
    <>
      {advertising && (
        <Script
          id="ajn-adsense"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {analytics && (
        <>
          <Script
            id="ajn-google-analytics-src"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="ajn-google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${analyticsId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}