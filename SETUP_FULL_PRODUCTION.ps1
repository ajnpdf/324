$ErrorActionPreference = "Stop"

function Invoke-Checked([string]$Command, [string[]]$Arguments, [string]$Message) {
  $global:LASTEXITCODE = 0
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Message (exit code $LASTEXITCODE)." }
}

function Remove-DirectoryRobust([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  for ($attempt = 1; $attempt -le 5; $attempt++) {
    Remove-Item -LiteralPath $Path -Recurse -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path -LiteralPath $Path)) { return }
    cmd.exe /c "attrib -R -S -H `"$Path\*`" /S /D 2>nul" | Out-Null
    cmd.exe /c "rd /s /q `"$Path`"" | Out-Null
    if (-not (Test-Path -LiteralPath $Path)) { return }
    Start-Sleep -Seconds ([Math]::Min(5, $attempt))
  }
  throw "$Path is locked after 5 cleanup attempts. Close editors, Explorer previews, antivirus scans and terminals using this project, then rerun setup."
}


function Stop-AjnPdfNodeProcesses([string]$ProjectRoot) {
  $escaped = [Regex]::Escape($ProjectRoot)
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -and $_.CommandLine -match $escaped } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
  foreach ($port in @(3000,9002)) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
      ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
  }
}

function New-RandomToken {
  $bytes = New-Object byte[] 32
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
  return ([Convert]::ToBase64String($bytes)).TrimEnd('=').Replace('+','-').Replace('/','_')
}

$Root = $PSScriptRoot
Set-Location -LiteralPath $Root
if (-not (Test-Path "package.json")) { throw "package.json was not found in $Root" }
if (-not (Test-Path "backend\requirements.txt")) { throw "backend requirements were not found in $Root" }

$node = Get-Command node.exe -ErrorAction SilentlyContinue
$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
$py = Get-Command py.exe -ErrorAction SilentlyContinue
if (-not $node -or -not $npm) { throw "Install Node.js 22 LTS and reopen PowerShell." }
if (-not $py) { throw "Install Python 3.12 with the Windows py launcher and reopen PowerShell." }

$nodeVersion = [version]((& node --version).TrimStart('v').Split('-')[0])
if ($nodeVersion -lt [version]'22.13.0') { throw "Node.js $nodeVersion is too old. Install Node.js 22.13 or newer." }

Write-Host "==> Installing optional Windows conversion engines" -ForegroundColor Cyan
Set-ExecutionPolicy -Scope Process Bypass -Force
& "$Root\INSTALL_WINDOWS_CONVERTERS.ps1"
& "$Root\INSTALL_OCR_LANGUAGES.ps1"

$env:Path = @(
  [Environment]::GetEnvironmentVariable('Path','Machine')
  [Environment]::GetEnvironmentVariable('Path','User')
  'C:\Program Files\LibreOffice\program'
  'C:\Program Files\Tesseract-OCR'
  'C:\Program Files\Calibre2'
) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
$env:Path = $env:Path -join ';'
$env:TESSDATA_PREFIX = Join-Path $Root 'backend\tessdata'
$LibreOfficeReady = (Get-Command soffice.exe -ErrorAction SilentlyContinue) -or (Test-Path 'C:\Program Files\LibreOffice\program\soffice.exe')
$TesseractReady = (Get-Command tesseract.exe -ErrorAction SilentlyContinue) -or (Test-Path 'C:\Program Files\Tesseract-OCR\tesseract.exe')
$CalibreReady = (Get-Command ebook-convert.exe -ErrorAction SilentlyContinue) -or (Test-Path 'C:\Program Files\Calibre2\ebook-convert.exe')
$GhostscriptReady = (Get-Command gswin64c.exe -ErrorAction SilentlyContinue) -or (Get-ChildItem 'C:\Program Files\gs' -Filter gswin64c.exe -File -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1)
if (-not $LibreOfficeReady) { throw "LibreOffice is required for Word, Excel, PowerPoint and OpenDocument conversions. Install it and rerun setup." }
$LibreOfficeCommand = Get-Command soffice.exe -ErrorAction SilentlyContinue
if (-not $LibreOfficeCommand) { $LibreOfficeCommand = Get-Item 'C:\Program Files\LibreOffice\program\soffice.exe' -ErrorAction SilentlyContinue }
$LibreOfficeExePath = if ($LibreOfficeCommand -and ($LibreOfficeCommand.PSObject.Properties.Name -contains 'Source')) { $LibreOfficeCommand.Source } elseif ($LibreOfficeCommand) { $LibreOfficeCommand.FullName } else { $null }
if (-not $LibreOfficeExePath -or [IO.Path]::GetFileName($LibreOfficeExePath).ToLowerInvariant() -ne 'soffice.exe') { throw "AJN PDF requires LibreOffice soffice.exe. soffice.COM is not allowed for production conversion." }
if (Get-Process soffice* -ErrorAction SilentlyContinue) { throw "Close all LibreOffice windows/processes before running AJN PDF production acceptance so cleanup can be verified." }
if (-not $TesseractReady) { throw "Tesseract OCR is required for scanned and image OCR conversions. Install it and rerun setup." }
if (-not $CalibreReady) { Write-Warning "Calibre is unavailable. MOBI and AZW3 tools will be marked unavailable until it is installed." }
if (-not $GhostscriptReady) { Write-Host "INFO: Ghostscript is unavailable. XPS/PostScript tools remain safely disabled until a licensed engine is configured." -ForegroundColor Yellow }

