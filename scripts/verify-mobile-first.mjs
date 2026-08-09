import fs from 'node:fs';

const home = fs.readFileSync('src/app/page.tsx', 'utf8');
const grid = fs.readFileSync('src/components/landing/services-grid.tsx', 'utf8');
const checks = [
  ['mobile hero is removed from first viewport', home.includes('hidden md:block') && home.indexOf('id="public-tools"') > home.indexOf('hidden md:block')],
  ['mobile heading is compact while desktop keeps the directory heading', home.includes("<span>{t('common.tools')}</span>") && home.includes('md:hidden') && home.includes('hidden text-6xl')],
  ['tool directory starts below fixed navbar on phones', home.includes('pt-[76px]')],
  ['mobile search is present', home.includes('mobile-home-tool-search')],
  ['mobile category controls are sticky across the tool section', home.includes('sticky top-[72px]') && home.indexOf('sticky top-[72px]') > home.indexOf('</div>\n\n          <div className="sticky') - 100],
  ['mobile category state is accessible', home.includes('aria-pressed={activeCategory === category.id}')],
  ['phone tool grid uses two columns', grid.includes('grid-cols-2')],
  ['phone cards use compact content', grid.includes('line-clamp-3') && grid.includes('text-[12px]')],
];
for (const [label, ok] of checks) {
  if (!ok) { console.error(`FAIL: ${label}`); process.exit(1); }
  console.log(`PASS: ${label}`);
}
console.log('AJN PDF mobile-first homepage verification completed successfully.');
