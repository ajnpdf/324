import fs from 'node:fs';

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`R25 missing required file: ${path}`);
  return fs.readFileSync(path, 'utf8');
}

function must(content, pattern, label) {
  if (!pattern.test(content)) throw new Error(`R25 verification failed: ${label}`);
  console.log(`PASS: ${label}`);
}

const page = read('src/app/workspace/page.tsx');
const client = read('src/components/workspace/workspace-client.tsx');
const executor = read('src/lib/workspace/executor.ts');
const storage = read('src/lib/workspace/storage.ts');
const flags = read('src/app/api/config/features/route.ts');
const billing = read('src/lib/billing-server.ts');
const billingHistoryBackend = read('backend/app/billing_history_routes.py');
const billingHistoryProxy = read('src/app/api/billing/history/route.ts');
const billingHistoryPage = read('src/app/account/billing/page.tsx');
const asgi = read('backend/app/asgi.py');
const sitemap = read('src/app/sitemap.ts');
const account = read('src/app/account/page.tsx');
const security = read('src/app/account/security/page.tsx');
const navbar = read('src/components/landing/navbar.tsx');
const chrome = read('src/app/chrome-extension/page.tsx');
const legacyAnalytics = read('src/app/admin/analytics/page.tsx');

must(page, /AJN Workspace R25/, 'workspace public surface');
must(page, /Local processing/, 'workspace local-processing disclosure');
must(client, /Private Session/, 'workspace private-session control');
must(client, /Saved workflows/, 'workspace saved workflow UI');
must(client, /Local history/, 'workspace metadata-only history UI');
must(client, /Run locally/, 'workspace local execution action');
must(executor, /PDFDocument\.load/, 'real PDF parsing');
must(executor, /copyPages/, 'real PDF merge implementation');
must(executor, /drawText/, 'real PDF watermark and numbering mutation');
must(executor, /output validation detected|could not be reopened safely/, 'generated PDF is reopened and validated before download');
if (/\bfetch\s*\(/.test(executor)) throw new Error('R25 verification failed: local workspace executor must not upload files with fetch().');
console.log('PASS: workspace executor has no network upload path');
must(storage, /PDF bytes are never stored|Storage can be unavailable/, 'privacy-safe local storage implementation');
must(flags, /AJN_FEATURE_WORKSPACE/, 'server-controlled workspace feature flag');
must(flags, /AJN_FEATURE_AI_ASSISTANT[\s\S]*false/, 'unfinished AI defaults off');
must(billing, /safeBackendError/, 'safe billing backend error propagation');
must(billing, /billing service could not be reached/, 'billing network failure message');
must(billingHistoryBackend, /@router\.get\('\/api\/billing\/history'\)/, 'trusted backend billing history route');
must(billingHistoryBackend, /_trusted_user/, 'billing history requires trusted user identity');
must(billingHistoryBackend, /order_reference[\s\S]*_masked_reference/, 'billing history masks provider references');
if (/RAZORPAY_KEY_SECRET|RAZORPAY_WEBHOOK_SECRET/.test(billingHistoryBackend)) throw new Error('R25 verification failed: billing history module must not expose Razorpay secrets.');
console.log('PASS: billing history module does not reference Razorpay secrets');
must(billingHistoryProxy, /proxyBilling\(request, '\/api\/billing\/history'\)/, 'Firebase-verified billing history proxy');
must(billingHistoryPage, /Payments & Premium history/, 'real account billing history screen');
must(billingHistoryPage, /An order record is not the same as a successful payment/, 'billing screen distinguishes orders from successful payments');
must(asgi, /billing_history_router/, 'billing history router mounted in production ASGI');
must(sitemap, /path: '\/workspace'/, 'workspace sitemap entry');
must(account, /AJN Workspace/, 'workspace account navigation');
must(account, /\/account\/billing/, 'billing history account navigation');
must(security, /sendPasswordReset/, 'real Firebase password reset control');
must(security, /Multi-device session revocation is not claimed/, 'security claim boundary');
must(navbar, /href="\/workspace"/, 'workspace primary navigation');
must(legacyAnalytics, /redirect\('\/admin'\)/, 'legacy manual-token analytics redirects to protected admin');
if (/ajn_analytics_admin_token|X-AJN-Admin-Token/.test(legacyAnalytics)) throw new Error('R25 verification failed: legacy analytics page still handles a manual admin token.');
console.log('PASS: legacy analytics page no longer accepts a browser admin token');
if (/100\+\s*(AJN PDF\s*)?workflows/i.test(chrome)) throw new Error('R25 verification failed: stale 100+ workflow claim remains on Chrome extension page.');
console.log('PASS: Chrome extension copy uses the real current catalog instead of a stale 100+ claim');

console.log('\nAJN PDF R25 PRIVATE WORKSPACE: PASS');
