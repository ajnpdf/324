[CmdletBinding()]
param(
    [string]$Project = "C:\Users\ANJAN PATEL\Downloads\AJN-PDF-dev (2)\AJN-PDF-dev",
    [string]$Alias = "ajn_upload"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$FlutterRoot = Join-Path $Project "apps\ajn_pdf_app"
$AndroidRoot = Join-Path $FlutterRoot "android"
$Keystore = Join-Path $AndroidRoot "upload-keystore.jks"
$Properties = Join-Path $AndroidRoot "key.properties"

if (-not (Test-Path (Join-Path $FlutterRoot "pubspec.yaml"))) {
    throw "Flutter app not found. Run SETUP_AJN_PDF_MULTIPLATFORM_V1.ps1 first."
}
if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
    throw "keytool was not found. Install Android Studio/OpenJDK and reopen PowerShell."
}
if (Test-Path $Keystore) {
    throw "A keystore already exists: $Keystore. Do not overwrite a Play signing key."
}

Write-Host ""
Write-Host "AJN PDF ANDROID UPLOAD SIGNING" -ForegroundColor Cyan
Write-Host "Store the password safely. Losing this key can block future updates." -ForegroundColor Yellow
Write-Host ""

$Secure = Read-Host "Create a strong keystore password (minimum 6 characters)" -AsSecureString
$Bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
try {
    $Password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($Bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Bstr)
}

if ([string]::IsNullOrWhiteSpace($Password) -or $Password.Length -lt 6) {
    throw "Password must contain at least 6 characters."
}

& keytool `
    -genkeypair `
    -v `
    -keystore $Keystore `
    -storepass $Password `
    -keypass $Password `
    -alias $Alias `
    -keyalg RSA `
    -keysize 2048 `
    -validity 10000 `
    -dname "CN=AJN PDF, OU=AJN, O=AJN PDF, L=Hyderabad, ST=Telangana, C=IN"

if ($LASTEXITCODE -ne 0) {
    throw "Keystore creation failed."
}

@"
storePassword=$Password
keyPassword=$Password
keyAlias=$Alias
storeFile=../upload-keystore.jks
"@ | Set-Content -LiteralPath $Properties -Encoding ascii

Write-Host ""
Write-Host "Certificate fingerprints:" -ForegroundColor Cyan
& keytool -list -v -keystore $Keystore -storepass $Password -alias $Alias |
    Select-String "SHA1:|SHA256:"

Set-Location -LiteralPath $Project
$IgnoredKey = git check-ignore "apps/ajn_pdf_app/android/upload-keystore.jks"
$IgnoredProperties = git check-ignore "apps/ajn_pdf_app/android/key.properties"

if (-not $IgnoredKey -or -not $IgnoredProperties) {
    throw "Signing files are not ignored by Git. Do not push until .gitignore is repaired."
}

Write-Host ""
Write-Host "SIGNING CONFIGURED" -ForegroundColor Green
Write-Host "Keystore     : $Keystore"
Write-Host "Key settings : $Properties"
Write-Host ""
Write-Host "Back up the keystore and password in two secure offline locations."
