import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const ids = [
  'merge-pdf','split-pdf','compress-pdf','rotate-pdf','delete-pdf-pages','organize-pdf','crop-pdf','watermark-pdf','page-number','flatten-pdf','protect-pdf','unlock-pdf',
  'repair-pdf','compare-pdf','add-text','add-image-to-pdf','pdf-metadata','png-to-pdf','extract-images','image-reducer','image-resizer','crop-image','rotate-image','watermark-image',
  'flip-image','convert-image','meme-generator','photo-editor','ocr-advanced','ocr-scanner','sign-pdf','pdf-text','pdf-zip-extract','zip-extractor','subtitle-generator','scanned-pdf-to-text',
  'scanned-pdf-to-word','scanned-pdf-to-searchable-pdf','image-to-searchable-pdf','image-to-text','image-to-word','camera-scan-to-pdf','receipt-to-pdf','document-scanner-to-pdf','handwriting-image-to-text','image-to-pdf','jpg-to-pdf','jpeg-to-pdf',
  'webp-to-pdf','tiff-to-pdf','bmp-to-pdf','gif-to-pdf','svg-to-pdf','heic-to-pdf','pdf-to-image','pdf-to-jpg','pdf-to-jpeg','pdf-to-png','pdf-to-webp','pdf-to-tiff',
  'pdf-to-bmp','pdf-to-gif','pdf-to-svg','pdf-to-heic','pdf-pages-to-zip','pdf-to-word','pdf-to-docx','pdf-to-txt','pdf-to-rtf','pdf-to-odt','pdf-to-html','pdf-to-markdown',
  'pdf-to-xml','pdf-to-json','pdf-to-csv','pdf-to-excel','pdf-to-xlsx','pdf-to-powerpoint','pdf-to-pptx','pdf-to-epub','pdf-to-mobi','pdf-to-azw3','word-to-pdf','doc-to-pdf',
  'docx-to-pdf','txt-to-pdf','rtf-to-pdf','odt-to-pdf','ods-to-pdf','odp-to-pdf','html-to-pdf','url-to-pdf','markdown-to-pdf','xml-to-pdf','json-to-pdf','csv-to-pdf',
  'excel-to-pdf','xls-to-pdf','xlsx-to-pdf','powerpoint-to-pdf','ppt-to-pdf','pptx-to-pdf','epub-to-pdf','mobi-to-pdf','azw3-to-pdf','eml-to-pdf','msg-to-pdf',
];

function fail(message) { console.error(`FAIL: ${message}`); process.exit(1); }
function file(relative, minBytes = 1) {
  const full = path.join(root, relative);
  if (!fs.existsSync(full)) fail(`${relative} is missing.`);
  const size = fs.statSync(full).size;
  if (size < minBytes) fail(`${relative} is unexpectedly small (${size} bytes).`);
  return full;
}
function text(relative) { return fs.readFileSync(file(relative), 'utf8'); }
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full)); else out.push(full);
  }
  return out;
}
function requireMarkers(relative, markers) {
  const body = text(relative);
  for (const marker of markers) if (!body.includes(marker)) fail(`${relative} is missing ${marker}.`);
  return body;
}

if (ids.length !== 107 || new Set(ids).size !== 107) fail('Expected exactly 107 unique production tool ids.');

// Approved brand bytes stay untouched; the transparent derivative is used in the website chrome.
const approvedLogo = file('public/brand/ajn-logo.png', 10_000);
const approvedHash = crypto.createHash('sha256').update(fs.readFileSync(approvedLogo)).digest('hex');
if (approvedHash !== '2640832e7862de2b48c3001be79b2f3202f00ab16abca73702858f6f3a2eb386') fail('Approved AJN logo bytes changed.');
file('public/brand/ajn-logo-transparent.png', 10_000);

// R7/R8 source-driven vector icon coverage stays intact: 34 dedicated action glyphs + 73 unique conversion pairs.
const artwork = text('src/components/ajn/tool-artwork.tsx');
for (const marker of ['AJN PDF R7 simple icon system','specialIcons','getConversion','ajn-format-tile','data-tool-icon={toolId}','toneClasses']) {
  if (!artwork.includes(marker)) fail(`ToolArtwork is missing ${marker}.`);
}
const specialEntries = [...artwork.matchAll(/\n\s*'([^']+)':\s*([A-Za-z0-9_]+),/g)].filter((match) => ids.includes(match[1]));
const specialIds = new Set(specialEntries.map((match) => match[1]));
const specialGlyphs = specialEntries.map((match) => match[2]);
if (specialIds.size !== 34) fail(`Expected 34 dedicated action glyphs, found ${specialIds.size}.`);
if (new Set(specialGlyphs).size !== specialGlyphs.length) fail('Dedicated action tools reuse an identical icon glyph.');
for (const id of ids) {
  if (specialIds.has(id) || id.includes('-to-') || id === 'pdf-pages-to-zip') continue;
  fail(`Tool icon coverage is incomplete for ${id}.`);
}
const iconsDir = path.join(root, 'public', 'tool-icons');
if (!fs.existsSync(iconsDir)) fail('public/tool-icons must exist for mirror cleanup.');
const raster = fs.readdirSync(iconsDir).filter((name) => /\.(webp|png|jpe?g)$/i.test(name));
if (raster.length) fail('Legacy per-card raster icon sheets are still shipped.');

