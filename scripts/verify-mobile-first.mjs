import fs from 'node:fs';
const home=fs.readFileSync('src/app/page.tsx','utf8');
const hero=fs.readFileSync('src/components/landing/mobile-home-hero.tsx','utf8');
const bottomNav=fs.readFileSync('src/components/landing/mobile-bottom-nav.tsx','utf8');
const grid=fs.readFileSync('src/components/landing/services-grid.tsx','utf8');
const css=fs.readFileSync('src/app/globals.css','utf8');
const checks=[
 ['compact mobile hero is present before the tool directory',home.includes('<MobileHomeHero />')&&home.indexOf('<MobileHomeHero />')<home.indexOf('id="public-tools"')],
 ['mobile hero exposes real tool routes',hero.includes('href="/pdf-tools"')&&hero.includes('href="/conversion-tools"')],
 ['mobile hero uses localized Work Smarter message',hero.includes("home.title1")&&hero.includes("home.title2")&&hero.includes("home.explore100")&&hero.includes("home.mobileSearchHint")],
 ['mobile tool directory follows the hero without duplicate navbar spacing',home.includes('pt-4 md:px-8 md:py-28')],
 ['mobile search is present',home.includes('mobile-home-tool-search')],
 ['mobile category controls remain sticky',home.includes('sticky top-[72px]')],
 ['mobile category state is accessible',home.includes('aria-pressed={activeCategory === category.id}')],
 ['intent filters include OCR, Edit, Organize and Security', ['filters.ocr','filters.edit','filters.organize','filters.security'].every(v=>home.includes(v))],
 ['phone tool grid uses one full-width horizontal card per row',grid.includes("'grid-cols-1 max-w-6xl mx-auto'")&&grid.includes("'grid-cols-1 md:grid-cols-2'")],
 ['phone cards stay compact and readable',grid.includes('min-h-[78px]')&&grid.includes('h-11 w-11')&&grid.includes('line-clamp-1')],
 ['desktop layout controls use Comfortable, Compact and List labels',grid.includes("home.layoutComfortable")&&grid.includes("home.layoutCompact")&&grid.includes("home.layoutList")&&grid.includes("localStorage.setItem('ajn-tool-view'")],
 ['search includes task aliases and typo-tolerant ranking',grid.includes('SEARCH_EXPANSIONS')&&grid.includes('distanceAtMostTwo')&&grid.includes('searchScore')],
 ['phone cards expose keyboard focus styling',grid.includes('focus-visible:ring-2')],
 ['bottom navigation uses only real production routes',['/','/pdf-tools','/conversion-tools','/image-tools','/pdf-utilities'].every(route=>bottomNav.includes(`href: "${route}"`))],
 ['bottom navigation respects mobile safe area',css.includes('env(safe-area-inset-bottom)')],
 ['mobile page shell reserves bottom navigation space',css.includes('.ajn-page-shell { padding-bottom:5.35rem; }')],
];
for(const[label,ok]of checks){if(!ok){console.error(`FAIL: ${label}`);process.exit(1)}console.log(`PASS: ${label}`)}
console.log('AJN PDF R9 mobile-first discovery and adaptive-layout verification completed successfully.');
