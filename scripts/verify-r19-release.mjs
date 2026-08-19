import fs from 'node:fs';
import path from 'node:path';
const file=path.join(process.cwd(),'reports/AJN_PUBLIC_RELEASE_INVENTORY.json');
if(!fs.existsSync(file)){console.error('FAIL: Run generate-r19-release-inventory.mjs first.');process.exit(1)}
const data=JSON.parse(fs.readFileSync(file,'utf8'));const routes=data.publicRoutes||[];const canonical=data.canonicalTools||[];
const duplicates=(items)=>{const ids=items.map(x=>x.id);return ids.filter((id,i)=>ids.indexOf(id)!==i)};
const routeDup=duplicates(routes),canonicalDup=duplicates(canonical);
if(routeDup.length||canonicalDup.length){console.error('FAIL: duplicate release IDs',{routeDup,canonicalDup});process.exit(1)}
if(routes.length<100){console.error(`FAIL: only ${routes.length} public routes; inventory is unexpectedly small.`);process.exit(1)}
if(canonical.length<90){console.error(`FAIL: only ${canonical.length} canonical processors; inventory is unexpectedly small.`);process.exit(1)}
const aliases=new Set((data.publicWorkspaceAliases||[]).map(x=>x.alias));for(const tool of canonical){if(aliases.has(tool.id)){console.error(`FAIL: alias counted as canonical processor: ${tool.id}`);process.exit(1)}}
console.log(`PASS: R19 release inventory — ${routes.length} public routes, ${canonical.length} canonical processors.`);
console.log('NOTE: Inventory integrity is NOT all-tool semantic/visual E2E proof.');
