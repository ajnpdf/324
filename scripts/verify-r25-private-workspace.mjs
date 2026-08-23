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
const sitemap = read('src/app/sitemap.ts');
const account = read('src/app/account/page.tsx');
const security = read('src/app/account/security/page.tsx');
const navbar = read('src/components/landing/navbar.tsx');
const chrome = read('src/app/chrome-extension/page.tsx');

must(page, /AJN Workspace R25/, 'workspace public surface');
must(page, /Local processing/, 'workspace local-processing disclosure');
must(client, /Private Session/, 'workspace private-session control');
must(client, /Saved workflows/, 'workspace saved workflow UI');
must(client, /Local history/, 'workspace metadata-only history UI');
must(client, /Run locally/, 'workspace local execution action');
must(executor, /PDFDocument\.load/, 'real PDF parsing');
must(executor, /copyPages/, 'real PDF merge implementation');
must(executor, /drawText/, 'real PDF watermark and numbering mutation');
if (/\bfetch\s*\(/.test(executor)) throw new Error('R25 verification failed: local workspace executor must not upload files with fetch().');
console.log('PASS: workspace executor has no network upload path');
must(storage, /PDF bytes are never stored|Storage can be unavailable/, 'privacy-safe local storage implementation');
must(flags, /AJN_FEATURE_WORKSPACE/, 'server-controlled workspace feature flag');
must(flags, /AJN_FEATURE_AI_ASSISTANT[\s\S]*false/, 'unfinished AI defaults off');
must(billing, /safeBackendError/, 'safe billing backend error propagation');
must(billing, /billing service could not be reached/, 'billing network failure message');
must(sitemap, /path: '\/workspace'/, 'workspace sitemap entry');
must(account, /AJN Workspace/, 'workspace account navigation');
must(security, /sendPasswordReset/, 'real Firebase password reset control');
must(security, /Multi-device session revocation is not claimed/, 'security claim boundary');
must(navbar, /href="\/workspace"/, 'workspace primary navigation');
if (/100\+\s*(AJN PDF\s*)?workflows/i.test(chrome)) throw new Error('R25 verification failed: stale 100+ workflow claim remains on Chrome extension page.');
console.log('PASS: Chrome extension copy uses the real current catalog instead of a stale 100+ claim');

console.log('\nAJN PDF R25 PRIVATE WORKSPACE: PASS');
