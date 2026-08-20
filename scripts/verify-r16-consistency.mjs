import fs from 'node:fs';
const read=(f)=>fs.readFileSync(f,'utf8');
const failures=[]; const check=(label,ok)=>ok?console.log(`PASS: ${label}`):failures.push(label);
const next=read('next.config.ts'); const backend=read('src/lib/pdf-backend.ts'); const backendUrl=read('src/lib/backend-service-url.ts');
const policy=read('src/lib/tool-policy.ts'); const limits=read('src/lib/tool-limit-constants.ts'); const server=read('src/components/junction/ServerConversionTool.tsx');
const protect=read('src/components/junction/ProtectPdf.tsx'); const unlock=read('src/components/junction/UnlockPdf.tsx'); const repair=read('src/components/junction/RepairPdf.tsx');
const merge=read('src/components/junction/MergePdf.tsx'); const mergeEngine=read('src/lib/merge-pdf-browser.ts'); const workspace=read('src/components/junction/tool-workspace-client.tsx');
const audit=read('scripts/audit-r13-browser-layout.mjs'); const workflow=read('scripts/verify-backend-workflow.mjs'); const setup=read('R16_PRODUCTION_SETUP_AND_DEPLOY.ps1');
const docker=read('backend/Dockerfile'); const engine=read('backend/app/conversion_engine.py'); const pdfWorker=read('src/lib/pdfjs-worker.ts'); const packageJson=JSON.parse(read('package.json')); const workerSync=read('scripts/sync-pdfjs-worker.mjs');
const ocrAuto=read('backend/app/ocr_auto.py'); const jobWorker=read('backend/app/job_worker.py'); const ocrLanguageGate=read('backend/ocr_language_gate.py'); check('CSP and frontend use shared backend candidate resolver', next.includes('configuredPdfBackendCandidates') && backend.includes('configuredPdfBackendCandidates') && backendUrl.includes('NEXT_PUBLIC_AJN_PDF_API_URL') && backendUrl.includes('DEFAULT_PDF_BACKEND_URL'));

const conversions=read('src/lib/conversion-tools.ts');

const publicIds = JSON.parse(
  read('scripts/r13-public-tool-ids.json')
);
const publicIdSet = new Set(publicIds);
const retiredPublicOcrIds = ["ocr-advanced","ocr-scanner","ocr-searchable","scanned-pdf-to-text","scanned-pdf-to-word","scanned-pdf-to-searchable-pdf","image-to-searchable-pdf","image-to-text","image-to-word","handwriting-image-to-text","camera-scan-to-pdf","receipt-to-pdf","document-scanner-to-pdf"];

check(
  'public OCR/scanner product surface is retired',
  retiredPublicOcrIds.every((id)=>!publicIdSet.has(id)) &&
  retiredPublicOcrIds.every((id)=>!conversions.includes(`tool('${id}'`)) &&
  retiredPublicOcrIds.every((id)=>!policy.includes(`'${id}'`)) &&
  !fs.existsSync('src/components/junction/OcrScanner.tsx') &&
  !fs.existsSync('src/components/junction/OcrAdvanced.tsx') &&
  !fs.existsSync('src/components/junction/SearchablePdf.tsx') &&
  !fs.existsSync('src/lib/ocr') &&
  !Object.prototype.hasOwnProperty.call(
    packageJson.dependencies || {},
    'tesseract.js'
  )
);


check(
  'public OCR/scanner product surface is retired',
  retiredPublicOcrIds.every((id)=>!publicIdSet.has(id)) &&
  retiredPublicOcrIds.every((id)=>!conversions.includes(`tool('${id}'`)) &&
  retiredPublicOcrIds.every((id)=>!policy.includes(`'${id}'`)) &&
  !fs.existsSync('src/components/junction/OcrScanner.tsx') &&
  !fs.existsSync('src/components/junction/OcrAdvanced.tsx') &&
  !fs.existsSync('src/components/junction/SearchablePdf.tsx') &&
  !fs.existsSync('src/lib/ocr') &&
  !Object.prototype.hasOwnProperty.call(
    packageJson.dependencies || {},
    'tesseract.js'
  )
);

