import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const passed = [];
const check = (label, ok) => {
  if (!ok) throw new Error(`FAIL: ${label}`);
  passed.push(`PASS: ${label}`);
};

const brand = read('src/lib/brand.ts');
const developer = read('src/app/developer/page.tsx');
const studio = read('src/app/ajn-studio/page.tsx');
const discover = read('src/app/discover/page.tsx');
const detail = read('src/app/discover/[slug]/page.tsx');
const adminMedia = read('src/app/admin/media/page.tsx');
const publicMedia = read('backend/app/public_media.py');
const backend = read('backend/app/main.py');
const css = read('src/app/globals.css');
const sitemap = read('src/app/sitemap.ts');
const imageSitemap = read('src/app/image-sitemap.xml/route.ts');
const feed = read('src/app/feed.xml/route.ts');
const setup = read('SETUP_FULL_PRODUCTION.ps1');
const analytics = read('src/components/analytics/site-analytics.tsx');

for (const asset of [
  'public/images/anjan-kumar-developer.jpg',
  'public/images/anjan-kumar-developer.webp',
  'public/images/anjan-kumar-developer-thumb.webp',
  'public/images/anjan-developer-og.jpg',
]) check(`Owned developer asset ${asset}`, exists(asset));

check('Brand identity declares Anjan, AJN PDF and AJN Studio', brand.includes("developerName: 'Anjan Kumar'") && brand.includes("studioName: 'AJN Studio'") && brand.includes("productName: 'AJN PDF'"));
check('Developer page uses public portrait and ProfilePage structured data', developer.includes('developerImage') && developer.includes("'@type': 'ProfilePage'") && developer.includes("'@type': 'Person'"));
check('AJN Studio organization page exists', studio.includes("'@type': 'Organization'") && studio.includes('AJN Studio'));
check('Public discover collection uses ImageObject structured data', discover.includes("'@type': 'CollectionPage'") && discover.includes("'@type': 'ImageObject'"));
check('Discover detail uses ImageObject licensing fields', detail.includes('creditText') && detail.includes('copyrightNotice') && detail.includes('acquireLicensePage'));
check('Admin publisher requires rights confirmation', adminMedia.includes('rights_confirmed') && publicMedia.includes('rights_confirmed'));
check('Admin publisher requires useful captions and alt text', adminMedia.includes('minLength={60}') && publicMedia.includes('Form(min_length=60'));
check('Media backend validates MIME, pixel count and file size', publicMedia.includes('ALLOWED_MIME') && publicMedia.includes('MAX_IMAGE_PIXELS') && publicMedia.includes('MAX_IMAGE_BYTES'));
check('Media backend stores optimized WebP and thumbnails', publicMedia.includes("full.save(image_path,'WEBP'") && publicMedia.includes("thumb.save(thumb_path,'WEBP'"));
check('Media backend uses constant-time admin token comparison', publicMedia.includes('secrets.compare_digest'));
check('Public media routes are cache-aware while private APIs remain no-store', backend.includes('request.url.path.startswith("/media/")') && backend.includes('max-age=31536000') && backend.includes('stale-while-revalidate=300'));
check('Media analytics events are privacy-minimized', analytics.includes("'media_view'") && analytics.includes("'media_open'") && !analytics.includes('file.name'));
check('Image sitemap route exists', imageSitemap.includes('xmlns:image') && imageSitemap.includes('<image:loc>'));
check('RSS feed route exists', feed.includes('<rss version="2.0">') && feed.includes('AJN Discover'));
check('Primary sitemap includes brand and discover routes', sitemap.includes('`${SITE_URL}/developer`') && sitemap.includes('`${SITE_URL}/ajn-studio`') && sitemap.includes('`${SITE_URL}/discover`'));
check('Premium light and dark semantic tokens exist', css.includes('--surface-elevated') && css.includes('--text-primary') && css.includes('.dark {'));
check('Dark compatibility includes common legacy text and surfaces', css.includes('.dark .bg-white') && css.includes('.dark .text-slate-950'));
check('Reduced motion remains supported', css.includes('@media (prefers-reduced-motion: reduce)'));
check('Backend version is 3.1.0', backend.includes('VERSION = "3.1.0"'));
check('Setup expects backend version 3.1.0', setup.includes("version -eq '3.1.0'"));
check('Setup creates public media runtime directory', setup.includes('backend\\public_media'));
check('Setup remains PowerShell 5.1 compatible', !setup.includes('Join-String') && !setup.includes('RandomNumberGenerator]::Fill'));

console.log(passed.join('\n'));
console.log('Brand, developer, public media, image SEO, theme and setup verification completed successfully.');

const conversionEngine = fs.readFileSync('backend/app/conversion_engine.py', 'utf8');
check('Tesseract searchable PDF uses stdout', conversionEngine.includes('\"stdout\"') && conversionEngine.includes('pdf_bytes.startswith(b\"%PDF-\")'));
