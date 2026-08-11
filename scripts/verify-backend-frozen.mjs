import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const manifestPath = path.join(root, 'BACKEND_UNCHANGED_SHA256.txt');

if (!fs.existsSync(manifestPath)) {
  console.error('AJN PDF BACKEND FROZEN CHECK: FAIL');
  console.error(' - BACKEND_UNCHANGED_SHA256.txt is missing');
  process.exit(1);
}

const lines = fs.readFileSync(manifestPath, 'utf8').split(/\r?\n/);
const expected = new Map();
for (const line of lines) {
  const match = line.match(/^([a-f0-9]{64})\s{2}(backend\/.+)$/i);
  if (match) expected.set(match[2].replaceAll('\\', '/'), match[1].toLowerCase());
}

if (expected.size === 0) {
  console.error('AJN PDF BACKEND FROZEN CHECK: FAIL');
  console.error(' - No protected backend source files were found in the checksum manifest');
  process.exit(1);
}

const failures = [];
for (const [rel, hash] of expected) {
  const full = path.join(root, rel);
  if (!fs.existsSync(full)) {
    failures.push(`Missing protected backend source file ${rel}`);
    continue;
  }
  const actual = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
  if (actual !== hash) failures.push(`Changed protected backend source file ${rel}`);
}

// IMPORTANT:
// A production/local AJN PDF checkout legitimately contains runtime-generated backend
// artifacts such as backend/.venv, tessdata, SQLite databases, acceptance-test output,
// fixtures and __pycache__. They are intentionally NOT part of the frozen source
// checksum manifest and must not make a frontend-only release fail.
// The frontend updater separately refuses to stage anything under backend/.

if (failures.length) {
  console.error('AJN PDF BACKEND FROZEN CHECK: FAIL');
  failures.forEach((failure) => console.error(` - ${failure}`));
  process.exit(1);
}

console.log(
  `AJN PDF BACKEND FROZEN CHECK: PASS (${expected.size} protected source files unchanged; runtime artifacts ignored)`,
);
