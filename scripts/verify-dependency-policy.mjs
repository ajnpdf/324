import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const lock = JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const failures=[];
const check=(label,ok)=>ok?console.log(`PASS: ${label}`):failures.push(label);
check('AJN PDF package version is 3.1.0', pkg.version === '3.1.0');
check('Next.js maintenance security version is installed and pinned', pkg.dependencies?.next === '15.5.21');
check('Lockfile resolves Next.js 15.5.21', lock.packages?.['node_modules/next']?.version === '15.5.21');
check('eslint-config-next maintenance version is aligned', pkg.devDependencies?.['eslint-config-next'] === '15.5.20');
check('Lockfile resolves eslint-config-next 15.5.20', lock.packages?.['node_modules/eslint-config-next']?.version === '15.5.20');
const allow = pkg.allowScripts ?? {};
check('Native install scripts are explicitly reviewed', allow['sharp@0.34.5'] === true && allow['unrs-resolver@1.11.1'] === true);
check('Non-essential donation/postinstall scripts are explicitly denied', allow['core-js'] === false && allow['tesseract.js'] === false);
if(failures.length){console.error('FAIL: dependency policy verification failed:'); for(const f of failures) console.error(`- ${f}`); process.exit(1)}
console.log('AJN PDF dependency policy verification completed successfully.');
