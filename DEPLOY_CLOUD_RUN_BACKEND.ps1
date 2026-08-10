param(
    [string]$Region = "asia-south1",
    [string]$Service = "ajn-pdf-api",
    [string]$ArtifactRepository = "ajnpdf",
    [string]$VercelOrigin = "https://ajn-delta.vercel.app"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Run-GCloud {
    param([Parameter(ValueFromRemainingArguments=$true)][string[]]$Args)
    & gcloud @Args
    if ($LASTEXITCODE -ne 0) { throw "gcloud failed: gcloud $($Args -join ' ')" }
}

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    throw "Google Cloud CLI (gcloud) is not installed. Install Google Cloud CLI, reopen PowerShell, run 'gcloud auth login', then run this script again."
}

$Project = (& gcloud config get-value project 2>$null).Trim()
if (-not $Project -or $Project -eq "(unset)") {
    throw "No Google Cloud project is selected. Run: gcloud config set project YOUR_PROJECT_ID"
}

Write-Host "==> AJN PDF Cloud Run backend deployment" -ForegroundColor Cyan
Write-Host "Project: $Project"
Write-Host "Region : $Region"
Write-Host "Service: $Service"

Run-GCloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project $Project --quiet

& gcloud artifacts repositories describe $ArtifactRepository --location $Region --project $Project *> $null
if ($LASTEXITCODE -ne 0) {
    Run-GCloud artifacts repositories create $ArtifactRepository --repository-format=docker --location=$Region --description="AJN PDF backend images" --project=$Project --quiet
}

$Tag = Get-Date -Format "yyyyMMdd-HHmmss"
$Image = "$Region-docker.pkg.dev/$Project/$ArtifactRepository/$Service`:$Tag"
Write-Host "==> Building backend image: $Image" -ForegroundColor Cyan
Run-GCloud builds submit (Join-Path $Root "backend") --tag $Image --project $Project --quiet

$Origins = @($VercelOrigin, "https://ajnpdf.com", "https://www.ajnpdf.com") | Where-Object { $_ } | Select-Object -Unique
$AllowedOrigins = $Origins -join ","
$EnvFile = Join-Path ([System.IO.Path]::GetTempPath()) ("ajn-cloud-run-env-" + [guid]::NewGuid().ToString("N") + ".yaml")
@"
AJN_ALLOWED_ORIGINS: "$AllowedOrigins"
AJN_ENABLE_HSTS: "false"
AJN_LOG_LEVEL: "INFO"
AJN_MAX_FILE_MB: "30"
AJN_MAX_TOTAL_MB: "30"
AJN_MAX_UPLOAD_FILES: "50"
AJN_MAX_OUTPUT_MB: "30"
AJN_MAX_PDF_PAGES: "250"
AJN_MAX_RENDER_MPIX: "500"
AJN_MAX_IMAGE_PIXELS: "60000000"
AJN_MAX_IMAGE_FRAMES: "100"
AJN_MAX_BATCH_MPIX: "200"
AJN_RATE_LIMIT_PER_MINUTE: "120"
AJN_ANALYTICS_RATE_LIMIT_PER_MINUTE: "240"
AJN_ADMIN_RATE_LIMIT_PER_MINUTE: "30"
AJN_MAX_CONCURRENT_JOBS: "1"
AJN_PROCESSING_TIMEOUT_SECONDS: "270"
AJN_MIN_FREE_DISK_MB: "128"
AJN_ANALYTICS_ENABLED: "false"
AJN_ANALYTICS_RETENTION_DAYS: "90"
AJN_TRUST_PROXY_HEADERS: "false"
AJN_ANALYTICS_DB: "/tmp/ajn_analytics.sqlite3"
AJN_PUBLIC_MEDIA_DB: "/tmp/ajn_public_media.sqlite3"
AJN_PUBLIC_MEDIA_ROOT: "/tmp/public_media"
AJN_PUBLIC_IMAGE_MAX_MB: "10"
AJN_PUBLIC_IMAGE_MAX_PIXELS: "40000000"
"@ | Set-Content -LiteralPath $EnvFile -Encoding UTF8

try {
    Write-Host "==> Deploying Cloud Run backend" -ForegroundColor Cyan
    Run-GCloud run deploy $Service `
        --image $Image `
        --region $Region `
        --platform managed `
        --allow-unauthenticated `
        --execution-environment gen2 `
        --port 8000 `
        --cpu 2 `
        --memory 4Gi `
        --concurrency 1 `
        --timeout 300 `
        --min-instances 0 `
        --max-instances 3 `
        --env-vars-file $EnvFile `
        --project $Project `
        --quiet
}
finally {
    Remove-Item -LiteralPath $EnvFile -Force -ErrorAction SilentlyContinue
}

$Url = (& gcloud run services describe $Service --region $Region --project $Project --format="value(status.url)").Trim()
if (-not $Url) { throw "Cloud Run deployed but the service URL could not be resolved." }

Write-Host "==> Verifying live backend" -ForegroundColor Cyan
$Health = Invoke-RestMethod -Uri "$Url/health" -TimeoutSec 30
$Ready = Invoke-RestMethod -Uri "$Url/ready" -TimeoutSec 30
$Tools = Invoke-RestMethod -Uri "$Url/api/tools" -TimeoutSec 30
if ($Health.status -ne "ok") { throw "Cloud Run /health is not OK." }
if ($Ready.status -ne "ok") { throw "Cloud Run /ready is not OK." }
$Available = @($Tools.tools | Where-Object { $_.available -eq $true }).Count
$Total = @($Tools.tools).Count
if ($Available -lt 1) { throw "Cloud Run capability manifest has no available tools." }

$Url | Set-Content -LiteralPath (Join-Path $Root "CLOUD_RUN_BACKEND_URL.txt") -Encoding ASCII
Write-Host "" 
Write-Host "AJN PDF CLOUD RUN BACKEND PASSED" -ForegroundColor Green
Write-Host "Backend URL: $Url" -ForegroundColor Green
Write-Host "Backend version: $($Health.version)" -ForegroundColor Green
Write-Host "Available tools: $Available/$Total" -ForegroundColor Green
Write-Host "" 
Write-Host "NEXT STEP IN VERCEL:" -ForegroundColor Yellow
Write-Host "Set NEXT_PUBLIC_PDF_BACKEND_URL=$Url"
Write-Host "Set NEXT_PUBLIC_APP_URL=$VercelOrigin while testing the Vercel preview domain."
Write-Host "Then redeploy the frontend."
