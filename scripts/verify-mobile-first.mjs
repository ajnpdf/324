import fs from 'node:fs';
const home=fs.readFileSync('src/app/page.tsx','utf8');
const hero=fs.readFileSync('src/components/landing/hero.tsx','utf8');
const bottomNav=fs.readFileSync('src/components/landing/mobile-bottom-nav.tsx','utf8');
const grid=fs.readFileSync('src/components/landing/services-grid.tsx','utf8');
const css=fs.readFileSync('src/app/globals.css','utf8');
const checks=[
 ['single responsive hero is present before the tool directory',home.includes('<Hero />')&&home.indexOf('<Hero />')<home.indexOf('id="public-tools"')&&!home.includes('MobileHomeHero')],
 ['responsive hero exposes real tool routes',hero.includes('href="#public-tools"')&&hero.includes('href="/tools/merge-pdf"')],
 ['hero uses localized Work Smarter message',hero.includes("home.title1")&&hero.includes("home.title2")&&hero.includes("home.explore100")&&hero.includes("home.mobileSearchHint")],
 ['homepage contains one primary search id',(home.match(/id="home-tool-search"/g)||[]).length===1&&!home.includes('mobile-home-tool-search')],
 ['mobile category controls remain sticky',home.includes('sticky top-[64px]')],
 ['mobile category state is accessible',home.includes('aria-pressed={activeCategory === category.id}')],
 ['intent filters include OCR, Edit, Organize and Security',['filters.ocr','filters.edit','filters.organize','filters.security'].every(v=>home.includes(v))],
 ['phone tool grid uses one full-width card per row',grid.includes("'grid-cols-1 max-w-6xl mx-auto'")&&grid.includes("'grid-cols-1 md:grid-cols-2'")],
 ['phone cards stay compact and readable',grid.includes('min-h-[78px]')&&grid.includes('h-11 w-11')&&grid.includes('line-clamp-1')],
 ['desktop layout controls use Comfortable, Compact and List labels',grid.includes("home.layoutComfortable")&&grid.includes("home.layoutCompact")&&grid.includes("home.layoutList")&&grid.includes("localStorage.setItem('ajn-tool-view'")],
 ['search includes task aliases and typo-tolerant ranking',grid.includes('SEARCH_EXPANSIONS')&&grid.includes('distanceAtMostTwo')&&grid.includes('searchScore')],
 ['progressive mobile rendering starts with 18 tools',grid.includes('INITIAL_VISIBLE_TOOLS = 18')&&grid.includes('visibleTools=filteredTools.slice')&&grid.includes('home.showMoreTools')],
 ['off-screen cards use content-visibility',css.includes('.ajn-progressive-tool-card')&&css.includes('content-visibility: auto')],
 ['phone cards expose keyboard focus styling',grid.includes('focus-visible:ring-2')],
 ['bottom navigation uses only real production routes',['/','/pdf-tools','/conversion-tools','/image-tools','/pdf-utilities'].every(route=>bottomNav.includes(`href: "${route}"`))],
 ['bottom navigation respects mobile safe area',css.includes('env(safe-area-inset-bottom)')],
 ['mobile page shell reserves bottom navigation space',css.includes('.ajn-page-shell { padding-bottom:5.35rem; }')],
];
for(const[label,ok]of checks){if(!ok){console.error(`FAIL: ${label}`);process.exit(1)}console.log(`PASS: ${label}`)}
console.log('AJN PDF R10.8 mobile-first stability and progressive-rendering verification completed successfully.');