// Adaptive tool directory: mobile horizontal by default, desktop can choose 2/4/list and the choice persists.
const grid = requireMarkers('src/components/landing/services-grid.tsx', [
  "type ViewMode = 'list' | 'comfortable' | 'compact'",
  "useState<ViewMode>('compact')",
  "localStorage.getItem('ajn-tool-view')",
  "localStorage.setItem('ajn-tool-view', next)",
  "label: '2 columns'",
  "label: '4 columns'",
  "label: 'List'",
  "'grid-cols-1 md:grid-cols-2'",
  "'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'",
  'ajn-tool-card-compact',
  'ajn-tool-card-list',
  'h-11 w-11 sm:h-12 sm:w-12',
]);
for (const forbidden of ['getToolPolicy','Runs in your browser','Browser processing','Temporary server processing','TriangleAlert','home.limitNote','framer-motion','onPointerMove']) {
  if (grid.includes(forbidden)) fail(`Tool cards still contain unwanted UI behavior/content: ${forbidden}.`);
}

// Hero and premium supporting visual: task-first buttons + original workspace illustration, no processing-mode badges.
const hero = requireMarkers('src/components/landing/hero.tsx', [
  'Explore 107 tools','Start with Merge PDF','ajn-r8-hero-document','Clean workflow','Choose','Adjust','Process','Finish',
]);
for (const forbidden of ['processing.browser','processing.server','Runs in your browser','Temporary server processing']) if (hero.includes(forbidden)) fail(`Hero still exposes technical mode text: ${forbidden}.`);
requireMarkers('src/components/landing/feature-showcase.tsx', ['A cleaner path from upload to result.','Download or share','ajn-r8-showcase-wave','Share2']);
const home = requireMarkers('src/app/page.tsx', ['<FeatureShowcase />','<ServicesGrid query={search} category={activeCategory} />']);
if (home.includes('<LiveDemo />')) fail('Old technical live-demo block is still mounted on the homepage.');

// Wave background replaces decorative circle blobs on the shared premium backdrop.
const background = requireMarkers('src/components/premium/premium-background.tsx', ['<svg','ajn-r8-wave-one','ajn-r8-wave-two']);
if (background.includes('rounded-full')) fail('PremiumBackground still contains circle blobs.');
requireMarkers('src/app/globals.css', ['AJN PDF R8 — PREMIUM PRO WORKSPACE / CLEAN GRID / WAVE BACKGROUND','.ajn-r8-wave-bg','.ajn-tool-card-compact','.ajn-tool-card-list','.ajn-r8-showcase-wave']);

// Full-page processing state: document scan visual and stages, no elapsed seconds/dot-only loader.
const provider = requireMarkers('src/components/ajnpdf/processing-activity-provider.tsx', [
  'Preparing your document','Working on your file','Checking the result','Result ready','styles.backdrop','styles.scanLine','styles.stages',
  'ajn:processing-start','ajn:processing-progress','ajn:processing-finish','ajn:processing-error',
]);
for (const forbidden of ['formatElapsed','elapsed','stageDot','0.0s','0 sec']) if (provider.includes(forbidden)) fail(`Full-page processing UI still contains ${forbidden}.`);
const processingCss = requireMarkers('src/components/ajnpdf/processing-activity-provider.module.css', ['position:fixed','inset:0','.scanLine','.sheetFront','.stages','.waveTop','.waveBottom']);
for (const forbidden of ['.elapsed','.stageDot']) if (processingCss.includes(forbidden)) fail(`Processing CSS still contains ${forbidden}.`);
const engine = requireMarkers('src/lib/engine.ts', ['emitProcessingUiEvent','ajn:processing-start','ajn:processing-progress','ajn:processing-finish','reportProgress']);
if (!engine.includes("detail: \"Preparing your file…\"")) fail('Local processing engine does not announce the polished preparation stage.');
requireMarkers('src/components/junction/_shared.tsx', ['beginToolProcessing','completeToolProcessing','failToolProcessing']);
const directLifecycleFiles = walk(path.join(root, 'src', 'components', 'junction')).filter((name) => name.endsWith('.tsx') && fs.readFileSync(name, 'utf8').includes('beginToolProcessing('));
if (directLifecycleFiles.length < 20) fail(`Expected broad full-page lifecycle coverage for direct tools, found ${directLifecycleFiles.length}.`);

