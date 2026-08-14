import type { MetadataRoute } from 'next';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { SEO_EXCLUDED_TOOL_IDS, SITE_URL } from '@/lib/seo-config';
import { fetchPublicMediaPosts } from '@/lib/public-media';
import { toolPath } from '@/lib/tool-routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const corePages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/pdf-tools`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/conversion-tools`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/image-tools`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/pdf-utilities`, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/chrome-extension`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/chrome-extension/privacy`, changeFrequency: 'yearly', priority: 0.35 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/developer`, changeFrequency: 'monthly', priority: 0.75, images: [`${SITE_URL}/images/anjan-kumar-developer.jpg`] },
    { url: `${SITE_URL}/ajn-studio`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/discover`, changeFrequency: 'daily', priority: 0.8, images: [`${SITE_URL}/images/anjan-kumar-developer.jpg`] },
    { url: `${SITE_URL}/blog`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/blog/best-free-pdf-editor`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/browser-native-architecture`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/document-security-aes256`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/how-to-merge-pdfs-online-safely`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/ocr-digital-archiving`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/reduce-pdf-size-keep-quality`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/blog/pdf-vs-docx`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/how-ocr-works`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/blog/improve-ocr-indian-languages`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/blog/scanned-pdf-to-word`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/blog/why-pdf-compression-limited`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/image-to-pdf-jpg-vs-png`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog/pdf-accessibility-basics`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/security`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/limits`, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${SITE_URL}/ocr`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/transparency`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/copyright`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/image-licensing`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/dmca`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/disclaimer`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/acceptable-use`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/file-processing-policy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/data-deletion`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/unlock-authorization-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/status`, changeFrequency: 'daily', priority: 0.4 },
  ];

  const toolPages: MetadataRoute.Sitemap = BUILD_PUBLIC_TOOLS
    .filter((tool) => !SEO_EXCLUDED_TOOL_IDS.has(tool.id))
    .map((tool) => ({
      url: `${SITE_URL}${toolPath(tool.id)}`,
      changeFrequency: 'monthly',
      priority: tool.badge === 'Popular' ? 0.9 : 0.7,
    }));

  const mediaPosts = await fetchPublicMediaPosts(100);
  const mediaPages: MetadataRoute.Sitemap = mediaPosts.map((post) => ({
    url: `${SITE_URL}/discover/${post.slug}`,
    lastModified: post.published_at,
    changeFrequency: 'monthly',
    priority: 0.55,
    images: [post.image_url.startsWith('http') ? post.image_url : `${SITE_URL}${post.image_url}`],
  }));

  return [...corePages, ...toolPages, ...mediaPages];
}
