import fs from 'node:fs';

const failures = [];
const check = (label, condition) => condition ? console.log(`PASS: ${label}`) : failures.push(label);
const read = (file) => fs.readFileSync(file, 'utf8');

const pkg = JSON.parse(read('package.json'));
const main = read('backend/app/main.py');
const engine = read('backend/app/conversion_engine.py');
const worker = read('backend/app/job_worker.py');
const httpAcceptance = read('backend/http_acceptance_test.py');
const frontend = read('src/lib/pdf-backend.ts');
const serverTool = read('src/components/junction/ServerConversionTool.tsx');
const setup = read('SETUP_FULL_PRODUCTION.ps1');
const packageScript = read('PACKAGE_PRODUCTION.ps1');
const secretScan = read('scripts/secret-scan.mjs');

check('Backend workflow release version is 3.1.0', pkg.version === '3.1.0' && main.includes('VERSION = "3.1.0"'));
check('Uploads stream to disk in bounded chunks', main.includes('async def _save_upload') && main.includes('await upload.read(1024 * 1024)') && !main.includes('await upload.read(MAX_FILE_BYTES + 1)'));
check('Per-file and combined upload limits remain enforced', main.includes('MAX_FILE_BYTES') && main.includes('MAX_TOTAL_BYTES') && main.includes('combined upload size exceeds'));
check('File-count and options payload limits are enforced', main.includes('MAX_UPLOAD_FILES') && main.includes('Too many source files') && main.includes('Form(max_length=20000)'));
check('Content validation runs before converter execution', main.includes('validate_input_files(spec, input_paths)') && engine.includes('def validate_input_file(path: Path, allow_encrypted_pdf: bool = False)'));
check('PDF, image, Office/archive and OLE signatures are validated', engine.includes('probe.startswith(b"%PDF-")') && engine.includes('Image.open(path)') && engine.includes('_ZIP_BASED_EXPECTATIONS') && engine.includes('_OLE_SIGNATURE'));
check('SVG external resources are rejected', engine.includes('External SVG resources are not allowed.') && engine.includes('@import\\s+'));
check('Multi-frame and in-memory image batches are bounded', engine.includes('MAX_IMAGE_FRAMES') && engine.includes('MAX_BATCH_PIXELS') && engine.includes('Too many image pages for one PDF'));
check('PDF page ZIP extraction respects the global page ceiling', engine.includes('def _pdf_pages_zip') && engine.includes('doc.page_count > MAX_PDF_PAGES'));
check('Unlock accepts valid encrypted PDFs without weakening other PDF validation', main.includes('allow_encrypted=True') && engine.includes('allow_encrypted_pdf: bool = False') && engine.includes('if document.needs_pass'));
check('Structured outputs are validated by format', engine.includes('generated JSON is invalid') && engine.includes('generated XML is invalid') && engine.includes('missing required document data'));

check('Archive expanded-size and entry limits exist', engine.includes('len(names) > 20000') && engine.includes('512 * 1024 * 1024'));
check('PDF render workloads are bounded', engine.includes('MAX_PDF_PAGES') && engine.includes('MAX_RENDER_PIXELS') && engine.includes('_pdf_render_workload'));
check('Normal PDF rendering is page-by-page', engine.includes('def _iter_pdf_rendered_pages') && engine.includes('for index, image in _iter_pdf_rendered_pages'));
check('Image pixel and generated-output limits exist', engine.includes('MAX_IMAGE_PIXELS') && engine.includes('MAX_OUTPUT_BYTES'));
check('Generated outputs are structurally validated', main.includes('validate_output_file(target, spec.output_extension)') && engine.includes('def validate_output_file'));
check('Processing jobs run in isolated child processes', main.includes('def _run_worker_job') && worker.includes('def main()') && main.includes('"X-AJN-Worker-Isolation": "process"'));
check('Timed-out processing workers are terminated', main.includes('except subprocess.TimeoutExpired') && main.includes('_terminate_worker(process)') && main.includes('status_code=504'));
check('Sensitive PDF security operations use stdin worker payloads', worker.includes('operation == "protect"') && worker.includes('operation == "unlock"') && !main.includes('user_password, owner_password, permissions'));
check('Job admission checks free processing disk', main.includes('def _ensure_job_disk') && main.includes('_ensure_job_disk(total_bytes)'));
check('Analytics failures cannot mask conversion results', main.includes('conversion_analytics_write_failed') && main.includes('Anonymous analytics must never change a conversion result'));
check('Oversized and workload-limit failures return actionable codes', main.includes('\"too many pages\" in text') && main.includes('\"too large\" in text'));
check('Errors include stable request references', main.includes('request.state.request_id') && main.includes('"request_id": request_id') && frontend.includes('requestId?: string'));
check('Client request references are sanitized before logging/echo', main.includes('def _safe_request_id') && main.includes('[:64]') && main.includes('character.isalnum()'));
check('Frontend processing readiness uses /ready', frontend.includes('`${PDF_BACKEND_URL}/ready`') && !frontend.includes('`${PDF_BACKEND_URL}/health`'));
check('Frontend requires explicit live tool availability', serverTool.includes('backendReady') && serverTool.includes('manifest?.available === true'));
check('Frontend rechecks readiness before processing', serverTool.includes('const latestHealth = await checkPdfBackendHealth()'));
check('Live HTTP acceptance iterates registered conversion specs', httpAcceptance.includes('for tool_id, spec in sorted(SPECS.items())'));
check('Live HTTP acceptance validates process-isolation and request headers', httpAcceptance.includes('X-AJN-Worker-Isolation') && httpAcceptance.includes('X-Request-ID'));
check('Live HTTP acceptance includes negative/error-path tests', httpAcceptance.includes('def _negative_tests') && httpAcceptance.includes('fake.pdf') && httpAcceptance.includes('expected_status=415') && httpAcceptance.includes('http-accept-file-count'));
check('Live HTTP acceptance includes Protect/Unlock/Repair/Compress', httpAcceptance.includes('def _security_endpoints') && httpAcceptance.includes('/api/pdf/protect') && httpAcceptance.includes('/api/pdf/unlock') && httpAcceptance.includes('/api/pdf/repair') && httpAcceptance.includes('/api/pdf/compress'));
check('Windows setup runs live HTTP acceptance before frontend build', setup.includes('backend\\http_acceptance_test.py') && setup.indexOf('backend\\http_acceptance_test.py') < setup.indexOf('Preparing frontend dependencies'));
check('HTTP acceptance results cannot ship in production packages', packageScript.includes('HTTP_ACCEPTANCE_RESULTS.json') && secretScan.includes('HTTP_ACCEPTANCE_RESULTS.json'));

if (failures.length) {
  console.error('FAIL: backend workflow verification failed:');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}
console.log('AJN PDF backend workflow verification completed successfully.');
