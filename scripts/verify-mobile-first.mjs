import fs from 'node:fs';
const home=fs.readFileSync('src/app/page.tsx','utf8');
const hero=fs.readFileSync('src/components/landing/hero.tsx','utf8');
const mobileHero=fs.readFileSync('src/components/landing/mobile-home-hero.tsx','utf8');
const bottomNav=fs.readFileSync('src/components/landing/mobile-bottom-nav.tsx','utf8');
const grid=fs.readFileSync('src/components/landing/services-grid.tsx','utf8');
const css=fs.readFileSync('src/app/globals.css','utf8');
const checks=[
 ['single responsive hero is present before the tool directory',home.includes('<Hero />')&&home.indexOf('<Hero />')<home.indexOf('id="public-tools"')&&!home.includes('MobileHomeHero')],
 ['responsive hero exposes real tool routes',hero.includes('href="#public-tools"')&&hero.includes('href="/merge-pdf"')],
 ['hero presents focused maintained-tool message',hero.includes('All the PDF tools you need.')&&hero.includes('Simple, fast, focused.')&&hero.includes('BUILD_PUBLIC_TOOLS.length')],
 ['standalone mobile hero source is aligned if reused',mobileHero.includes('focused tools')&&mobileHero.includes('href="/merge-pdf"')&&!mobileHero.includes('/conversion-tools')],
 ['homepage contains one primary search id',(home.match(/id="home-tool-search"/g)||[]).length===1&&!home.includes('mobile-home-tool-search')],
 ['mobile search and filter controls remain sticky',home.includes('sticky top-[64px]')],
 ['mobile category state is accessible',home.includes('aria-pressed={activeCategory === category.id}')],
 ['focused filters include PDF, Edit, Organize, Security and Image',['pdf','edit','organize','security','image'].every(id=>home.includes(`id: '${id}'`))&&!home.includes("id: 'conversion'")],
 ['phone tool grid uses one full-width card per row',grid.includes('grid-cols-1 gap-2.5 sm:grid-cols-2')],
 ['phone cards stay compact and readable',/min-h-\[(?:8[0-9]|9[0-9])px\]/.test(grid)&&grid.includes('h-11 w-11')&&grid.includes('line-clamp-2')],
 ['all 27 tools are grouped without progressive hiding',['Core PDF Tools','Edit & Sign','Security & Recovery','Image Tools'].every(label=>grid.includes(label))&&!grid.includes('INITIAL_VISIBLE_TOOLS')&&!grid.includes('showMore')],
 ['search includes task aliases and typo-tolerant ranking',grid.includes('SEARCH_EXPANSIONS')&&grid.includes('distanceAtMostTwo')&&grid.includes('searchScore')],
 ['phone cards expose keyboard focus styling',grid.includes('focus-visible:ring-2')],
 ['bottom navigation uses only focused production directories',['/','/pdf-tools','/pdf-utilities','/image-tools'].every(route=>bottomNav.includes(`href: "${route}"`))&&!bottomNav.includes('/conversion-tools')],
 ['bottom navigation has four concise destinations',(bottomNav.match(/\{ label:/g)||[]).length===4],
 ['bottom navigation respects mobile safe area',css.includes('env(safe-area-inset-bottom)')],
 ['mobile page shell reserves bottom navigation space',css.includes('.ajn-page-shell { padding-bottom:5.35rem; }')]];
for(const[label,ok]of checks){if(!ok){console.error(`FAIL: ${label}`);process.exit(1)}console.log(`PASS: ${label}`)}
console.log('AJN PDF focused 27-tool mobile-first verification completed successfully.');
