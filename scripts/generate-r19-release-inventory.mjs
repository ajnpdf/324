import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const policy = read('src/lib/tool-policy.ts');
const conversions = read('src/lib/conversion-tools.ts');
const workspace = read('src/components/junction/tool-workspace-client.tsx');
const quoted = (block) => [...block.matchAll(/'([^']+)'/g)].map((match) => match[1]);

function setBlock(name) {
  const match = new RegExp(`const ${name} = new Set\\(\\[([\\s\\S]*?)\\]\\);`).exec(policy);
  return match ? quoted(match[1]) : [];
}

const stable = setBlock('stableBrowserIds');
const policyLegacy = setBlock('legacyAliasIds');
const backendExplicit = setBlock('backendIds');
const visibleMatch = /const visibleLimited = new Set\(\[([\s\S]*?)\]\);/.exec(policy);
const visibleLimited = visibleMatch ? quoted(visibleMatch[1]) : [];
const conversionIds = [...conversions.matchAll(/tool\('([^']+)'/g)].map((match) => match[1]);
const aliasBlock = /const SERVER_ALIASES:\s*Record<string,\s*string>\s*=\s*\{([\s\S]*?)\};/.exec(workspace);
const workspaceAliasPairs = aliasBlock ? [...aliasBlock[1].matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)].map((match) => [match[1], match[2]]) : [];
const workspaceAliases = new Map(workspaceAliasPairs);

// backendIds contains explicit backend-only public routes plus a spread of the
// conversion registry. Include its literal IDs here so a public route can move
// from browser processing to backend processing without disappearing from the
// release inventory.
const backendRouteIds = [...new Set([...backendExplicit, ...conversionIds])];
const publicRouteIds = [...new Set([...stable, ...visibleLimited, ...conversionIds, ...backendExplicit])]
  .filter((id) => !policyLegacy.includes(id))
  .sort();
const canonicalIds = publicRouteIds.filter((id) => !workspaceAliases.has(id)).sort();
const processing = (id) => backendRouteIds.includes(id) ? 'temporary-server' : 'browser';
const releaseClass = (id) => conversionIds.includes(id)
  ? 'conversion'
  : id === 'sign-pdf'
    ? 'signature'
    : backendExplicit.includes(id)
      ? 'backend'
      : 'utility';

const canonicalTools = canonicalIds.map((id) => ({
  id,
  route: `/${id}`,
  processing: processing(id),
  releaseClass: releaseClass(id),
}));
const publicRoutes = publicRouteIds.map((id) => ({
  id,
  route: `/${id}`,
  canonicalId: workspaceAliases.get(id) || id,
  alias: workspaceAliases.has(id),
  processing: processing(workspaceAliases.get(id) || id),
}));

fs.mkdirSync(path.join(root, 'reports'), { recursive: true });
const output = {
  generatedAt: new Date().toISOString(),
  publicRouteCount: publicRoutes.length,
  canonicalProcessorCount: canonicalTools.length,
  policyLegacyAliasesHidden: policyLegacy.sort(),
  publicWorkspaceAliases: [...workspaceAliases.entries()]
    .filter(([alias]) => publicRouteIds.includes(alias))
    .map(([alias, canonicalId]) => ({ alias, canonicalId }))
    .sort((a, b) => a.alias.localeCompare(b.alias)),
  publicRoutes,
  canonicalTools,
};
fs.writeFileSync(path.join(root, 'reports/AJN_PUBLIC_RELEASE_INVENTORY.json'), JSON.stringify(output, null, 2));
console.log(`AJN R19 public routes: ${output.publicRouteCount}`);
console.log(`AJN R19 canonical processors: ${output.canonicalProcessorCount}`);
console.log(`AJN R19 public workspace aliases: ${output.publicWorkspaceAliases.length}`);
console.log('Wrote reports/AJN_PUBLIC_RELEASE_INVENTORY.json');
