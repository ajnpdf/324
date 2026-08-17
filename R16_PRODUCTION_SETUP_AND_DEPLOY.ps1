param(
  [string]$Repo = "",
  [string]$Project = "studio-4223217082-69711",
  [string]$Region = "asia-south1",
  [string]$Service = "ajn-pdf-api",
  [int]$MaxFileMb = 30,
  [int]$MaxTotalMb = 30,
  [switch]$SkipGitPush,
  [switch]$SkipCloudRun,
  [switch]$SkipVercel,
  [switch]$FullBrowserAudit
)

$ErrorActionPreference = "Stop"
if ([string]::IsNullOrWhiteSpace($Repo)) { $Repo = $PSScriptRoot }
$Repo = [IO.Path]::GetFullPath($Repo)
$ReportDir = Join-Path $Repo ("reports\r16-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Force -Path $ReportDir | Out-Null

function Section([string]$Text) { Write-Host "`n============================================================" -ForegroundColor DarkCyan; Write-Host " AJN PDF R16 :: $Text" -ForegroundColor Cyan; Write-Host "============================================================" -ForegroundColor DarkCyan }
function Pass([string]$Text) { Write-Host "[PASS] $Text" -ForegroundColor Green }
function Info([string]$Text) { Write-Host "[INFO] $Text" -ForegroundColor Cyan }
function Invoke-Checked([string]$Command, [string[]]$Arguments, [string]$Failure) {
  $global:LASTEXITCODE = 0
  & $Command @Arguments
  $code = $LASTEXITCODE
  if ($code -ne 0) { throw "$Failure (exit code $code)." }
}
function Resolve-Command([string[]]$Candidates) {
  foreach ($candidate in $Candidates) {
    if (Test-Path -LiteralPath $candidate) { return (Resolve-Path -LiteralPath $candidate).Path }
    $cmd = Get-Command $candidate -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  return $null
}
function Wait-Ready([string]$BaseUrl, [int]$Seconds = 150) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  while ((Get-Date) -lt $deadline) {
    try {
      $ready = Invoke-RestMethod "$BaseUrl/ready" -TimeoutSec 8
      if ($ready.status -eq "ok") { return $ready }
    } catch {}
    Start-Sleep -Seconds 2
  }
  throw "Backend did not become ready at $BaseUrl."
}
function Assert-Ready($Ready, [string]$Label) {
  if ([int]$Ready.conversion_tools -ne 75 -or [int]$Ready.available_conversion_tools -ne 75) { throw "$Label is not 75/75: $($Ready.available_conversion_tools)/$($Ready.conversion_tools)" }
  if ([int]$Ready.max_file_mb -ne $MaxFileMb -or [int]$Ready.max_total_mb -ne $MaxTotalMb) { throw "$Label limits are $($Ready.max_file_mb)/$($Ready.max_total_mb) MB; expected $MaxFileMb/$MaxTotalMb MB." }
  Pass "${Label}: 75/75 conversions ready; limits $MaxFileMb/$MaxTotalMb MB."
}

Section "0. Source and toolchain"
Set-Location -LiteralPath $Repo
if (-not (Test-Path "package.json") -or -not (Test-Path "backend\app\main.py")) { throw "AJN PDF source was not found at $Repo" }
$Git = Resolve-Command @("git.exe","git")
$Node = Resolve-Command @("node.exe","node")
$Npm = Resolve-Command @("npm.cmd")
$Npx = Resolve-Command @("npx.cmd")
$Py = Resolve-Command @("py.exe","py")
$Gcloud = Resolve-Command @("C:\Users\ANJAN PATEL\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd","gcloud.cmd")
if (-not $Git -or -not $Node -or -not $Npm -or -not $Npx -or -not $Py) { throw "Required tools missing. Need git.exe, node.exe, npm.cmd, npx.cmd and py.exe." }
$nodeVersion = [version]((& $Node --version).Trim().TrimStart('v').Split('-')[0])
if ($nodeVersion -lt [version]'22.13.0') { throw "Node.js $nodeVersion is too old. Use Node 22.13 or newer." }
if (Test-Path ".git") {
  $branch = (& $Git branch --show-current).Trim()
  if ($branch -ne "main") { throw "Expected Git branch main, found '$branch'." }
  Pass "Git branch main."
}
Pass "Node $nodeVersion and Windows .cmd tooling ready."

# No execution-policy mutation is performed anywhere in R16.
$env:Path = @($env:Path,'C:\Program Files\LibreOffice\program','C:\Program Files\Tesseract-OCR','C:\Program Files\Calibre2') -join ';'
$Soffice = Resolve-Command @("C:\Program Files\LibreOffice\program\soffice.exe","soffice.exe")
$Tesseract = Resolve-Command @("C:\Program Files\Tesseract-OCR\tesseract.exe","tesseract.exe")
$Calibre = Resolve-Command @("C:\Program Files\Calibre2\ebook-convert.exe","ebook-convert.exe")
if (-not $Soffice) { throw "LibreOffice soffice.exe is required for Office conversions." }
if (-not $Tesseract) { throw "Tesseract OCR is required for OCR conversions." }
if (-not $Calibre) { throw "Calibre ebook-convert.exe is required for MOBI/AZW3 conversions." }
Pass "LibreOffice, Tesseract and Calibre are present. XPS uses PyMuPDF; Ghostscript is not required."

Section "1. Python backend preparation"
$VenvPython = Join-Path $Repo "backend\.venv\Scripts\python.exe"
if (-not (Test-Path -LiteralPath $VenvPython)) { Invoke-Checked $Py @("-3.12","-m","venv","backend\.venv") "Python 3.12 virtual environment creation failed" }
Invoke-Checked $VenvPython @("-m","pip","install","--upgrade","pip") "pip upgrade failed"
Invoke-Checked $VenvPython @("-m","pip","install","-r","backend\requirements.txt") "backend dependency installation failed"
$env:AJN_MAX_FILE_MB = [string]$MaxFileMb
$env:AJN_MAX_TOTAL_MB = [string]$MaxTotalMb
$env:AJN_MAX_UPLOAD_FILES = "50"
$env:AJN_ALLOWED_ORIGINS = "http://localhost:3000,http://localhost:9002,https://www.ajnpdf.com,https://ajnpdf.com"
$env:AJN_MAX_CONCURRENT_JOBS = "4"
$env:AJN_PROCESSING_TIMEOUT_SECONDS = "300"

# Local acceptance exercises protected admin routes.
# Keep authentication enabled while sharing process-only credentials between
# the local FastAPI server and its smoke-test child process.
if ([string]::IsNullOrWhiteSpace($env:AJN_ANALYTICS_ADMIN_TOKEN)) {
    $env:AJN_ANALYTICS_ADMIN_TOKEN =
        "r16-local-analytics-" + [Guid]::NewGuid().ToString("N")
}

if ([string]::IsNullOrWhiteSpace($env:AJN_MEDIA_ADMIN_TOKEN)) {
    $env:AJN_MEDIA_ADMIN_TOKEN =
        "r16-local-media-" + [Guid]::NewGuid().ToString("N")
}

Pass "Protected local smoke-test credentials prepared in process memory."
$BundledTessdata = Join-Path $Repo "backend\tessdata"
if (Test-Path -LiteralPath $BundledTessdata) { $env:TESSDATA_PREFIX = $BundledTessdata } else { Remove-Item Env:TESSDATA_PREFIX -ErrorAction SilentlyContinue }
$env:QT_QPA_PLATFORM = "offscreen"
$env:QT_QUICK_BACKEND = "software"
$env:QTWEBENGINE_CHROMIUM_FLAGS = "--disable-gpu --disable-dev-shm-usage"

$existing = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
foreach ($listener in $existing) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue }
$backendOut = Join-Path $ReportDir "local-backend.stdout.log"
$backendErr = Join-Path $ReportDir "local-backend.stderr.log"
$BackendProcess = Start-Process -FilePath $VenvPython -ArgumentList @("-m","uvicorn","app.main:app","--host","127.0.0.1","--port","8000") -WorkingDirectory (Join-Path $Repo "backend") -PassThru -WindowStyle Hidden -RedirectStandardOutput $backendOut -RedirectStandardError $backendErr
try {
  $localReady = Wait-Ready "http://127.0.0.1:8000" 150
  Assert-Ready $localReady "Local backend"

  Section "2. Backend acceptance and 78/78 capability snapshot"
  Invoke-Checked $VenvPython @("backend\smoke_test.py") "Backend smoke test failed"
  Invoke-Checked $VenvPython @("backend\capability_audit.py") "Backend capability audit failed"
  Invoke-Checked $VenvPython @("backend\export_capabilities.py") "Capability export failed"
  Invoke-Checked $Node @("scripts\verify-capability-manifest.mjs") "Capability snapshot verification failed"
  Invoke-Checked $VenvPython @("backend\full_acceptance_test.py") "Full conversion acceptance failed"
  $env:AJN_BACKEND_TEST_URL = "http://127.0.0.1:8000"
  Invoke-Checked $VenvPython @("backend\http_acceptance_test.py") "Local HTTP acceptance failed"
  Pass "Backend local acceptance complete."

  Section "3. Frontend install and complete source/build gates"
  Invoke-Checked $Npm @("ci","--registry=https://registry.npmjs.org/","--no-audit","--no-fund") "npm ci failed"
  Invoke-Checked $Npm @("run","verify:r16-consistency") "R16 consistency verification failed"
  Invoke-Checked $Npm @("run","check") "AJN PDF full verification/build failed"
  Invoke-Checked $Npm @("run","verify:r13-runtime") "107-route built runtime verification failed"

  Section "4. Mandatory Edge browser audit"
  $Edge = Resolve-Command @("$env:ProgramFiles(x86)\Microsoft\Edge\Application\msedge.exe","$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe")
  if (-not $Edge) { throw "Microsoft Edge was not found. R16 browser audit is mandatory." }
  $env:AJN_EDGE_PATH = $Edge
  $env:AJN_R13_ARTIFACT_DIR = Join-Path $ReportDir "edge"
  if ($FullBrowserAudit) { $env:AJN_BROWSER_FULL_ROUTE_AUDIT = "1" } else { Remove-Item Env:AJN_BROWSER_FULL_ROUTE_AUDIT -ErrorAction SilentlyContinue }
  Invoke-Checked $Npm @("run","audit:r13-browser") "Mandatory Edge browser audit failed. Read $env:AJN_R13_ARTIFACT_DIR\R13_BROWSER_LAYOUT_REPORT.json for the full exception stack."
  Pass "Edge audit passed with all 107 public routes smoke-tested."
} finally {
  if ($BackendProcess -and -not $BackendProcess.HasExited) { Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue }
}

