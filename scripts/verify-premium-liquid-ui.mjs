import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const checks = [
  ['src/components/landing/mobile-bottom-nav.tsx', ['MobileBottomNav', '/pdf-tools', '/conversion-tools', '/image-tools', '/pdf-utilities']],
  ['src/components/landing/mobile-home-hero.tsx', ['MobileHomeHero', 'ajn-gradient-text', 'ajn-primary-action']],
  ['src/components/ajnpdf/file-dropzone.tsx', ['ajn-dropzone', 'Choose or drop your files', 'useReducedMotion']],
  ['src/components/ajnpdf/progress-bar.tsx', ['ajn-progress-card', 'role="progressbar"', 'useReducedMotion']],
  ['src/components/ajnpdf/processing-activity-provider.tsx', ['ProcessingActivityProvider', 'aria-live="polite"']],
  ['src/app/layout.tsx', ['<ProcessingActivityProvider />', '<MobileBottomNav />']],
  ['src/app/globals.css', ['AJN PDF 3.1.0 R4 — Premium Liquid UI', '--ajn-liquid-primary', '.ajn-mobile-bottom-nav', '.dark .ajn-primary-action', '.ajn-liquid-card', '@media (prefers-reduced-motion:reduce)']],
];

const failures = [];
for (const [rel, needles] of checks) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    failures.push(`Missing ${rel}`);
    continue;
  }
  const source = fs.readFileSync(file, 'utf8');
  for (const needle of needles) if (!source.includes(needle)) failures.push(`${rel} missing ${needle}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== '3.1.0') failures.push(`package version is ${pkg.version}, expected 3.1.0`);
if (!pkg.scripts?.['check:frontend']) failures.push('check:frontend script missing');

if (failures.length) {
  console.error('AJN PDF PREMIUM LIQUID UI: FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log('AJN PDF PREMIUM LIQUID UI: PASS');
console.log(' - light lavender/blue theme layer present');
console.log(' - dark premium orange/black theme layer present');
console.log(' - liquid cards/dropzone/progress components present');
console.log(' - mobile hero and real-route bottom navigation present');
console.log(' - reduced-motion and processing feedback present');