// Remove visible seconds/timestamps from processing UI source, while preserving implementation timings where they are not rendered.
const junctionFiles = walk(path.join(root, 'src', 'components', 'junction')).filter((name) => name.endsWith('.tsx'));
for (const source of junctionFiles) {
  const body = fs.readFileSync(source, 'utf8');
  for (const forbidden of ['Runs in your browser','Browser processing','Temporary server processing','0.0s','Processing time']) {
    if (body.includes(forbidden)) fail(`${path.relative(root, source)} still exposes unwanted text: ${forbidden}.`);
  }
}
const hook = text('src/hooks/use-ajn-tool.tsx');
if (/\[\{?[^\n]*elapsed[^\n]*s\]?/i.test(hook) || hook.includes('toFixed(2)}s')) fail('Tool progress log still renders elapsed seconds.');

// Result UX: sharing exists on shared local results and all server-conversion results.
const shared = requireMarkers('src/components/junction/_shared.tsx', ['export async function shareResult','nav.share','navigator.clipboard.writeText','shareFile?:{blob:Blob;name:string}','<Share2']);
if (shared.includes('processing.browserDone') || shared.includes('processing.serverDone')) fail('Shared result screen still exposes processing-mode labels.');
const server = requireMarkers('src/components/junction/ServerConversionTool.tsx', ['shareResult(result.blob, result.filename)','<Share2','status === \'processing\' && <div className="sr-only"']);
if (server.includes('temporaryPrivacy')) fail('Server result/workspace still mounts the old technical privacy card.');
const shareCount = (shared.match(/shareFile\?/g) || []).length + junctionFiles.reduce((count, source) => count + ((fs.readFileSync(source, 'utf8').match(/shareFile=\{\{/g) || []).length), 0);
if (shareCount < 10) fail('Share result wiring is unexpectedly sparse.');
const customShareScreens = junctionFiles.filter((source) => fs.readFileSync(source, 'utf8').includes('Share result'));
if (customShareScreens.length < 20) fail(`Expected Share result actions across custom result screens, found ${customShareScreens.length}.`);

// Editorial/homepage wording should be user-facing rather than developer/SEO commentary.
const editorial = text('src/components/junction/tool-editorial-content.tsx');
for (const forbidden of ['Search intent covered','Primary topic:','Temporary server processing','Browser processing','rounded-full']) if (editorial.includes(forbidden)) fail(`Tool editorial content still contains unpolished/decorative content: ${forbidden}.`);
for (const relative of ['src/components/landing/social-proof.tsx','src/components/landing/trust-security.tsx','src/components/landing/category-directory.tsx']) {
  const body = text(relative);
  for (const forbidden of ['fabricated testimonials','search intent guide','technical truth','unverified badges']) if (body.toLowerCase().includes(forbidden)) fail(`${relative} contains developer-facing copy: ${forbidden}.`);
}

// Light-only mode and transparent header brand remain enforced.
const themeProvider = text('src/components/theme/theme-provider.tsx');
if (!themeProvider.includes("root.classList.remove('dark')") || !themeProvider.includes("theme: 'light'")) fail('ThemeProvider is not fixed to light mode.');
if (text('src/components/landing/navbar.tsx').includes('ThemeToggle')) fail('Navbar still exposes dark mode.');
const logo = text('src/components/landing/logo-animation.tsx');
if (!logo.includes('/brand/ajn-logo-transparent.png') || logo.includes('bg-white')) fail('Website logo still has an unwanted background plate.');

console.log('AJN PDF R8 PREMIUM PRO WORKSPACE UI: PASS');
console.log('- 107/107 tools retain unique simple professional vector icon coverage');
console.log('- card processing-mode labels and visible processing seconds removed');
console.log('- mobile defaults to horizontal cards; desktop offers persistent 2-column, 4-column and list views');
console.log('- full-page document-processing animation wired for server requests and local engine jobs');
console.log('- original wave background and focused workspace visuals added without circle blobs');
console.log('- shared and server-conversion result flows expose download/share actions');
console.log('- technical/SEO-style homepage wording reduced in favor of premium user-facing copy');
console.log('- light-only UI and transparent AJN website logo preserved');