check('OCR worker centrally resolves script/language and validates text output', jobWorker.includes('resolve_ocr_options') && jobWorker.includes('spec.processor.startswith("ocr_")') && jobWorker.includes('validate_ocr_text_output') && ocrAuto.includes('MAX_AUTO_PROBES = 3') && ocrAuto.includes('image_to_osd') && ocrAuto.includes('validate_ocr_text_output') && ocrAuto.includes('OCR output quality check failed'));
check('Docker installs all Tesseract language/script packs and runtime gate enforces breadth', docker.includes('tesseract-ocr-all') && ocrLanguageGate.includes('MIN_ALL_LANGUAGE_MODELS = 50') && ocrLanguageGate.includes('REQUIRED_SCRIPT_MODELS'));
check('PDF.js worker is same-origin and generated from pinned local dependency', pdfWorker.includes("const PDF_WORKER_SRC = '/pdf.worker.min.mjs'") && !pdfWorker.includes('cdnjs.cloudflare.com') && workerSync.includes("pdfjs-dist', 'build', 'pdf.worker.min.mjs") && packageJson.scripts?.prebuild?.includes('sync-pdfjs-worker.mjs') && packageJson.scripts?.predev?.includes('sync-pdfjs-worker.mjs') && next.includes("worker-src 'self' blob:"));
check('server UI enforces live file/total limits without common limit copy', server.includes('validateBackendSelection') && server.includes('backendHealth') && server.includes('latestHealth') && !server.includes('liveLimits.maxFileSizeMb'));
check('Protect/Unlock/Repair recheck live server limits at action time', [protect,unlock,repair].every((s)=>s.includes('const latestHealth = await checkPdfBackendHealth()') && s.includes('resolveBackendLimits(latestHealth)') && s.includes('effectiveMaxMb') && s.includes('maxSizeMb: effectiveMaxMb')));
const cap=JSON.parse(read('src/generated/backend-capabilities.json')); check('capability snapshot matches no-OCR production contract', cap.toolCount===68 && cap.availableCount===68 && cap.unavailableCount===0);
check('workflow verifier follows candidate /ready implementation', workflow.includes('SERVICE_CANDIDATES') || workflow.includes('candidate}/ready'));
check('setup never changes PowerShell execution policy', !/Set-ExecutionPolicy/i.test(setup));
check('setup uses immutable npm ci and no npm install mutation', setup.includes('npm.cmd') && /\bci\b/.test(setup) && !/npm\.cmd[^\n]*install/i.test(setup));
check('browser audit captures exception descriptions and stacks', audit.includes('exception.description') && audit.includes('stackTrace') && audit.includes('lineNumber'));
check('Merge has no outer next/dynamic boundary', workspace.includes("import MergePdf from './MergePdf'") && !/['\"]merge-pdf['\"]\s*:\s*dynamic/.test(workspace));
check('Merge UI and acceptance share merge-pdf-browser helper', merge.includes('mergePdfFiles') && mergeEngine.includes("await import('pdf-lib')") && read('scripts/verify-r13-browser-pdf-acceptance.mjs').includes('merge-pdf-browser.ts'));
check('Merge limits have one source of truth', merge.includes('MERGE_PDF_LIMITS') && policy.includes('MERGE_PDF_LIMITS') && limits.includes('maxFiles: 30') && limits.includes('maxFileSizeMb: 50') && limits.includes('maxTotalSizeMb: 150'));
check('Merge source has no mojibake', !/[Ã¢Ã‚][â‚¬Â¦Â·]/.test(merge) && !merge.includes('Ã¢â‚¬Â¦') && !merge.includes('Ã‚Â·'));
const _aliasDirect=(next.match(/directLegacyToolRedirects/g)||[]).length; check('legacy redirect definitions are centralized', next.includes('legacyToolAliases') && next.includes('directLegacyToolRedirects') && !next.includes('AJN_R14_5_DIRECT_LEGACY_REDIRECTS'));
check('browser audit includes all canonical public route IDs', audit.includes('r13-public-tool-ids.json') && audit.includes('allToolRoutes'));
check('XPS is internal PyMuPDF, not mutool-gated', engine.includes('AJN_R14_7_XPS_PYMUPDF_START') && /xps-to-pdf[^\n]+None/.test(engine));
check('Docker acceptance runs non-root with headless Calibre sandbox retained', docker.includes('USER 10001') && docker.lastIndexOf('USER 10001') < docker.lastIndexOf('python full_acceptance_test.py') && docker.includes('QT_QPA_PLATFORM=offscreen') && docker.includes('QT_QUICK_BACKEND=software') && docker.includes('--disable-gpu') && !docker.includes('--no-sandbox') && !docker.includes('QTWEBENGINE_DISABLE_SANDBOX'));
if(failures.length){console.error('AJN PDF R16 CONSISTENCY: FAIL');failures.forEach((f)=>console.error(`- ${f}`));process.exit(1)}
console.log('AJN PDF R16 CONSISTENCY: PASS');
