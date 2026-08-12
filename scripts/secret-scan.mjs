import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const skipDirs = new Set(['node_modules', '.next', '.git', '.venv', '__pycache__']);
const forbiddenNames = new Set([
  '.env.local',
  'ajn_analytics.sqlite3',
  'ajn_public_media.sqlite3',
  'FULL_ACCEPTANCE_RESULTS.json',
  'HTTP_ACCEPTANCE_RESULTS.json',
]);
const allowedTextExt = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.py', '.ps1', '.md', '.txt',
  '.yml', '.yaml', '.css', '.html', '.toml', '.ini', '.gitignore',
]);
const patterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:AJN_ANALYTICS_ADMIN_TOKEN|AJN_MEDIA_ADMIN_TOKEN)\s*=\s*(?!\$|<|CHANGE|REPLACE|your-|generate-|$)[A-Za-z0-9_\-+/=]{20,}/i,
  /(?:password|passwd|secret|api[_-]?key)\s*[:=]\s*["']?[A-Za-z0-9_\-+/=]{24,}["']?/i,
  /postgres(?:ql)?:\/\/[^\s:]+:[^\s@]+@/i,
  /redis:\/\/[^\s:]+:[^\s@]+@/i,
  /vercel_blob_rw_[A-Za-z0-9_\-]{20,}/i,
];

const findings = [];

function normalizeRel(file) {
  return path.relative(root, file).replaceAll('\\', '/');
}

function inspectFile(file, rel) {
  const name = path.basename(file);
  if (forbiddenNames.has(name)) {
    findings.push(`${rel}: generated/runtime file must not be Git-tracked or shipped`);
    return;
  }
  if (!allowedTextExt.has(path.extname(name).toLowerCase()) && name !== '.gitignore') return;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return; }
  for (const pattern of patterns) {
    if (pattern.test(text)) findings.push(`${rel}: matches ${pattern}`);
  }
}

function getTrackedFiles() {
  try {
    const output = execFileSync('git', ['ls-files', '-z'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output.split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

function walkRelease(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(ent.name)) continue;
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkRelease(file);
      continue;
    }
    inspectFile(file, normalizeRel(file));
  }
}

const tracked = getTrackedFiles();
if (tracked) {
  // In an installed Git checkout, local .env files, SQLite databases and acceptance
  // outputs are expected runtime artifacts. They are deliberately excluded unless
  // somebody accidentally adds them to Git. Every Git-tracked source file is still
  // scanned for credential-like content.
  for (const relRaw of tracked) {
    const rel = relRaw.replaceAll('\\', '/');
    const file = path.join(root, ...rel.split('/'));
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
    inspectFile(file, rel);
  }
} else {
  // A release/archive has no .git directory, so scan the complete package and reject
  // runtime artifacts outright. This keeps distributable ZIPs clean.
  walkRelease(root);
}

if (findings.length) {
  console.error('FAIL: potential secrets/runtime artifacts found:\n' + findings.slice(0, 30).join('\n'));
  process.exit(1);
}

console.log(tracked
  ? `PASS: ${tracked.length} Git-tracked files scanned for accidental secrets; untracked local runtime artifacts ignored.`
  : 'PASS: release source secret/runtime-artifact scan is clean.');
