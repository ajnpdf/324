
import { MetadataRoute } from 'next';
import { ALL_TOOLS } from '@/lib/tools-data';
import { BLOG_POSTS } from '@/lib/blog-data';

/**
 * AJN Automated Sitemap Generator - Production v1.9
 * Uses canonical www prefix for all indexed nodes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.ajnpdf.com';
  const now = new Date();

  const corePages = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/pdf-tools`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/security`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/cookies`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${baseUrl}/dmca`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.5 },
    { url: `${baseUrl}/transparency`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.5 },
  ];

  const toolPages = ALL_TOOLS.map((tool) => ({
    url: `${baseUrl}/${tool.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const blogPages = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...corePages, ...toolPages, ...blogPages];
}
