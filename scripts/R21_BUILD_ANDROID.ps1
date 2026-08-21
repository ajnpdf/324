param(
  [string]$ManifestUrl = 'https://www.ajnpdf.com/manifest.json',
  [string]$Workspace = '',
  [switch]$Clean
)

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot
if (-not $Workspace) { $Workspace = Join-Path $Root 'mobile-android' }

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is required.' }
if (-not (Get-Command npx -ErrorAction SilentlyContinue)) { throw 'npx is required.' }
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Java/JDK is required by Bubblewrap/Android build tooling.' }

if ($Clean -and (Test-Path $Workspace)) {
  Remove-Item $Workspace -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $Workspace | Out-Null
Push-Location $Workspace
try {
  Write-Host 'AJN PDF Android Trusted Web Activity build' -ForegroundColor Cyan
  if (-not (Test-Path '.\twa-manifest.json')) {
    Write-Host "Initializing from $ManifestUrl" -ForegroundColor Cyan
    Write-Host 'First-time initialization may ask for package/signing details. Recommended package: com.ajnstudio.ajnpdf' -ForegroundColor Yellow
    npx -y @bubblewrap/cli@latest init --manifest="$ManifestUrl"
    if ($LASTEXITCODE -ne 0) { throw 'Bubblewrap initialization failed.' }
  }

  Write-Host 'Building signed Android outputs...' -ForegroundColor Cyan
  npx -y @bubblewrap/cli@latest build
  if ($LASTEXITCODE -ne 0) { throw 'Bubblewrap Android build failed.' }

  $apk = Get-ChildItem -Path . -Recurse -Filter 'app-release-signed.apk' -ErrorAction SilentlyContinue | Select-Object -First 1
  $aab = Get-ChildItem -Path . -Recurse -Filter 'app-release-bundle.aab' -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $apk) { throw 'Build completed without finding app-release-signed.apk.' }
  if (-not $aab) { throw 'Build completed without finding app-release-bundle.aab.' }

  Write-Host "APK: $($apk.FullName)" -ForegroundColor Green
  Write-Host "AAB: $($aab.FullName)" -ForegroundColor Green
  Write-Host 'Publish the Digital Asset Links statement generated for this signing certificate before treating the TWA as verified.' -ForegroundColor Yellow
} finally {
  Pop-Location
}
