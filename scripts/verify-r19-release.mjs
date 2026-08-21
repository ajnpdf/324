import fs from 'node:fs';
import path from 'node:path';

const file=path.join(process.cwd(),'reports/AJN_PUBLIC_RELEASE_INVENTORY.json');

if(!fs.existsSync(file)){
  console.error('FAIL: Run generate-r19-release-inventory.mjs first.');
  process.exit(1);
}

const data=JSON.parse(fs.readFileSync(file,'utf8'));
const routes=data.publicRoutes||[];
const canonical=data.canonicalTools||[];
const aliases=data.publicWorkspaceAliases||[];

const retired=new Set(["-scanner"]);
const duplicates=(items)=>{
  const ids=items.map(x=>x.id);
  return ids.filter((id,i)=>ids.indexOf(id)!==i);
};

const routeDup=duplicates(routes);
const canonicalDup=duplicates(canonical);

if(routeDup.length||canonicalDup.length){
  console.error('FAIL: duplicate release IDs',{routeDup,canonicalDup});
  process.exit(1);
}

const leakedRoutes=routes.filter(x=>retired.has(x.id));
const leakedCanonical=canonical.filter(x=>retired.has(x.id));

if(leakedRoutes.length||leakedCanonical.length){
  console.error('FAIL: retired /scanner tools remain public',{
    routes: leakedRoutes.map(x=>x.id),
    canonical: leakedCanonical.map(x=>x.id),
  });
  process.exit(1);
}

if(routes.length!==97){
  console.error(`FAIL: expected exactly 97 public routes after  retirement; got ${routes.length}.`);
  process.exit(1);
}

if(canonical.length!==96){
  console.error(`FAIL: expected exactly 96 canonical processors after  retirement; got ${canonical.length}.`);
  process.exit(1);
}

if(aliases.length!==1){
  console.error(`FAIL: expected exactly 1 public workspace alias; got ${aliases.length}.`);
  process.exit(1);
}

if(routes.length!==canonical.length+aliases.length){
  console.error('FAIL: route/canonical/alias accounting mismatch.');
  process.exit(1);
}

console.log(`PASS: no- R19 release inventory — ${routes.length} public routes, ${canonical.length} canonical processors, ${aliases.length} alias.`);
console.log('PASS: retired /scanner IDs are absent from the public release inventory.');
console.log('NOTE: Inventory integrity is NOT all-tool semantic/visual E2E proof.');
