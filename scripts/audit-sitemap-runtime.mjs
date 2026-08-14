const BASE = (process.env.AJN_SITEMAP_AUDIT_BASE || 'https://www.ajnpdf.com').replace(/\/$/, '');
const CANONICAL_ORIGIN = 'https://www.ajnpdf.com';
const EXPECTED_HOST = 'www.ajnpdf.com';
const CONCURRENCY = 10;

function decodeXml(value) {
  return value.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, { redirect: 'manual', ...options });
  const text = await response.text();
  return { response, text };
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => decodeXml(match[1].trim()));
}

function extractCanonical(html) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/\brel=["'][^"']*canonical[^"']*["']/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (href) return href;
  }
  return '';
}

function hasNoindex(html, response) {
  const header = response.headers.get('x-robots-tag') || '';
  if (/noindex/i.test(header)) return true;
  const robots = html.match(/<meta\b[^>]*name=["']robots["'][^>]*>/gi) || [];
  return robots.some((tag) => /noindex/i.test(tag));
}

async function pool(items, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, run));
  return results;
}

const failures = [];
const notes = [];

const sitemapResult = await fetchText(`${BASE}/sitemap.xml`);
if (sitemapResult.response.status !== 200) failures.push(`/sitemap.xml returned ${sitemapResult.response.status}`);
const locs = extractLocs(sitemapResult.text);
if (!locs.length) failures.push('/sitemap.xml contains no <loc> URLs');

const seen = new Set();
for (const loc of locs) {
  let parsed;
  try { parsed = new URL(loc); } catch { failures.push(`Invalid sitemap URL: ${loc}`); continue; }
  if (parsed.protocol !== 'https:' || parsed.host !== EXPECTED_HOST) failures.push(`Non-canonical sitemap host: ${loc}`);
  if (parsed.pathname.startsWith('/tools/')) failures.push(`Legacy /tools/ URL in sitemap: ${loc}`);
  if (seen.has(loc)) failures.push(`Duplicate sitemap URL: ${loc}`);
  seen.add(loc);
}

await pool(locs, async (loc) => {
  const parsed = new URL(loc);
  const target = `${BASE}${parsed.pathname}${parsed.search}`;
  try {
    const { response, text } = await fetchText(target);
    if (response.status !== 200) { failures.push(`${loc} returned HTTP ${response.status}`); return; }
    if (hasNoindex(text, response)) failures.push(`${loc} resolves to noindex`);
    const canonical = extractCanonical(text);
    if (canonical !== loc) failures.push(`${loc} canonical mismatch: ${canonical || '(missing)'}`);
  } catch (error) {
    failures.push(`${loc} fetch failed: ${error.message}`);
  }
});

const imageResult = await fetchText(`${BASE}/image-sitemap.xml`);
if (imageResult.response.status !== 200) failures.push(`/image-sitemap.xml returned ${imageResult.response.status}`);
if (/<image:(title|caption)>/i.test(imageResult.text)) failures.push('image sitemap still contains deprecated image:title/image:caption');
for (const imageLoc of extractLocs(imageResult.text)) {
  try {
    const parsed = new URL(imageLoc);
    if (parsed.protocol !== 'https:') failures.push(`Non-HTTPS image sitemap URL: ${imageLoc}`);
  } catch {
    failures.push(`Invalid image sitemap URL: ${imageLoc}`);
  }
}

const robotsResult = await fetchText(`${BASE}/robots.txt`);
if (robotsResult.response.status !== 200) failures.push(`/robots.txt returned ${robotsResult.response.status}`);
if (!robotsResult.text.includes(`${CANONICAL_ORIGIN}/sitemap.xml`)) failures.push('robots.txt missing canonical sitemap declaration');
if (!robotsResult.text.includes(`${CANONICAL_ORIGIN}/image-sitemap.xml`)) failures.push('robots.txt missing canonical image sitemap declaration');
if (/Disallow:\s*\/tools\//i.test(robotsResult.text)) failures.push('robots.txt blocks /tools/ redirects');

// Representative legacy redirect checks. The full R13 live audit already covers the 107-tool contract.
for (const slug of ['merge-pdf', 'compress-pdf', 'pdf-to-word', 'jpg-to-pdf']) {
  const result = await fetch(`${BASE}/tools/${slug}`, { redirect: 'manual' });
  if (![301, 308].includes(result.status)) failures.push(`/tools/${slug} should permanently redirect; got ${result.status}`);
  const location = result.headers.get('location') || '';
  const resolved = location ? new URL(location, CANONICAL_ORIGIN).href : '';
  if (resolved !== `${CANONICAL_ORIGIN}/${slug}`) failures.push(`/tools/${slug} redirects to wrong destination: ${location || '(missing)'}`);
}

notes.push(`Audited ${locs.length} sitemap URLs against ${BASE}`);
if (failures.length) {
  console.error('AJN PDF SITEMAP RUNTIME AUDIT: FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('AJN PDF SITEMAP RUNTIME AUDIT: PASS');
for (const note of notes) console.log(`- ${note}`);
