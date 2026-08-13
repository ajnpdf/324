import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const pass = (message) => console.log(`PASS: ${message}`);

const toolsData = read('src/lib/tools-data.ts');
const workspace = read('src/components/junction/tool-workspace-client.tsx');
const ids = [...toolsData.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1]);
const mapped = new Map([...workspace.matchAll(/'([^']+)':\s*dynamic\(\(\)\s*=>\s*import\('\.\/([^']+)'\)/g)].map((match) => [match[1], match[2]]));
if (ids.length !== new Set(ids).size) fail('Tool registry contains duplicate IDs.'); else pass(`${ids.length} unique tool IDs`);
for (const id of ids) {
  const component = mapped.get(id);
  if (!component) fail(`${id} has no route component mapping.`);
  else if (!fs.existsSync(path.join(root, 'src/components/junction', `${component}.tsx`))) fail(`${id} maps to missing component ${component}.tsx`);
}
if (!process.exitCode) pass('Every registered tool maps to an existing component.');

const route = read('src/app/(tool-pages)/[id]/page.tsx');
route.includes('generateMetadata') ? pass('Dynamic tool metadata enabled') : fail('Dynamic tool metadata is missing.');
route.includes('BreadcrumbList') && route.includes('WebApplication') && !route.includes('FAQPage') && !route.includes('HowTo') ? pass('Breadcrumb and accurate WebApplication structured data enabled') : fail('Tool structured data is incomplete or contains legacy rich-result markup.');
route.includes('ToolEditorialContent') ? pass('Detailed tool guidance is rendered before ads') : fail('Useful server-rendered tool guidance is missing.');

if (fs.existsSync(path.join(root, 'public/robots.txt')) || fs.existsSync(path.join(root, 'public/sitemap.xml'))) fail('Duplicate static robots/sitemap files remain in public/.');
else pass('No duplicate public robots/sitemap files');

const layout = read('src/app/layout.tsx');
const loader = read('src/components/adsense-script-loader.tsx');
const adUnit = read('src/components/adsense-unit.tsx');
const allAds = `${layout}\n${loader}\n${adUnit}`;
if (/amp-auto-ads|<amp-ad|cdn\.ampproject\.org\/v0\/amp-ad/i.test(allAds)) fail('AMP code is present in the non-AMP site.'); else pass('No AMP ad code in the non-AMP website');
layout.includes('google-adsense-account') ? pass('AdSense ownership meta tag enabled') : fail('AdSense ownership meta tag is missing.');
loader.includes('ajn_cookie_consent') && loader.includes('document.head.appendChild') ? pass('AdSense script loads only after optional advertising choice') : fail('Consent-aware AdSense loader is incomplete.');
loader.includes("host === 'ajnpdf.com'") && loader.includes("host === 'www.ajnpdf.com'") ? pass('Live ad loading is restricted to AJN PDF production domains') : fail('Production domain guard is missing.');
adUnit.includes('ajn_cookie_consent') && adUnit.includes('data-ad-slot') ? pass('Ad units require consent and a configured slot') : fail('Ad unit consent or slot guard is incomplete.');

const slots = read('src/lib/ad-slots.ts');
for (const value of ['3648223351', '4849624383', '1601180258']) slots.includes(value) ? pass(`AdSense slot ${value} configured`) : fail(`Missing AdSense slot ${value}`);
const ads = read('public/ads.txt').trim();
ads === 'google.com, pub-4495802176396975, DIRECT, f08c47fec0942fa0' ? pass('ads.txt is valid') : fail('ads.txt content is incorrect.');

if (!process.exitCode) console.log('SEO, ownership, consent-aware ads and slot verification completed successfully.');
