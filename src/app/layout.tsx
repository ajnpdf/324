import type { Metadata } from 'next';
import './globals.css';
import { Open_Sans, Montserrat, Public_Sans, JetBrains_Mono } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { FloatingFeedback } from "@/components/ui/floating-feedback";
import { CookieConsent } from "@/components/ui/cookie-consent";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ALL_TOOLS } from '@/lib/tools-data';
import Script from 'next/script';
import React from 'react';

const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['600', '700', '800', '900']
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const toolCount = ALL_TOOLS.length;

export const metadata: Metadata = {
  title: `AJNPDF.COM — All PDF Tools in One Place`,
  description: `Free, Fast, and Easy to Use online PDF tools. Merge, split, convert, and edit files instantly with 100% private local processing.`,
  keywords: 'PDF to Word, Word to PDF, Merge PDF, Split PDF, Reduce PDF Size, Compress PDF, Edit PDF, AJN, AJN STUDIO, PDF Tools India',
  metadataBase: new URL('https://www.ajnpdf.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.ico', rel: 'shortcut icon' }],
    apple: [{ url: '/favicon.ico' }]
  },
  openGraph: {
    title: 'AJNPDF.COM — Free & Easy PDF Tools',
    description: `All PDF tools in one place. Free • Fast • Easy to Use. Privacy-first architecture.`,
    url: 'https://www.ajnpdf.com',
    siteName: 'AJN Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AJNPDF.COM — All-in-One PDF Tools',
    description: `Free online PDF tools for everyone. Fast, private, and simple.`,
  },
  other: {
    "google-adsense-account": "ca-pub-4495802176396975"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.ajnpdf.com/#organization",
        "name": "AJN STUDIO",
        "url": "https://www.ajnpdf.com",
        "logo": "https://www.ajnpdf.com/logo.jpeg",
        "sameAs": [
          "https://x.com/ajnpdf16800",
          "https://www.instagram.com/ajnpdf.in"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://www.ajnpdf.com/#website",
        "url": "https://www.ajnpdf.com",
        "name": "AJNPDF.COM"
      }
    ]
  };

  return (
    <html lang="en" className={`${openSans.variable} ${montserrat.variable} ${publicSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        <Script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4495802176396975" 
          crossOrigin="anonymous" 
          strategy="afterInteractive" 
        />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className="antialiased selection:bg-primary/30 selection:text-primary font-sans bg-background text-foreground">
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-VYLQPFYTQB" strategy="afterInteractive" />
        <script id="google-analytics" dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VYLQPFYTQB');
          ` }} />

        <Script id="json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} strategy="lazyOnload" />

        <FirebaseClientProvider>
          <LanguageProvider>
            {children}
            <FloatingFeedback />
            <CookieConsent />
            <Toaster />
            <SpeedInsights />
          </LanguageProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}