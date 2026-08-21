import type { MetadataRoute } from 'next';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { SEO_EXCLUDED_TOOL_IDS, SITE_URL } from '@/lib/seo-config';
import { getSitemapLastModified } from '@/generated/sitemap-lastmod';
import { toolPath } from '@/lib/tool-routes';

type SitemapFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
type CorePageDefinition = { path: string; changeFrequency: SitemapFrequency; priority: number };

const CORE_PAGE_DEFINITIONS: CorePageDefinition[] = [
  { path: '/', changeFrequency: 'daily', priority: 1 },
  { path: '/pdf-tools', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/image-tools', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/pdf-utilities', changeFrequency: 'weekly', priority: 0.85 },
  { path: '/chrome-extension', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/chrome-extension/privacy', changeFrequency: 'yearly', priority: 0.35 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/developer', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/ajn-studio', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/discover', changeFrequency: 'daily', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/blog/best-free-pdf-editor', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog/browser-native-architecture', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog/document-security-aes256', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog/how-to-merge-pdfs-online-safely', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/blog/reduce-pdf-size-keep-quality', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/blog/pdf-accessibility-basics', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/security', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/limits', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/transparency', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/copyright', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/image-licensing', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/dmca', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/acceptable-use', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/file-processing-policy', changeFrequency: 'yearly', priority: 0.4 },
  { path: '/data-deletion', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/unlock-authorization-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/status', changeFrequency: 'daily', priority: 0.4 },
];

function coreEntry(definition: CorePageDefinition): MetadataRoute.Sitemap[number] {
  return {
    url: `${SITE_URL}${definition.path === '/' ? '/' : definition.path}`,
    lastModified: getSitemapLastModified(definition.path),
    changeFrequency: definition.changeFrequency,
    priority: definition.priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const corePages = CORE_PAGE_DEFINITIONS.map(coreEntry);
  const toolPages: MetadataRoute.Sitemap = BUILD_PUBLIC_TOOLS
    .filter((tool) => !SEO_EXCLUDED_TOOL_IDS.has(tool.id))
    .map((tool) => {
      const pathname = toolPath(tool.id);
      return {
        url: `${SITE_URL}${pathname}`,
        lastModified: getSitemapLastModified(pathname),
        changeFrequency: 'monthly',
        priority: tool.badge === 'Popular' ? 0.9 : 0.7,
      };
    });
  return [...corePages, ...toolPages];
}
