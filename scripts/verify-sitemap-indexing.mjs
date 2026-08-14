import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const exists = (relative) => fs.existsSync(path.join(root, relative));
let failures = 0;

function check(label, condition) {
  if (condition) console.log(`PASS: ${label}`);
  else { console.error(`FAIL: ${label}`); failures += 1; }
}

const sitemap = read('src/app/sitemap.ts');
const seo = read('src/lib/seo-config.ts');
const imageSitemap = read('src/app/image-sitemap.xml/route.ts');
const robots = read('src/app/robots.ts');
const nextConfig = read('next.config.ts');
const manifest = read('src/generated/sitemap-lastmod.ts');
const ids = JSON.parse(read('scripts/r13-public-tool-ids.json'));

const corePaths = [...sitemap.matchAll(/\{\s*path:\s*'([^']+)'/g)].map((match) => match[1]);
const uniqueCorePaths = new Set(corePaths);
const manifestPaths = new Set([...manifest.matchAll(/^\s*"([^"]+)":\s*"/gm)].map((match) => match[1]));

const excludedBody = seo.match(/SEO_EXCLUDED_TOOL_IDS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)?.[1] || '';
const excludedIds = new Set([...excludedBody.matchAll(/'([^']+)'/g)].map((match) => match[1]));
const sitemapToolIds = ids.filter((id) => !excludedIds.has(id));

check('canonical SITE_URL is exactly https://www.ajnpdf.com', seo.includes("export const SITE_URL = 'https://www.ajnpdf.com';"));
check('tool metadata indexability is not coupled to temporary build capability', !seo.includes('isBuildToolAvailable') && /const shouldIndex = isToolPublic\(tool\.id\)\s*&&\s*!SEO_EXCLUDED_TOOL_IDS\.has\(tool\.id\)/.test(seo));
check('main sitemap is deterministic and contains no live media fetch', !sitemap.includes('fetchPublicMediaPosts') && !sitemap.includes('mediaPosts'));
check('main sitemap uses Git/content-derived lastmod helper', sitemap.includes('getSitemapLastModified'));
check('main sitemap contains no legacy /tools/ URL', !sitemap.includes('/tools/'));
check('main sitemap has no duplicate static paths', corePaths.length === uniqueCorePaths.size);
check('image sitemap keeps image:loc', imageSitemap.includes('<image:loc>'));
check('image sitemap removes deprecated image:title', !imageSitemap.includes('<image:title>'));
check('image sitemap removes deprecated image:caption', !imageSitemap.includes('<image:caption>'));
check('robots publishes both sitemap declarations', robots.includes('sitemap.xml') && robots.includes('image-sitemap.xml'));
check('robots keeps /admin/ disallowed as discovery preference', robots.includes("'/admin/'"));
check('robots does not block legacy /tools/ redirects', !robots.includes("'/tools/'"));
check('bare domain permanently redirects to www', nextConfig.includes("value: 'ajnpdf.com'") && nextConfig.includes("destination: 'https://www.ajnpdf.com/:path*'") && nextConfig.includes('permanent: true'));
check('legacy /tools/:id permanent redirect remains', nextConfig.includes("source: '/tools/:id'") && nextConfig.includes("destination: '/:id'"));
check('lastmod manifest generator exists', exists('scripts/generate-sitemap-lastmod.mjs'));
check('runtime sitemap auditor exists', exists('scripts/audit-sitemap-runtime.mjs'));
check('lastmod manifest covers every static sitemap path', corePaths.every((urlPath) => manifestPaths.has(urlPath)));
check('lastmod manifest covers every indexable tool route', sitemapToolIds.every((id) => manifestPaths.has(`/${id}`)));

for (const urlPath of corePaths) {
  const relative = urlPath === '/' ? '' : urlPath.replace(/^\//, '');
  const candidates = urlPath === '/'
    ? ['src/app/page.tsx']
    : [`src/app/${relative}/page.tsx`, `src/app/${relative}/route.ts`];
  check(`static sitemap route exists: ${urlPath}`, candidates.some(exists));
}

if (failures) {
  console.error(`AJN PDF sitemap/indexing source audit failed: ${failures} issue(s).`);
  process.exit(1);
}
console.log(`AJN PDF sitemap/indexing source audit: PASS (${corePaths.length} static + ${sitemapToolIds.length} canonical tool routes).`);