Section "5. Stage only R16 source changes"
if (Test-Path ".git") {
  $changedList = Join-Path $Repo "R16_CHANGED_FILES.txt"
  if (-not (Test-Path $changedList)) { throw "R16_CHANGED_FILES.txt is missing." }
  $R16Paths = @(
    Get-Content -LiteralPath $changedList |
      ForEach-Object { $_.Trim() } |
      Where-Object { $_ -and -not $_.StartsWith('#') }
  )
  $preStaged = @(& $Git diff --cached --name-only)
  $unrelatedStaged = @($preStaged | Where-Object { $R16Paths -notcontains $_ })
  if ($unrelatedStaged.Count -gt 0) {
    throw "Unrelated staged Git changes are present and were left untouched: $($unrelatedStaged -join ', '). Commit or unstage them before R16 creates its production commit."
  }
  foreach ($item in $R16Paths) {
    if (Test-Path -LiteralPath (Join-Path $Repo $item)) { & $Git add -- $item }
  }
  Invoke-Checked $Git @("diff","--cached","--check","--") "Staged R16 diff has whitespace errors"
  $staged = @(& $Git diff --cached --name-only)
  if ($staged.Count -gt 0) {
    Info "Staged R16 files:`n$($staged -join "`n")"
    Invoke-Checked $Git @("commit","-m","fix: close R16 frontend backend runtime consistency") "R16 commit failed"
  } else { Info "No new R16 diff to commit." }
  if (-not $SkipGitPush) { Invoke-Checked $Git @("push","origin","main") "Git push failed"; Pass "GitHub main updated." }
} else { Info "Standalone package has no .git directory; Git staging/push skipped." }

if ($SkipCloudRun) { Info "Cloud Run deployment skipped by switch." } else {
  Section "6. Cloud Run production deploy"
  if (-not $Gcloud) { throw "gcloud.cmd was not found." }
  Invoke-Checked $Gcloud @("config","set","project",$Project) "gcloud project selection failed"
  Invoke-Checked $Gcloud @("run","deploy",$Service,"--source","backend","--region",$Region,"--project",$Project,"--allow-unauthenticated","--update-env-vars","AJN_MAX_FILE_MB=$MaxFileMb,AJN_MAX_TOTAL_MB=$MaxTotalMb") "Cloud Run source deployment failed"
  $ProdUrl = ((& $Gcloud run services describe $Service --region $Region --project $Project --format="value(status.url)") | Select-Object -Last 1).Trim()
  if (-not $ProdUrl.StartsWith("https://")) { throw "Could not resolve the production Cloud Run URL." }
  $prodReady = Wait-Ready $ProdUrl 180
  Assert-Ready $prodReady "Production Cloud Run"
  $env:AJN_BACKEND_TEST_URL = $ProdUrl
  Invoke-Checked $VenvPython @("backend\http_acceptance_test.py") "Production backend HTTP acceptance failed"
  $env:AJN_BACKEND_URL = $ProdUrl
  $env:AJN_EXPECT_MAX_FILE_MB = [string]$MaxFileMb
  $env:AJN_EXPECT_MAX_TOTAL_MB = [string]$MaxTotalMb
  Invoke-Checked $Npm @("run","verify:live-backend") "Production backend contract verification failed"
  Pass "Cloud Run production acceptance passed."

  if ($SkipVercel) { Info "Vercel deployment skipped by switch." } else {
    Section "7. Vercel production deploy"
    if (-not (Test-Path ".vercel\project.json")) {
      Info "Vercel project link is missing; starting the official interactive link flow once. Select the existing AJN PDF project."
      Invoke-Checked $Npx @("vercel","link") "Vercel project linking failed"
    }
    # --build-env makes the exact deployed Cloud Run URL available while Next.js builds the CSP.
    # --env gives the same URL to the production runtime. The hard-coded fallback remains a secondary safety path.
    Invoke-Checked $Npx @("vercel","--prod","--force","--yes","--build-env","NEXT_PUBLIC_PDF_BACKEND_URL=$ProdUrl","--env","NEXT_PUBLIC_PDF_BACKEND_URL=$ProdUrl") "Vercel production deployment failed"

    Section "8. Live website acceptance"
    $Live = "https://www.ajnpdf.com"
    foreach ($route in @("/","/merge-pdf","/status","/pdf-to-word","/protect-pdf","/sitemap.xml")) {
      $response = Invoke-WebRequest ($Live + $route) -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30
      if ($response.StatusCode -ne 200) { throw "$route returned HTTP $($response.StatusCode)." }
      if ($route -eq "/merge-pdf" -and $response.Content -match "Analysis failed|Process Terminated|System Interrupt|Loading chunk") { throw "Merge PDF live HTML contains a failure marker." }
      Pass "$route -> HTTP 200"
    }
    $finalReady = Wait-Ready $ProdUrl 60
    Assert-Ready $finalReady "Final Cloud Run recheck"
    Pass "AJN PDF R16 production closure passed Cloud Run + Vercel + live route gates."
  }
}

Write-Host "`nR16_REPORT_DIR=$ReportDir" -ForegroundColor Green
