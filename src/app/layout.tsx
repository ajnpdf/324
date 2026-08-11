import type { Metadata } from 'next';
import './globals.css';
import { Inter, JetBrains_Mono, Manrope } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '../components/ui/toaster';
import { LanguageProvider } from '../lib/i18n/language-context';
import { LiveTranslationBridge } from '../components/i18n/live-translation-bridge';
import { CookieConsent } from '../components/ui/cookie-consent';
import { AdSenseScriptLoader } from '../components/adsense-script-loader';
import { SITE_NAME, SITE_URL } from '../lib/seo-config';
import { ADSENSE_PUBLISHER } from '../lib/ad-slots';
import { GoogleAnalytics } from '../components/analytics/google-analytics';
import { SiteAnalytics } from '../components/analytics/site-analytics';
import { ThemeProvider } from '../components/theme/theme-provider';
import { ProcessingActivityProvider } from '../components/ajnpdf/processing-activity-provider';
import { MobileBottomNav } from '../components/landing/mobile-bottom-nav';
import { AJN_BRAND, AJN_CONFIRMED_SOCIAL_LINKS, AJN_PRODUCT_ALTERNATE_NAMES, AJN_STUDIO_ALTERNATE_NAMES } from '../lib/brand';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-syne', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: 'Free Online PDF Converter, OCR & Image Tools | AJN PDF', template: '%s | AJN PDF' },
  description: 'Convert, merge, compress, edit and scan PDF, document and image files online with clear requirements, OCR options, honest limitations and downloadable results.',
  alternates: { canonical: '/', types: { 'application/rss+xml': `${SITE_URL}/feed.xml` } },
  authors: [{ name: AJN_BRAND.developerName, url: `${SITE_URL}/developer` }],
  creator: AJN_BRAND.developerName,
  publisher: AJN_BRAND.studioName,
  manifest: '/manifest.json',
  icons: { icon: [{ url: '/favicon.ico', rel: 'shortcut icon' }], apple: [{ url: '/favicon.ico' }] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
  openGraph: {
    title: 'Free Online PDF Converter, OCR & Image Tools | AJN PDF',
    description: 'PDF, document, image and OCR workflows with clear file requirements, practical controls and downloadable results.',
    url: '/',
    siteName: SITE_NAME,
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'AJN PDF red green blue professional toolkit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online PDF Converter, OCR & Image Tools | AJN PDF',
    description: 'PDF, document, image and OCR tools with clear requirements and documented limits.',
    images: ['/og-image.jpg'],
  },
  verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined },
  other: { 'google-adsense-account': ADSENSE_PUBLISHER },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/ajn-studio#organization`,
        name: AJN_BRAND.studioName,
        alternateName: AJN_STUDIO_ALTERNATE_NAMES,
        url: `${SITE_URL}/ajn-studio`,
        logo: `${SITE_URL}/logo.jpeg`,
        founder: { '@id': `${SITE_URL}/developer#anjan` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE_URL}/developer#anjan`,
        name: AJN_BRAND.developerName,
        alternateName: AJN_BRAND.developerDisplayName,
        url: `${SITE_URL}/developer`,
        image: `${SITE_URL}${AJN_BRAND.developerImageJpeg}`,
        jobTitle: AJN_BRAND.developerRole,
        worksFor: { '@id': `${SITE_URL}/ajn-studio#organization` },
        sameAs: AJN_CONFIRMED_SOCIAL_LINKS,
      },
      {
        '@type': 'Brand',
        '@id': `${SITE_URL}/#brand`,
        name: AJN_BRAND.productName,
        alternateName: AJN_PRODUCT_ALTERNATE_NAMES,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.jpeg`,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: AJN_BRAND.productName,
        alternateName: AJN_PRODUCT_ALTERNATE_NAMES,
        publisher: { '@id': `${SITE_URL}/ajn-studio#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/pdf-tools?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#application`,
        name: AJN_BRAND.productName,
        alternateName: AJN_PRODUCT_ALTERNATE_NAMES,
        url: SITE_URL,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web Browser',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'Online PDF, document, image conversion and OCR tools with clear processing requirements and documented limitations.',
        author: { '@id': `${SITE_URL}/developer#anjan` },
        publisher: { '@id': `${SITE_URL}/ajn-studio#organization` },
        brand: { '@id': `${SITE_URL}/#brand` },
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${inter.variable} ${jetBrainsMono.variable}`}>
      <body className="font-sans antialiased">
        <Script
          id="ajn-theme-bootstrap"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ajn_theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}var d=document.documentElement;d.classList.toggle('dark',t==='dark');d.dataset.theme=t;d.style.colorScheme=t;}catch(e){}})();`,
          }}
        />
        <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} strategy="afterInteractive" />
        <ThemeProvider>
          <LanguageProvider>
          <ProcessingActivityProvider />
          <LiveTranslationBridge />
          {children}
          <GoogleAnalytics />
          <SiteAnalytics />
          <AdSenseScriptLoader />
          <CookieConsent />
          <Toaster />
          <MobileBottomNav />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