$AnalyticsAdminToken = $null
$MediaAdminToken = $null
$BackendEnvFile = Join-Path $Root "backend\.env.local"
if (Test-Path -LiteralPath $BackendEnvFile) {
  $Existing = Get-Content -LiteralPath $BackendEnvFile
  $AnalyticsLine = $Existing | Where-Object { $_ -match '^AJN_ANALYTICS_ADMIN_TOKEN=' } | Select-Object -First 1
  $MediaLine = $Existing | Where-Object { $_ -match '^AJN_MEDIA_ADMIN_TOKEN=' } | Select-Object -First 1
  if ($AnalyticsLine) { $AnalyticsAdminToken = $AnalyticsLine.Substring('AJN_ANALYTICS_ADMIN_TOKEN='.Length) }
  if ($MediaLine) { $MediaAdminToken = $MediaLine.Substring('AJN_MEDIA_ADMIN_TOKEN='.Length) }
}
if (-not $AnalyticsAdminToken) { $AnalyticsAdminToken = New-RandomToken }
if (-not $MediaAdminToken) { $MediaAdminToken = New-RandomToken }

@"
AJN_MAX_FILE_MB=75
AJN_MAX_TOTAL_MB=150
AJN_MAX_UPLOAD_FILES=50
AJN_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:9002,https://www.ajnpdf.com,https://ajnpdf.com
AJN_RATE_LIMIT_PER_MINUTE=30
AJN_ANALYTICS_RATE_LIMIT_PER_MINUTE=120
AJN_ADMIN_RATE_LIMIT_PER_MINUTE=10
AJN_MAX_CONCURRENT_JOBS=4
AJN_PROCESSING_TIMEOUT_SECONDS=300
AJN_MAX_OUTPUT_MB=500
AJN_MAX_PDF_PAGES=300
AJN_MAX_RENDER_MPIX=600
AJN_MAX_IMAGE_PIXELS=80000000
AJN_MAX_IMAGE_FRAMES=120
AJN_MAX_BATCH_MPIX=240
AJN_LOG_LEVEL=INFO
AJN_ANALYTICS_ENABLED=true
AJN_ANALYTICS_RETENTION_DAYS=90
AJN_ANALYTICS_ADMIN_TOKEN=$AnalyticsAdminToken
AJN_MEDIA_ADMIN_TOKEN=$MediaAdminToken
AJN_TRUST_PROXY_HEADERS=false
AJN_TRUSTED_PROXY_IPS=127.0.0.1,::1
AJN_ANALYTICS_DB="$($Root.Replace('\','/'))/backend/ajn_analytics.sqlite3"
AJN_PUBLIC_MEDIA_DB="$($Root.Replace('\','/'))/backend/ajn_public_media.sqlite3"
AJN_PUBLIC_MEDIA_ROOT="$($Root.Replace('\','/'))/backend/public_media"
AJN_PUBLIC_IMAGE_MAX_MB=12
AJN_PUBLIC_IMAGE_MAX_PIXELS=50000000
AJN_MIN_FREE_DISK_MB=512
TESSDATA_PREFIX="$($Root.Replace('\','/'))/backend/tessdata"
"@ | Set-Content -LiteralPath $BackendEnvFile -Encoding UTF8

