import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';
const enableHsts = isProduction && process.env.AJN_ENABLE_HSTS !== 'false';
const enableHstsPreload = enableHsts && process.env.AJN_HSTS_PRELOAD === 'true';

function backendOrigin(): string | null {
  const raw = process.env.NEXT_PUBLIC_PDF_BACKEND_URL?.trim();
  if (!raw) return null;
  try { return new URL(raw).origin; } catch { return null; }
}

const backend = backendOrigin();
const connectSources = [
  "'self'",
  ...(backend ? [backend] : []),
  'https://www.google-analytics.com',
  'https://region1.google-analytics.com',
  'https://*.google-analytics.com',
  'https://pagead2.googlesyndication.com',
  'https://*.googlesyndication.com',
  'https://*.doubleclick.net',
];
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(' ')}`,
  "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  isProduction ? 'upgrade-insecure-requests' : '',
].filter(Boolean).join('; ');

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  output: 'standalone',
  webpack: (config) => { config.resolve.alias.canvas = false; return config; },
  turbopack: { resolveAlias: { canvas: './src/lib/mocks/empty.js' } },
  async redirects() {
    return [
      { source: '/:path*', has: [{ type: 'host', value: 'www.ajnpdf.com' }], destination: 'https://ajnpdf.com/:path*', permanent: true },
      { source: '/guides', destination: '/blog', permanent: true },
      { source: '/ajn', destination: '/ajn-studio', permanent: true },
      { source: '/story', destination: '/about', permanent: true },
      { source: '/services', destination: '/pdf-tools', permanent: true },
      { source: '/compare', destination: '/pdf-tools', permanent: true },
      { source: '/dashboard', destination: '/', permanent: true },
      { source: '/login', destination: '/', permanent: true },
      { source: '/promo', destination: '/', permanent: true },
      { source: '/whatsapp', destination: '/contact', permanent: true },
      { source: '/help/terms', destination: '/terms', permanent: true },
      { source: '/junction', destination: '/pdf-tools', permanent: true },
      { source: '/junction/:path*', destination: '/pdf-tools', permanent: true },
      { source: '/view/:path*', destination: '/pdf-tools', permanent: true },
      { source: '/tools/word-pdf', destination: '/tools/word-to-pdf', permanent: true },
      { source: '/tools/pdf-word', destination: '/tools/pdf-to-word', permanent: true },
      { source: '/tools/excel-pdf', destination: '/tools/excel-to-pdf', permanent: true },
      { source: '/tools/pdf-excel', destination: '/tools/pdf-to-excel', permanent: true },
      { source: '/tools/ppt-pdf', destination: '/tools/ppt-to-pdf', permanent: true },
      { source: '/tools/jpg-pdf', destination: '/tools/jpg-to-pdf', permanent: true },
      { source: '/tools/pdf-jpg', destination: '/tools/pdf-to-jpg', permanent: true },
      { source: '/tools/heic-pdf', destination: '/tools/heic-to-pdf', permanent: true },
      { source: '/tools/html-pdf', destination: '/tools/html-to-pdf', permanent: true },
      { source: '/tools/xml-pdf', destination: '/tools/xml-to-pdf', permanent: true },
      { source: '/tools/json-pdf', destination: '/tools/json-to-pdf', permanent: true },
      { source: '/tools/txt-pdf', destination: '/tools/txt-to-pdf', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          ...(enableHsts ? [{ key: 'Strict-Transport-Security', value: `max-age=63072000; includeSubDomains${enableHstsPreload ? '; preload' : ''}` }] : []),
        ],
      },
    ];
  },
};

export default nextConfig;
