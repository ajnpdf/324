import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'reports/AJN_PUBLIC_RELEASE_INVENTORY.json');
if (!fs.existsSync(file)) {
  console.error('FAIL: Run generate-r19-release-inventory.mjs first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const routes = data.publicRoutes || [];
const canonical = data.canonicalTools || [];
const aliases = data.publicWorkspaceAliases || [];

const duplicates = (items) => {
  const ids = items.map((item) => item.id);
  return ids.filter((id, index) => ids.indexOf(id) !== index);
};
const routeDup = duplicates(routes);
const canonicalDup = duplicates(canonical);
if (routeDup.length || canonicalDup.length) {
  console.error('FAIL: duplicate release IDs', { routeDup, canonicalDup });
  process.exit(1);
}

if (routes.length !== 97) {
  console.error(`FAIL: expected exactly 97 public routes; got ${routes.length}.`);
  process.exit(1);
}
if (canonical.length !== 96) {
  console.error(`FAIL: expected exactly 96 canonical processors; got ${canonical.length}.`);
  process.exit(1);
}
if (aliases.length !== 1) {
  console.error(`FAIL: expected exactly 1 public workspace alias; got ${aliases.length}.`);
  process.exit(1);
}
if (routes.length !== canonical.length + aliases.length) {
  console.error('FAIL: route/canonical/alias accounting mismatch.');
  process.exit(1);
}
if (data.publicRouteCount !== routes.length || data.canonicalProcessorCount !== canonical.length) {
  console.error('FAIL: generated count fields do not match inventory arrays.');
  process.exit(1);
}
if (!routes.some((item) => item.id === 'png-to-pdf' && item.processing === 'temporary-server')) {
  console.error('FAIL: PNG to PDF must remain public and use temporary-server processing.');
  process.exit(1);
}

console.log(`PASS: R19 release inventory — ${routes.length} public routes, ${canonical.length} canonical processors, ${aliases.length} alias.`);
console.log('PASS: backend-only public conversion routes remain represented in release accounting.');
console.log('NOTE: Inventory integrity is not all-tool semantic/visual E2E proof.');
