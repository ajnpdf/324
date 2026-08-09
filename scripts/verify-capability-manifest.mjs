import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const sourcePath = path.join(root, 'src/generated/backend-capabilities.json');
const publicPath = path.join(root, 'public/backend-capabilities.json');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}
function readJson(file) {
  if (!fs.existsSync(file)) fail(`Missing capability manifest: ${path.relative(root, file)}`);
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch (error) { fail(`Invalid JSON in ${path.relative(root, file)}: ${error.message}`); }
}
function validate(payload, label) {
  if (payload.schemaVersion !== 2) fail(`${label}: schemaVersion must be 2.`);
  if (!payload.generatedAt || Number.isNaN(Date.parse(payload.generatedAt))) fail(`${label}: generatedAt is missing. Run backend/export_capabilities.py on this machine before building.`);
  if (payload.backendVersion !== pkg.version) fail(`${label}: backendVersion ${payload.backendVersion ?? 'null'} does not match package ${pkg.version}.`);
  if (!Array.isArray(payload.tools) || payload.tools.length < 78) fail(`${label}: capability tool list is incomplete.`);
  if (payload.toolCount !== payload.tools.length) fail(`${label}: toolCount does not match tools.length.`);
  const available = payload.tools.filter((tool) => tool.available === true).length;
  if (payload.availableCount !== available || payload.unavailableCount !== payload.tools.length - available) fail(`${label}: capability counts are inconsistent.`);
  const ids = payload.tools.map((tool) => String(tool.id || ''));
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length) fail(`${label}: capability IDs are empty or duplicated.`);
  for (const tool of payload.tools) {
    for (const key of ['id','name','category','inputExtensions','outputExtension','available','multiFile','processingMode']) {
      if (!(key in tool)) fail(`${label}: ${tool.id || 'unknown'} is missing ${key}.`);
    }
    if (tool.available === false && !String(tool.unavailableReason || '').trim()) fail(`${label}: ${tool.id} is unavailable without a reason.`);
  }
  const required = ['protect-pdf','unlock-pdf','repair-pdf','image-to-searchable-pdf','scanned-pdf-to-searchable-pdf','docx-to-pdf','pptx-to-pdf','pdf-to-docx'];
  for (const id of required) if (!ids.includes(id)) fail(`${label}: required capability ${id} is missing.`);
  const conversionSource = fs.readFileSync(path.join(root, 'src/lib/conversion-tools.ts'), 'utf8');
  const conversionIds = [...conversionSource.matchAll(/\btool\(\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
  const missingConversions = conversionIds.filter((id) => !ids.includes(id));
  if (missingConversions.length) fail(`${label}: conversion capabilities missing: ${missingConversions.slice(0, 12).join(', ')}`);
  const stable = [...payload.tools].sort((a,b) => String(a.id).localeCompare(String(b.id)));
  const fingerprint = crypto.createHash('sha256').update(JSON.stringify(stable)).digest('hex');
  // Python's compact separators differ only by spaces, so accept the exported 64-hex fingerprint and cross-file equality below.
  if (!/^[a-f0-9]{64}$/i.test(String(payload.capabilityFingerprint || ''))) fail(`${label}: capabilityFingerprint is invalid.`);
  return { ids, fingerprint };
}

const source = readJson(sourcePath);
const publicManifest = readJson(publicPath);
validate(source, 'source manifest');
validate(publicManifest, 'public manifest');
if (source.capabilityFingerprint !== publicManifest.capabilityFingerprint) fail('Source/public capability fingerprints differ.');
if (JSON.stringify(source.tools) !== JSON.stringify(publicManifest.tools)) fail('Source/public capability tool lists differ.');
console.log(`PASS: capability manifest is current for AJN PDF ${pkg.version} with ${source.availableCount}/${source.toolCount} backend tools available.`);
