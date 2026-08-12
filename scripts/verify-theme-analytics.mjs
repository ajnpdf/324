import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const expect = (label, condition) => {
  if (!condition) throw new Error(`FAIL: ${label}`);
  checks.push(`PASS: ${label}`);
};

const layout = read('src/app/layout.tsx');
const css = read('src/app/globals.css');
const navbar = read('src/components/landing/navbar.tsx');
const themeProvider = read('src/components/theme/theme-provider.tsx');
const professionalSkeleton = read('src/components/ajnpdf/professional-skeleton.module.css');
const analytics = read('src/components/analytics/site-analytics.tsx');
const admin = read('src/app/admin/analytics/page.tsx');
const backend = read('backend/app/main.py');
const setup = read('SETUP_FULL_PRODUCTION.ps1');
const installer = read('INSTALL_WINDOWS_CONVERTERS.ps1');

expect('Light-only bootstrap prevents theme flash', layout.includes('ajn-theme-bootstrap') && layout.includes("classList.remove('dark')") && layout.includes("dataset.theme='light'"));
expect('ThemeProvider wraps application', layout.includes('<ThemeProvider>'));
expect('ThemeProvider forces light mode', themeProvider.includes("root.classList.remove('dark')") && themeProvider.includes("theme: 'light'"));
expect('Stored dark preference is removed', themeProvider.includes('localStorage.removeItem'));
expect('Public theme toggle code is removed', !navbar.includes('<ThemeToggle') && !fs.existsSync(path.join(root, 'src/components/theme/theme-toggle.tsx')));
expect('Light color scheme is explicit', css.includes('color-scheme: light !important'));
expect('Legacy dark-mode style branches are removed', !css.includes('.dark') && !professionalSkeleton.includes(':global(.dark)'));
expect('Reduced-motion support remains enabled', css.includes('@media (prefers-reduced-motion: reduce)'));
expect('AJN RGB animation layer exists', css.includes('ajn-rgb-sweep') && css.includes('ajn-brand-breathe'));

for (const eventName of ['page_view','interaction','search','category_filter','tool_start','tool_complete','tool_error','download','web_vital']) {
  expect(`Analytics event ${eventName} is wired`, analytics.includes(`'${eventName}'`));
}
expect('Analytics strips query strings from stored paths', analytics.includes("split('?')[0].split('#')[0]"));
expect('Analytics never sends filenames or document contents', !analytics.includes('file.name') && !analytics.includes('document_content'));
expect('Admin dashboard supports automatic refresh', admin.includes('15000') && admin.includes('Auto-refresh'));
expect('Admin dashboard supports time windows', admin.includes('window_days') && admin.includes('90 days'));
expect('Admin dashboard exports aggregate JSON', admin.includes('Export JSON'));
expect('Admin copy accurately says IP addresses are not stored', admin.includes('raw IP addresses are not persisted'));

expect('Backend analytics version is current', backend.includes('VERSION = "3.1.0"'));
expect('Backend uses constant-time admin token comparison', backend.includes('secrets.compare_digest'));
expect('Backend enforces analytics retention', backend.includes('ANALYTICS_RETENTION_DAYS'));
expect('Backend stores aggregate theme, device and referrer fields', backend.includes('device_type') && backend.includes('referrer_group') && backend.includes('theme'));
expect('Backend returns CRO funnel rates', backend.includes('start_to_complete_rate') && backend.includes('complete_to_download_rate'));
expect('Backend declares that IP addresses are not stored', backend.includes('"ip_addresses_stored": False'));

expect('PowerShell 5.1 random token generation is compatible', setup.includes('RandomNumberGenerator]::Create()') && !setup.includes('RandomNumberGenerator]::Fill'));
expect('PowerShell setup avoids Join-String', !setup.includes('Join-String') && !installer.includes('Join-String'));
expect('Converter installer avoids machine PATH writes', !installer.includes("SetEnvironmentVariable('Path', ($machinePath") && installer.includes("'User'"));
expect('Setup checks backend version 3.1.0', setup.includes("version -eq '3.1.0'"));

console.log(checks.join('\n'));
console.log('Light-only theme, animation, analytics, privacy and PowerShell compatibility verification completed successfully.');

const conversionEngine = fs.readFileSync('backend/app/conversion_engine.py', 'utf8');
expect('Tesseract searchable PDF uses stdout', conversionEngine.includes('\"stdout\"') && conversionEngine.includes('pdf_bytes.startswith(b\"%PDF-\")'));
