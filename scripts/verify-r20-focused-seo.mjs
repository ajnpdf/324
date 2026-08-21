import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const failures = [];
const check = (label, condition) => condition ? console.log(`PASS: ${label}`) : failures.push(label);

const policy = read('src/lib/tool-policy.ts');
const seo = read('src/lib/seo-strategy.ts');
const layout = read('src/app/layout.tsx');
const sitemap = read('src/app/sitemap.ts');
const homepage = read('src/app/page.tsx');
const allTools = read('src/components/landing/all-tools-menu.tsx');
const navbar = read('src/components/landing/navbar.tsx');

const allowlist = policy.match(/PRODUCTION_PUBLIC_TOOL_IDS = new Set\(\[([\s\S]*?)\]\);/)?.[1] || '';
const publicIds = [...allowlist.matchAll(/'([^']+)'/g)].map((match) => match[1]);

check('focused production catalog contains exactly 27 unique public tools', publicIds.length === 27 && new Set(publicIds).size === 27);
check('SEO recognition markers contain no empty marker', !/RECOGNITION_MARKERS\s*=\s*\[\s*['"]['"]/.test(seo));
check('SEO title logic contains no always-true empty includes check', !/\.includes\(\s*['"]['"]\s*\)/.test(seo));
check('global metadata contains no stale 90+/100+/107 tool claim', !/(90\+|100\+|107\s+tools)/i.test(layout));
check('global schema describes the focused PDF/image product', layout.includes('Merge PDF') && layout.includes('Protect PDF') && layout.includes('Repair PDF'));
check('retired conversion directory is absent from sitemap', !sitemap.includes("path: '/conversion-tools'"));
check('homepage does not expose a conversion category filter', !homepage.includes("id: 'conversion'"));
check('desktop navigation does not expose retired converter menu', !navbar.includes('ConvertMenu') && !navbar.includes('/conversion-tools'));
check('All Tools search suggestions stay within current product scope', !/Word to PDF|PDF to Word|scan text|image to text/i.test(allTools));

if (failures.length) {
  console.error('AJN PDF R20 FOCUSED SEO: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AJN PDF R20 FOCUSED SEO: PASS');