@"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-4495802176396975
NEXT_PUBLIC_ADSENSE_SLOT_HOME_PRIMARY=3648223351
NEXT_PUBLIC_ADSENSE_SLOT_HOME_SECONDARY=4849624383
NEXT_PUBLIC_ADSENSE_SLOT_TOOL_CONTENT=1601180258
NEXT_PUBLIC_ADSENSE_SLOT_BLOG_CONTENT=
NEXT_PUBLIC_PDF_BACKEND_URL=http://127.0.0.1:8000
NEXT_PUBLIC_GA4_MEASUREMENT_ID=
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
"@ | Set-Content -LiteralPath ".env.local" -Encoding UTF8

New-Item -ItemType Directory -Path "backend\public_media" -Force | Out-Null

Write-Host "==> Preparing Python conversion service" -ForegroundColor Cyan
if (-not (Test-Path "backend\.venv\Scripts\python.exe")) {
  Invoke-Checked "py" @("-3.12", "-m", "venv", "backend\.venv") "Python virtual environment creation failed"
}
Invoke-Checked "backend\.venv\Scripts\python.exe" @("-m", "pip", "install", "--upgrade", "pip") "pip upgrade failed"
Invoke-Checked "backend\.venv\Scripts\python.exe" @("-m", "pip", "install", "-r", "backend\requirements.txt") "Backend dependency installation failed"

