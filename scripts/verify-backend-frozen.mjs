import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const manifestPath = path.join(root, 'BACKEND_UNCHANGED_SHA256.txt');
const lines = fs.readFileSync(manifestPath, 'utf8').split(/\r?\n/);
const expected = new Map();
for (const line of lines) {
  const match = line.match(/^([a-f0-9]{64})\s{2}(backend\/.+)$/i);
  if (match) expected.set(match[2].replaceAll('\\','/'), match[1].toLowerCase());
}
const failures = [];
for (const [rel, hash] of expected) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) { failures.push(`Missing ${rel}`); continue; }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  if (actual !== hash) failures.push(`Changed ${rel}`);
}
const actualFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else actualFiles.push(path.relative(root, full).replaceAll('\\','/'));
  }
}
walk(path.join(root, 'backend'));
for (const rel of actualFiles) if (!expected.has(rel)) failures.push(`Unexpected backend file ${rel}`);
if (failures.length) {
  console.error('AJN PDF BACKEND FROZEN CHECK: FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}
console.log(`AJN PDF BACKEND FROZEN CHECK: PASS (${expected.size} files unchanged)`);
