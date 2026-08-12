import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync('package.json','utf8')); const lock=JSON.parse(fs.readFileSync('package-lock.json','utf8')); const failures=[];
const check=(label,ok)=>ok?console.log(`PASS: ${label}`):failures.push(label);
const nextSpec=String(pkg.dependencies?.next||''); const nextLock=String(lock.packages?.['node_modules/next']?.version||'');
const eslintSpec=String(pkg.devDependencies?.['eslint-config-next']||''); const eslintLock=String(lock.packages?.['node_modules/eslint-config-next']?.version||'');
const numeric=(v)=>/^\d+\.\d+\.\d+(?:[-+].*)?$/.test(v);
const triple=(v)=>{const m=String(v).replace(/^[~^]/,'').match(/^(\d+)\.(\d+)\.(\d+)/);return m?m.slice(1).map(Number):null};
const gte=(a,b)=>a[0]>b[0]||(a[0]===b[0]&&(a[1]>b[1]||(a[1]===b[1]&&a[2]>=b[2])));
const allows=(spec,version)=>{const base=triple(spec),resolved=triple(version);if(!base||!resolved)return false;if(spec.startsWith('^'))return resolved[0]===base[0]&&gte(resolved,base);if(spec.startsWith('~'))return resolved[0]===base[0]&&resolved[1]===base[1]&&gte(resolved,base);return spec===version};
check('AJN PDF package version is 3.1.0',pkg.version==='3.1.0');
check('Next.js dependency uses an explicit semver range/version',/^\^?~?\d+\.\d+\.\d+/.test(nextSpec)&&!/[xX*]|latest/.test(nextSpec));
check('Lockfile resolves a concrete Next.js version compatible with package intent',numeric(nextLock)&&allows(nextSpec,nextLock));
check('eslint-config-next uses an explicit semver version',/^\^?~?\d+\.\d+\.\d+/.test(eslintSpec)&&!/[xX*]|latest/.test(eslintSpec));
check('Lockfile resolves a concrete eslint-config-next version',numeric(eslintLock));
const allow=pkg.allowScripts??{};
check('Native install scripts are explicitly reviewed',allow['sharp@0.34.5']===true&&allow['unrs-resolver@1.11.1']===true);
check('Non-essential donation/postinstall scripts are explicitly denied',allow['core-js']===false&&allow['tesseract.js']===false);
if(failures.length){console.error('FAIL: dependency policy verification failed:');for(const f of failures)console.error(`- ${f}`);process.exit(1)}
console.log(`AJN PDF dependency policy verification completed successfully (Next ${nextLock}; eslint-config-next ${eslintLock}).`);
