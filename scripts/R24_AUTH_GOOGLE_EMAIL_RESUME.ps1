param(
  [string]$ProjectId = 'studio-4223217082-69711',
  [string]$SiteDomain = 'www.ajnpdf.com'
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root
$script:NativeExit = 0

function Section([string]$Text) {
  Write-Host "`n============================================================" -ForegroundColor Cyan
  Write-Host " $Text" -ForegroundColor Cyan
  Write-Host "============================================================" -ForegroundColor Cyan
}

function Invoke-Cmd([string]$Command, [switch]$AllowFailure, [string]$Label = 'Command failed') {
  $saved = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & $env:ComSpec /d /s /c "$Command 2>&1"
    $script:NativeExit = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $saved
  }
  if (-not $AllowFailure -and $script:NativeExit -ne 0) {
    throw "$Label (exit code $($script:NativeExit))."
  }
}

function Set-VercelConfig([string]$Name, [string]$Value) {
  if ([string]::IsNullOrWhiteSpace($Value)) { throw "Empty Vercel value refused for $Name" }
  $tmp = Join-Path $env:TEMP ("ajnpdf-r24-resume-" + [Guid]::NewGuid().ToString('N') + '.txt')
  [IO.File]::WriteAllText($tmp, $Value, [Text.UTF8Encoding]::new($false))
  try {
    Invoke-Cmd "npx -y vercel@latest env rm $Name production -y" -AllowFailure
    Invoke-Cmd "type `"$tmp`" | npx -y vercel@latest env add $Name production --visibility config --no-sensitive" -Label "Unable to configure Vercel env $Name"
    Write-Host "[ENV PASS] $Name" -ForegroundColor Green
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}

Section 'AJN PDF R24.1 :: FIREBASE AUTH RESUME'

Write-Host '[1/5] Verifying AJN PDF target...' -ForegroundColor Yellow
foreach ($command in @('node','npm','npx','gcloud','curl.exe')) {
  if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "$command is required." }
}
if (-not (Test-Path '.vercel\project.json')) { throw 'Vercel project is not linked.' }
$vercelProject = Get-Content '.vercel\project.json' -Raw | ConvertFrom-Json
if ($vercelProject.projectId -ne 'prj_bZQ5WOwR2hjxFkATT6NaiIr1AoN8') { throw 'Wrong Vercel project. Expected AJN PDF.' }
$who = (cmd /c 'npx -y vercel@latest whoami 2>&1' | Out-String)
if ($who -notmatch 'ajnpdf-2086') { throw 'Wrong Vercel account. Expected ajnpdf-2086.' }
Write-Host '[PASS] Correct AJN PDF Vercel account/project.' -ForegroundColor Green

Write-Host '`n[2/5] Reading Firebase Web SDK config through official Management API...' -ForegroundColor Yellow
$AccessToken = (& gcloud auth print-access-token --project=$ProjectId 2>$null | Out-String).Trim()
if (-not $AccessToken) { throw 'Unable to obtain Google Cloud access token.' }
$Headers = @{ Authorization = "Bearer $AccessToken"; 'X-Goog-User-Project' = $ProjectId }
$appListUri = "https://firebase.googleapis.com/v1beta1/projects/$ProjectId/webApps?pageSize=100"
$appList = Invoke-RestMethod -Method Get -Uri $appListUri -Headers $Headers -TimeoutSec 30
$webApps = @($appList.apps | Where-Object { $_ -and ([string]$_.state) -ne 'DELETED' })
if (-not $webApps.Count) { throw 'No active Firebase Web app is registered for AJN PDF.' }
$selected = $null
if ($webApps.Count -eq 1) {
  $selected = $webApps[0]
} else {
  $matches = @($webApps | Where-Object { ([string]$_.displayName) -match '(?i)ajn.*pdf|pdf.*ajn' })
  if ($matches.Count -eq 1) { $selected = $matches[0] }
}
if (-not $selected) {
  Write-Host 'Multiple Firebase Web apps found:' -ForegroundColor Yellow
  $webApps | ForEach-Object { Write-Host (" - " + $_.displayName + " :: " + $_.appId) }
  $chosenId = (Read-Host 'Enter the AJN PDF Firebase Web App ID exactly').Trim()
  $selected = $webApps | Where-Object { $_.appId -eq $chosenId } | Select-Object -First 1
}
if (-not $selected) { throw 'AJN PDF Firebase Web app could not be selected.' }
$escapedAppId = [uri]::EscapeDataString([string]$selected.appId)
$sdkUri = "https://firebase.googleapis.com/v1beta1/projects/-/webApps/$escapedAppId/config"
$sdkConfig = Invoke-RestMethod -Method Get -Uri $sdkUri -Headers $Headers -TimeoutSec 30
$ApiKey = ([string]$sdkConfig.apiKey).Trim()
$AuthDomain = ([string]$sdkConfig.authDomain).Trim()
$AppId = ([string]$sdkConfig.appId).Trim()
if (-not $AuthDomain) { $AuthDomain = "$ProjectId.firebaseapp.com" }
if (-not $ApiKey -or -not $AppId) { throw 'Firebase Web SDK config is incomplete.' }
Write-Host "[PASS] Firebase Web app: $($selected.displayName)" -ForegroundColor Green
Write-Host "[PASS] Firebase App ID recovered." -ForegroundColor Green
Write-Host "[PASS] Firebase API key recovered without printing it." -ForegroundColor Green

Write-Host '`n[3/5] Installing Firebase Web config in Vercel Production...' -ForegroundColor Yellow
Set-VercelConfig 'NEXT_PUBLIC_FIREBASE_API_KEY' $ApiKey
Set-VercelConfig 'NEXT_PUBLIC_FIREBASE_PROJECT_ID' $ProjectId
Set-VercelConfig 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN' $AuthDomain
Set-VercelConfig 'NEXT_PUBLIC_FIREBASE_APP_ID' $AppId
Set-VercelConfig 'FIREBASE_PROJECT_ID' $ProjectId
Invoke-Cmd 'npx -y vercel@latest env rm NEXT_PUBLIC_GOOGLE_CLIENT_ID production -y' -AllowFailure
Write-Host '[PASS] Firebase Vercel production environment configured.' -ForegroundColor Green

Write-Host '`n[4/5] Running production checks...' -ForegroundColor Yellow
$env:NEXT_PUBLIC_FIREBASE_API_KEY=$ApiKey
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID=$ProjectId
$env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$AuthDomain
$env:NEXT_PUBLIC_FIREBASE_APP_ID=$AppId
$env:FIREBASE_PROJECT_ID=$ProjectId
npm ci --no-audit --no-fund
if ($LASTEXITCODE -ne 0) { throw 'npm ci failed.' }
node scripts/verify-r21-product-ecosystem.mjs
if ($LASTEXITCODE -ne 0) { throw 'Auth verification failed.' }
npm run lint
if ($LASTEXITCODE -ne 0) { throw 'Lint failed.' }
npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'TypeScript failed.' }
npm run build
if ($LASTEXITCODE -ne 0) { throw 'Production build failed.' }
Write-Host '[PASS] Google + Email authentication production build.' -ForegroundColor Green

Write-Host '`n[5/5] Deploying authentication to Vercel Production...' -ForegroundColor Yellow
Invoke-Cmd 'npx -y vercel@latest --prod --yes' -Label 'Vercel production deployment failed'
$loginCode = (& curl.exe -L -s -o NUL -w '%{http_code}' "https://$SiteDomain/login" | Out-String).Trim()
$signupCode = (& curl.exe -L -s -o NUL -w '%{http_code}' "https://$SiteDomain/signup" | Out-String).Trim()
if ($loginCode -ne '200' -or $signupCode -ne '200') { throw "Live auth pages failed: login=$loginCode signup=$signupCode" }

$warningText = 'Firebase Authentication is wired but not configured on this deployment.'
$loginHtml = (& curl.exe -L -s "https://$SiteDomain/login" | Out-String)
if ($loginHtml -match [regex]::Escape($warningText)) {
  throw 'Live login still contains the Firebase-not-configured warning after deployment.'
}

Section 'AJN PDF R24.1 :: AUTHENTICATION DEPLOYMENT PASS'
Write-Host 'Email / Gmail + password : ENABLED' -ForegroundColor Green
Write-Host 'Google                   : ENABLED' -ForegroundColor Green
Write-Host 'Password reset           : ENABLED' -ForegroundColor Green
Write-Host 'Facebook                 : NOT USED' -ForegroundColor DarkGray
Write-Host 'GitHub                   : NOT USED' -ForegroundColor DarkGray
Write-Host 'Anonymous / Guest        : DISABLED' -ForegroundColor Green
Write-Host 'Firebase Web config      : INSTALLED' -ForegroundColor Green
Write-Host 'Live /login              : HTTP 200' -ForegroundColor Green
Write-Host 'Live /signup             : HTTP 200' -ForegroundColor Green
Write-Host 'Next acceptance          : test one Email login and one Google login.' -ForegroundColor Yellow
