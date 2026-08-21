import type { NextConfig } from 'next';
import { configuredPdfBackendCandidates } from './src/lib/backend-service-url';

const isProduction = process.env.NODE_ENV === 'production';
const enableHsts = isProduction && process.env.AJN_ENABLE_HSTS !== 'false';
const enableHstsPreload = enableHsts && process.env.AJN_HSTS_PRELOAD === 'true';
const backendOrigins = [...new Set(configuredPdfBackendCandidates(isProduction).map((value) => new URL(value).origin))];

const connectSources = [
  "'self'", ...backendOrigins, 'https://www.google-analytics.com', 'https://region1.google-analytics.com',
  'https://*.google-analytics.com', 'https://pagead2.googlesyndication.com', 'https://*.googlesyndication.com', 'https://*.doubleclick.net'];
const contentSecurityPolicy = [
  "default-src 'self'", "base-uri 'self'", "object-src 'none'", "frame-ancestors 'self'", "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://*.googlesyndication.com",
  "style-src 'self' 'unsafe-inline'", "img-src 'self' data: blob: https:", "font-src 'self' data:",
  `connect-src ${connectSources.join(' ')}`, "frame-src 'self' https://*.googlesyndication.com https://*.doubleclick.net",
  "worker-src 'self' blob:", "media-src 'self' blob:", isProduction ? 'upgrade-insecure-requests' : ''].filter(Boolean).join('; ');

const legacyToolAliases: Record<string, string> = {
  'word-pdf': 'word-to-pdf', 'pdf-word': 'pdf-to-word', 'excel-pdf': 'excel-to-pdf', 'pdf-excel': 'pdf-to-excel',
  'ppt-pdf': 'ppt-to-pdf', 'jpg-pdf': 'jpg-to-pdf', 'pdf-jpg': 'pdf-to-jpg', 'heic-pdf': 'heic-to-pdf',
  'html-pdf': 'html-to-pdf', 'xml-pdf': 'xml-to-pdf', 'json-pdf': 'json-to-pdf', 'txt-pdf': 'txt-to-pdf',
  'smart-read': 'pdf-text', 'pdf-ppt': 'pdf-to-powerpoint', 'psd-pdf': 'psd-pdf',
};
const directLegacyToolRedirects = Object.entries(legacyToolAliases).map(([source, destination]) => ({ source: `/tools/${source}`, destination: `/${destination}`, permanent: true }));
const rootLegacyToolRedirects = Object.entries(legacyToolAliases)
  .filter(([source]) => source !== 'psd-pdf')
  .map(([source, destination]) => ({ source: `/${source}`, destination: `/${destination}`, permanent: true }));

const nextConfig: NextConfig = {
  poweredByHeader: false, compress: true, outputFileTracingRoot: process.cwd(), output: 'standalone',
  webpack: (config) => { config.resolve.alias.canvas = false; return config; },
  turbopack: { resolveAlias: { canvas: './src/lib/mocks/empty.js' } },
  async redirects() {
    return [
      ...directLegacyToolRedirects,
      { source: '/:path*', has: [{ type: 'host', value: 'ajnpdf.com' }], destination: 'https://www.ajnpdf.com/:path*', permanent: true },
      { source: '/guides', destination: '/blog', permanent: true }, { source: '/ajn', destination: '/ajn-studio', permanent: true },
      { source: '/story', destination: '/about', permanent: true }, { source: '/services', destination: '/pdf-tools', permanent: true },
      { source: '/compare', destination: '/pdf-tools', permanent: true }, { source: '/dashboard', destination: '/', permanent: true },
      { source: '/login', destination: '/', permanent: true }, { source: '/promo', destination: '/', permanent: true },
      { source: '/whatsapp', destination: '/contact', permanent: true }, { source: '/help/terms', destination: '/terms', permanent: true },
      { source: '/junction', destination: '/pdf-tools', permanent: true }, { source: '/junction/:path*', destination: '/pdf-tools', permanent: true },
      { source: '/view/:path*', destination: '/pdf-tools', permanent: true }, { source: '/tools', destination: '/pdf-tools', permanent: true },
      ...rootLegacyToolRedirects,
      { source: '/tools/:id', destination: '/:id', permanent: true }];
  },
  async headers() {
    return [
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: '/(.*)', headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy }, { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }, { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' }, { key: 'Cross-Origin-Resource-Policy', value: 'same-site' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ...(enableHsts ? [{ key: 'Strict-Transport-Security', value: `max-age=63072000; includeSubDomains${enableHstsPreload ? '; preload' : ''}` }] : [])] }];
  },
};
export default nextConfig;