$backendReady = $false
try {
  $healthResponse = Invoke-RestMethod 'http://127.0.0.1:8000/health' -TimeoutSec 2
  $readyResponse = Invoke-RestMethod 'http://127.0.0.1:8000/ready' -TimeoutSec 2
  if ($healthResponse.status -eq 'ok' -and $healthResponse.version -eq '3.1.0' -and $readyResponse.status -eq 'ok') { $backendReady = $true }
} catch {}
if (-not $backendReady) {
  $listeners = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
  foreach ($listener in $listeners) { Stop-Process -Id $listener.OwningProcess -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 1
  $backendCommand = "Set-Location -LiteralPath '$Root\backend'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --env-file '.env.local'"
  Start-Process powershell.exe -ArgumentList '-NoExit','-Command',$backendCommand
  for ($i=0; $i -lt 90; $i++) {
    Start-Sleep -Seconds 1
    try {
      $healthResponse = Invoke-RestMethod 'http://127.0.0.1:8000/health' -TimeoutSec 2
      $readyResponse = Invoke-RestMethod 'http://127.0.0.1:8000/ready' -TimeoutSec 2
      if ($healthResponse.status -eq 'ok' -and $healthResponse.version -eq '3.1.0' -and $readyResponse.status -eq 'ok') { $backendReady=$true; break }
    } catch {}
  }
}
if (-not $backendReady) { throw "Python conversion service did not become ready. Check the backend PowerShell window." }

Write-Host "==> Running backend security and conversion smoke tests" -ForegroundColor Cyan
Invoke-Checked "backend\.venv\Scripts\python.exe" @("backend\smoke_test.py") "Backend smoke tests failed"
Invoke-Checked "backend\.venv\Scripts\python.exe" @("backend\capability_audit.py") "Backend capability audit failed"
Invoke-Checked "backend\.venv\Scripts\python.exe" @("backend\export_capabilities.py") "Capability manifest export failed"
Invoke-Checked "node.exe" @("scripts\verify-capability-manifest.mjs") "Capability manifest validation failed"
Invoke-Checked "backend\.venv\Scripts\python.exe" @("backend\full_acceptance_test.py") "Backend full acceptance suite failed"
Invoke-Checked "backend\.venv\Scripts\python.exe" @("backend\http_acceptance_test.py") "Backend live HTTP acceptance suite failed"
Start-Sleep -Seconds 2
if (Get-Process soffice* -ErrorAction SilentlyContinue) { throw "LibreOffice soffice.exe remained running after acceptance tests. The conversion process cleanup gate failed." }

Write-Host "==> Preparing frontend dependencies" -ForegroundColor Cyan
Stop-AjnPdfNodeProcesses $Root
Start-Sleep -Seconds 2
Remove-DirectoryRobust ".next"
Remove-DirectoryRobust "node_modules"
Invoke-Checked "npm.cmd" @("cache", "verify") "npm cache verification failed"
Invoke-Checked "npm.cmd" @("ci", "--registry=https://registry.npmjs.org/", "--no-audit", "--no-fund", "--prefer-offline") "npm ci failed"
Write-Host "==> Applying required Next.js maintenance security update" -ForegroundColor Cyan
Invoke-Checked "npm.cmd" @("install", "--save-exact", "next@15.5.21", "--registry=https://registry.npmjs.org/", "--no-audit", "--no-fund") "Next.js maintenance security update failed"
Invoke-Checked "npm.cmd" @("install", "--save-dev", "--save-exact", "eslint-config-next@15.5.20", "--registry=https://registry.npmjs.org/", "--no-audit", "--no-fund") "Next.js ESLint configuration update failed"
$InstalledNext = & node.exe -p "require('./node_modules/next/package.json').version"
if ($LASTEXITCODE -ne 0 -or $InstalledNext.Trim() -ne "15.5.21") { throw "Next.js 15.5.21 was not installed correctly." }
$InstalledNextEslint = & node.exe -p "require('./node_modules/eslint-config-next/package.json').version"
if ($LASTEXITCODE -ne 0 -or $InstalledNextEslint.Trim() -ne "15.5.20") { throw "eslint-config-next 15.5.20 was not installed correctly." }

Write-Host "==> Verifying tools, OCR, themes, SEO, CRO, analytics, links and production build" -ForegroundColor Cyan
$PreviousRuntimeArtifactFlag = $env:AJN_ALLOW_RUNTIME_ARTIFACTS
$env:AJN_ALLOW_RUNTIME_ARTIFACTS = "1"
try {
  Invoke-Checked "npm.cmd" @("run", "check") "Verification, TypeScript or production build failed"
} finally {
  if ($null -eq $PreviousRuntimeArtifactFlag) { Remove-Item Env:AJN_ALLOW_RUNTIME_ARTIFACTS -ErrorAction SilentlyContinue } else { $env:AJN_ALLOW_RUNTIME_ARTIFACTS = $PreviousRuntimeArtifactFlag }
}
if (-not (Test-Path ".next\BUILD_ID")) { throw "Production build did not create .next\BUILD_ID." }

$webCommand = "Set-Location -LiteralPath '$Root'; npm run preview"
Start-Process powershell.exe -ArgumentList '-NoExit','-Command',$webCommand
$webReady = $false
for ($i=0; $i -lt 90; $i++) {
  Start-Sleep -Seconds 1
  try { if ((Invoke-WebRequest 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200) { $webReady=$true; break } } catch {}
}
if (-not $webReady) { throw "AJN PDF website did not become ready. Check the frontend PowerShell window." }

$healthCheck = Invoke-RestMethod 'http://127.0.0.1:8000/health' -TimeoutSec 10
$readyCheck = Invoke-RestMethod 'http://127.0.0.1:8000/ready' -TimeoutSec 10
$toolsCheck = Invoke-RestMethod 'http://127.0.0.1:8000/api/tools' -TimeoutSec 20
if ($healthCheck.status -ne 'ok' -or $readyCheck.status -ne 'ok') { throw "Backend health/readiness verification failed after frontend build." }
if (-not $toolsCheck.tools -or $toolsCheck.tools.Count -lt 78) { throw "Backend /api/tools capability response is incomplete." }

Start-Process 'http://localhost:3000'
# Open only the primary website after a successful setup. Additional QA routes are listed in the report instead of flooding the browser.

Write-Host "" 
Write-Host "AJN PDF PRODUCTION SETUP PASSED" -ForegroundColor Green
Write-Host "Website: http://localhost:3000" -ForegroundColor Green
Write-Host "Mobile-first homepage: tools appear immediately below the navigation on phone widths." -ForegroundColor Green
Write-Host "Conversion API: http://127.0.0.1:8000" -ForegroundColor Green
Write-Host "Analytics admin token: $AnalyticsAdminToken" -ForegroundColor Yellow
Write-Host "Media admin token: $MediaAdminToken" -ForegroundColor Yellow
Write-Host "Store both tokens securely. They are saved only in backend\.env.local." -ForegroundColor Yellow
