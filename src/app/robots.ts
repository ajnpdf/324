
import { MetadataRoute } from 'next';

/**
 * AJN Search Protocol Configuration - Hardened v1.3
 * Consistently uses www canonical prefix for sitemap reference.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/tmp/',
          '/cache/',
          '/dashboard/',
          '/login',
          '/signup',
          '/view/',
          '/junction/'
        ],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'Applebot', 'DuckDuckBot'],
        allow: '/',
      }
    ],
    sitemap: 'https://www.ajnpdf.com/sitemap.xml',
    host: 'https://www.ajnpdf.com',
  };
}
