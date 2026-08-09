import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
let failed = false;
const pass = (message) => console.log(`PASS: ${message}`);
const fail = (message) => { failed = true; console.error(`FAIL: ${message}`); };

const publicFiles = [
  'src/app/page.tsx',
  'src/app/about/page.tsx',
  'src/app/faq/page.tsx',
  'src/app/pdf-tools/page.tsx',
  'src/app/blog/page.tsx',
  'src/app/status/page.tsx',
  'src/app/transparency/page.tsx',
  'src/components/landing/hero.tsx',
  'src/components/landing/main-footer.tsx',
  'src/components/landing/trust-security.tsx',
  'src/components/landing/social-proof.tsx',
  'src/components/landing/how-it-works.tsx',
  'src/components/landing/live-demo.tsx',
].map(read).join('\n');

const prohibited = [
  /100%\s*(private|local)/i,
  /50,?000\+?\s*files/i,
  /safe browsing verified/i,
  /ssl a\+ rated/i,
  /standard compliant/i,
  /99\.9%\s*(uptime|network)/i,
  /zero server uploads/i,
  /trusted by millions/i,
  /gdpr.*compliant/i,
  /soc 2.*compliant/i,
  /zero access to your files/i,
];
for (const pattern of prohibited) {
  pattern.test(publicFiles) ? fail(`Public content contains prohibited claim: ${pattern}`) : pass(`No public claim matching ${pattern}`);
}

const home = read('src/app/page.tsx');
for (const component of ['Hero', 'ServicesGrid', 'ProcessingArchitecture', 'ToolCategories', 'HowItWorks', 'TrustSecurity', 'Workflows', 'FAQSection']) {
  home.includes(component) ? pass(`Homepage includes ${component}`) : fail(`Homepage missing ${component}`);
}

const css = read('src/app/globals.css');
for (const token of ['--ajn-blue', '--ajn-green', '--ajn-red', 'prefers-reduced-motion', '.ajn-tool-card', '.ajn-curved-shape']) {
  css.includes(token) ? pass(`Design system includes ${token}`) : fail(`Design system missing ${token}`);
}

const policy = read('src/lib/tool-policy.ts');
const tools = read('src/lib/tools-data.ts');
if (tools.includes('PUBLIC_TOOLS') && policy.includes('conversionBackendIds') && policy.includes("'protect-pdf', 'unlock-pdf', 'repair-pdf'")) pass('Public tools, conversions and backend security tools remain policy-controlled');
else fail('Tool production policy is incomplete');


const placeholders = read('src/lib/placeholder-images.json');
if (/picsum\.photos|images\.unsplash\.com|placehold\.co/i.test(placeholders)) fail('External placeholder media remains in the production media registry');
else pass('Production media registry uses AJN-owned local assets');
for (const asset of ['public/images/ajn-product-visual.svg', 'public/images/ajn-processing-architecture.svg', 'public/og-image.jpg']) {
  fs.existsSync(path.join(root, asset)) ? pass(`Owned production asset ${asset}`) : fail(`Missing owned production asset ${asset}`);
}

const blog = read('src/app/blog/page.tsx');
for (const route of ['best-free-pdf-editor', 'browser-native-architecture', 'document-security-aes256', 'how-to-merge-pdfs-online-safely', 'ocr-digital-archiving']) {
  blog.includes(`/blog/${route}`) ? pass(`Blog links to real guide ${route}`) : fail(`Blog missing real guide ${route}`);
}
if (/browser-native-pdf-merging|pdf-compression-guide-2026|neural-ocr-deep-dive/.test(blog)) fail('Blog still links to non-existent prototype articles');
else pass('Blog contains no prototype article routes');

const nextConfig = read('next.config.ts');
if (nextConfig.includes("source: '/dashboard'") && nextConfig.includes("source: '/login'") && nextConfig.includes("destination: '/pdf-tools'")) pass('Prototype dashboard and login surfaces are redirected outside public product screens');
else fail('Prototype dashboard/login redirect policy is incomplete');

if (failed) process.exit(1);
console.log('Trust, content and RGB UI verification completed successfully.');
