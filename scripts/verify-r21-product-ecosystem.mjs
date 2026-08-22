import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const exists = (path) => fs.existsSync(path);
const failures = [];
const check = (label, condition) => condition ? console.log(`PASS: ${label}`) : failures.push(label);

const policy = read('src/lib/tool-policy.ts');
const hero = read('src/components/landing/hero.tsx');
const page = read('src/app/page.tsx');
const cards = read('src/components/landing/services-grid.tsx');
const navbar = read('src/components/landing/navbar.tsx');
const mobileNav = read('src/components/landing/mobile-bottom-nav.tsx');
const layout = read('src/app/layout.tsx');
const next = read('next.config.ts');
const auth = read('src/lib/auth-context.tsx');
const firebaseRest = read('src/lib/firebase-rest.ts');
const firebaseToken = read('src/lib/firebase-token.ts');
const adminProxy = read('src/app/api/account/admin-analytics/route.ts');
const pricing = read('src/app/pricing/page.tsx');
const developer = read('src/app/developers/page.tsx');
const androidBuild = read('scripts/R21_BUILD_ANDROID.ps1');
const finalProduction = read('scripts/R21_FINAL_PRODUCTION.ps1');
const assetLinks = read('src/app/.well-known/assetlinks.json/route.ts');
const publicIds = JSON.parse(read('scripts/r13-public-tool-ids.json'));

const allowlist = policy.match(/PRODUCTION_PUBLIC_TOOL_IDS = new Set\(\[([\s\S]*?)\]\);/)?.[1] || '';
const ids = [...allowlist.matchAll(/'([^']+)'/g)].map((m) => m[1]);
const movedImageIds = ['image-reducer','image-resizer','crop-image','rotate-image','watermark-image','flip-image','convert-image'];

check('R21 exposes exactly 20 PDF-only public tool IDs', ids.length === 20 && new Set(ids).size === 20 && publicIds.length === 20 && movedImageIds.every((id) => !ids.includes(id)));
check('homepage hero is simple and removes old demo marketing', hero.includes('Free Online') && hero.includes('PDF Tools') && !/27 focused|Workspace preview|Report\.pdf|Proposal\.pdf|Statement\.pdf/i.test(hero));
check('homepage filters are PDF-only', !page.includes("id: 'image'") && !page.includes("id: 'conversion'") && page.includes("id: 'security'"));
check('tool cards are enlarged for the focused directory', cards.includes("min-h-[156px]") && cards.includes('sm:h-16 sm:w-16') && !cards.includes("title: 'Image Tools'"));
check('header exposes product ecosystem and account surfaces', ['Pricing','AJN Desktop','AJN Mobile','AJN Sign','AJN API','AJN IMG','/login','/signup'].every((value) => navbar.includes(value)));
check('mobile navigation no longer exposes image directory', !mobileNav.includes('/image-tools') && mobileNav.includes('/sign-pdf') && mobileNav.includes('/account'));
check('Firebase auth provider is mounted globally', layout.includes('<AuthProvider>') && layout.includes('accounts.google.com/gsi/client'));
check('Firebase auth REST flow covers signup, login, reset, Google and refresh', ['accounts:signUp','accounts:signInWithPassword','accounts:sendOobCode','accounts:signInWithIdp','securetoken.googleapis.com'].every((value) => firebaseRest.includes(value)));
check('account session handles refresh and plan claims', auth.includes('refreshFirebaseSession') && auth.includes("'premium'") && auth.includes("'business'"));
check('server verifies Firebase token before admin analytics', firebaseToken.includes('securetoken.google.com') && firebaseToken.includes('Firebase token signature is invalid') && adminProxy.includes('verifyFirebaseIdToken') && adminProxy.includes('AJN_ANALYTICS_ADMIN_TOKEN'));
check('admin secret is not exposed through NEXT_PUBLIC variables', !adminProxy.includes('NEXT_PUBLIC_AJN_ADMIN') && !firebaseToken.includes('NEXT_PUBLIC_AJN_ADMIN'));
check('pricing is billing-link gated instead of inventing checkout', pricing.includes('AJN_BILLING_URL') && pricing.includes('Billing link not configured yet'));
check('developer page exposes existing API v1 contract', developer.includes('/api/v1/status') && developer.includes('/api/v1/capabilities') && developer.includes('/api/v1/convert/{tool_id}') && developer.includes('/api/v1/sign/electronic'));
check('image routes are redirected to AJN IMG handoff', next.includes('imageToolRedirects') && next.includes("destination: '/img'"));
check('Firebase and Windows/Android setup assets exist', ['firebase.json','firestore.rules','firestore.indexes.json','.env.r21.example','scripts/R21_FIREBASE_SETUP.ps1','scripts/R21_CREATE_API_KEY.ps1','scripts/R21_BUILD_ANDROID.ps1','scripts/R21_SETUP_ALL.ps1','scripts/R21_FINAL_PRODUCTION.ps1'].every(exists));
check('Android build verifies explicit package identity and signer fingerprint', androidBuild.includes('ExpectedPackageId') && androidBuild.includes('twa-manifest.json') && androidBuild.includes('keytool -printcert -jarfile') && androidBuild.includes('R21_ANDROID_BUILD.json'));
check('Digital Asset Links are server-configured without public secrets', assetLinks.includes('AJN_ANDROID_PACKAGE_ID') && assetLinks.includes('AJN_ANDROID_SHA256_FINGERPRINTS') && assetLinks.includes('delegate_permission/common.handle_all_urls') && !assetLinks.includes('NEXT_PUBLIC_'));
check('final production helper removes billing and uses stderr-safe Vercel commands', finalProduction.includes("Set-LocalEnvValue 'NEXT_PUBLIC_AJN_BILLING_URL' ''") && finalProduction.includes("vercel@latest env rm NEXT_PUBLIC_AJN_BILLING_URL") && finalProduction.includes('$env:ComSpec') && finalProduction.includes('2>&1'));
check('final production helper synchronizes admin token and verifies live R21', finalProduction.includes('AJN_ANALYTICS_ADMIN_TOKEN') && finalProduction.includes('gcloud run services update') && finalProduction.includes('https://www.ajnpdf.com/') && finalProduction.includes('3.2.0-r21'));
check('ecosystem product pages exist', ['src/app/account/page.tsx','src/app/admin/page.tsx','src/app/pricing/page.tsx','src/app/desktop/page.tsx','src/app/mobile/page.tsx','src/app/sign/page.tsx','src/app/developers/page.tsx','src/app/img/page.tsx'].every(exists));

if (failures.length) {
  console.error('AJN PDF R21 PRODUCT ECOSYSTEM: FAIL');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}
console.log('AJN PDF R21 PRODUCT ECOSYSTEM: PASS');
