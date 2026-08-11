param(
    [string]$Url = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

if (-not $Url) {
    $UrlFile = Join-Path $Root "CLOUD_RUN_BACKEND_URL.txt"
    if (Test-Path -LiteralPath $UrlFile) {
        $Url = (Get-Content -LiteralPath $UrlFile -Raw).Trim()
    }
}
if (-not $Url) {
    throw "Pass -Url https://...run.app or deploy first so CLOUD_RUN_BACKEND_URL.txt exists."
}
$Url = $Url.TrimEnd("/")

function Invoke-CurlDownload {
    param(
        [Parameter(Mandatory=$true)][string]$Label,
        [Parameter(Mandatory=$true)][string]$Output,
        [Parameter(Mandatory=$true)][string[]]$CurlArgs
    )

    Remove-Item -LiteralPath $Output -Force -ErrorAction SilentlyContinue

    $RawCode = (& curl.exe -sS -o $Output -w "%{http_code}" @CurlArgs)
    $CurlExit = $LASTEXITCODE

    if ($CurlExit -ne 0) {
        $Body = ""
        if (Test-Path -LiteralPath $Output) {
            $Body = (Get-Content -LiteralPath $Output -Raw -ErrorAction SilentlyContinue)
        }
        throw "$($Label): curl exited with code $CurlExit. $Body"
    }

    $HttpCode = 0
    [void][int]::TryParse(($RawCode | Out-String).Trim(), [ref]$HttpCode)

    if ($HttpCode -lt 200 -or $HttpCode -ge 300) {
        $Body = ""
        if (Test-Path -LiteralPath $Output) {
            try { $Body = (Get-Content -LiteralPath $Output -Raw) } catch {}
        }
        throw "$($Label): HTTP $HttpCode. $Body"
    }

    if (-not (Test-Path -LiteralPath $Output)) {
        throw "$($Label): server returned success but no output file was created."
    }

    $Length = (Get-Item -LiteralPath $Output).Length
    if ($Length -lt 1) {
        throw "$($Label): server returned an empty output file."
    }

    Write-Host "$($Label): PASS ($Length bytes)" -ForegroundColor Green
}

Write-Host "Testing $Url" -ForegroundColor Cyan

$Health = Invoke-RestMethod "$Url/health" -TimeoutSec 30
$Ready = Invoke-RestMethod "$Url/ready" -TimeoutSec 30
$Manifest = Invoke-RestMethod "$Url/api/tools" -TimeoutSec 30

if ($Health.status -ne "ok") { throw "/health did not return ok." }
if ($Ready.status -ne "ok") { throw "/ready did not return ok." }

Write-Host "Health: $($Health.status) version=$($Health.version)" -ForegroundColor Green
Write-Host "Ready : $($Ready.status)" -ForegroundColor Green

if ($Ready.checks) {
    Write-Host "Checks:" -ForegroundColor Cyan
    $Ready.checks.PSObject.Properties | ForEach-Object {
        Write-Host " - $($_.Name): $($_.Value)"
        if ($_.Value -ne $true) {
            throw "Readiness check '$($_.Name)' is not healthy."
        }
    }
}

$AvailableTools = @($Manifest.tools | Where-Object { $_.available -eq $true })
$UnavailableTools = @($Manifest.tools | Where-Object { $_.available -ne $true })

Write-Host "Tools : $($AvailableTools.Count)/$(@($Manifest.tools).Count) available" -ForegroundColor Green

$Critical = @(
    "protect-pdf",
    "unlock-pdf",
    "repair-pdf",
    "image-to-text",
    "scanned-pdf-to-word",
    "docx-to-pdf",
    "pdf-to-docx"
)

$Missing = @()
foreach ($Id in $Critical) {
    $Tool = @($Manifest.tools | Where-Object { $_.id -eq $Id } | Select-Object -First 1)
    if ($Tool.Count -eq 0 -or $Tool[0].available -ne $true) {
        $Missing += $Id
    }
}
if ($Missing.Count -gt 0) {
    throw "Critical backend capabilities unavailable: $($Missing -join ', ')"
}
Write-Host "Critical capability manifest: PASS" -ForegroundColor Green

if ($UnavailableTools.Count -gt 0) {
    Write-Host "Dependency-gated capabilities:" -ForegroundColor Yellow
    $UnavailableTools | ForEach-Object {
        Write-Host " - $($_.id): $($_.unavailableReason)"
    }
}

# Explicit CORS preflight. -UseBasicParsing avoids the Windows PowerShell
# HTML/script parsing security prompt.
$CorsHeaders = @{
    Origin = "https://ajn-delta.vercel.app"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "content-type"
}
$Cors = Invoke-WebRequest `
    -UseBasicParsing `
    -Uri "$Url/api/convert/image-to-text" `
    -Method Options `
    -Headers $CorsHeaders `
    -TimeoutSec 30

$AllowedOrigin = [string]$Cors.Headers["Access-Control-Allow-Origin"]
if ($AllowedOrigin -ne "https://ajn-delta.vercel.app") {
    throw "CORS preflight did not allow the Vercel origin. Returned: '$AllowedOrigin'"
}
Write-Host "CORS Vercel origin: PASS" -ForegroundColor Green

$Py = Join-Path $Root "backend\.venv\Scripts\python.exe"
if (-not (Test-Path -LiteralPath $Py)) {
    Write-Host "Local backend venv not found; health/readiness/CORS/capability tests passed. Functional fixture tests skipped." -ForegroundColor Yellow
    exit 0
}
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    Write-Host "curl.exe not found; health/readiness/CORS/capability tests passed. Functional fixture tests skipped." -ForegroundColor Yellow
    exit 0
}

$Tmp = Join-Path $env:TEMP ("ajn-cloud-test-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Tmp -Force | Out-Null

try {
    $Pdf = Join-Path $Tmp "sample.pdf"
    $Png = Join-Path $Tmp "ocr.png"
    $ScanPdf = Join-Path $Tmp "scan.pdf"
    $Docx = Join-Path $Tmp "sample.docx"

    # Text PDF fixture.
    & $Py -c "import fitz; d=fitz.open(); p=d.new_page(); p.insert_text((72,72),'AJN PDF CLOUD RUN TEST',fontsize=20); d.save(r'$Pdf')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate PDF fixture." }

    # High-contrast OCR fixture. Use Arial on Windows when available so the
    # OCR acceptance test verifies real recognition, not just file creation.
    & $Py -c "from PIL import Image,ImageDraw,ImageFont; from pathlib import Path; im=Image.new('RGB',(1600,500),'white'); f=Path(r'C:\Windows\Fonts\arial.ttf'); font=ImageFont.truetype(str(f),96) if f.exists() else ImageFont.load_default(); ImageDraw.Draw(im).text((80,150),'AJN OCR TEST 123',font=font,fill='black'); im.save(r'$Png')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate OCR fixture." }

    # Make a scanned PDF containing the OCR image and no selectable text.
    & $Py -c "import fitz; d=fitz.open(); p=d.new_page(width=1600,height=500); p.insert_image(p.rect,filename=r'$Png'); d.save(r'$ScanPdf')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate scanned PDF fixture." }

    & $Py -c "from docx import Document; d=Document(); d.add_heading('AJN Cloud Run',0); d.add_paragraph('LibreOffice conversion test.'); d.save(r'$Docx')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate DOCX fixture." }

    $Protected = Join-Path $Tmp "protected.pdf"
    Invoke-CurlDownload `
        -Label "Protect PDF" `
        -Output $Protected `
        -CurlArgs @(
            "-F", "file=@$Pdf;type=application/pdf",
            "-F", "user_password=AJNTest123!",
            "-F", "owner_password=AJNOwner123!",
            "-F", "output_name=protected-test",
            "-F", "allow_printing=true",
            "-F", "allow_copying=true",
            "-F", "allow_editing=false",
            "-F", "allow_annotations=false",
            "-F", "allow_form_filling=false",
            "$Url/api/pdf/protect"
        )

    $Unlocked = Join-Path $Tmp "unlocked.pdf"
    Invoke-CurlDownload `
        -Label "Unlock PDF" `
        -Output $Unlocked `
        -CurlArgs @(
            "-F", "file=@$Protected;type=application/pdf",
            "-F", "password=AJNTest123!",
            "-F", "authorized=true",
            "-F", "output_name=unlocked-test",
            "$Url/api/pdf/unlock"
        )

    $Repaired = Join-Path $Tmp "repaired.pdf"
    Invoke-CurlDownload `
        -Label "Repair PDF" `
        -Output $Repaired `
        -CurlArgs @(
            "-F", "file=@$Pdf;type=application/pdf",
            "-F", "output_name=repaired-test",
            "$Url/api/pdf/repair"
        )

    # IMPORTANT:
    # Do not send options_json here. The API defaults it to {} and
    # image OCR defaults language to "eng". This avoids fragile native
    # Windows quoting of JSON inside multipart form arguments.
    $Ocr = Join-Path $Tmp "ocr.txt"
    Invoke-CurlDownload `
        -Label "Image -> Text OCR" `
        -Output $Ocr `
        -CurlArgs @(
            "-F", "files=@$Png;type=image/png",
            "-F", "output_name=ocr-test",
            "$Url/api/convert/image-to-text"
        )

    $OcrText = Get-Content -LiteralPath $Ocr -Raw
    if ($OcrText -notmatch "(?i)AJN" -or $OcrText -notmatch "123") {
        throw "Image -> Text OCR returned a file but did not recognize the expected fixture text. Output: $OcrText"
    }
    Write-Host "Image -> Text OCR content: PASS" -ForegroundColor Green

    $ScanWord = Join-Path $Tmp "scan.docx"
    Invoke-CurlDownload `
        -Label "Scanned PDF -> Word" `
        -Output $ScanWord `
        -CurlArgs @(
            "-F", "files=@$ScanPdf;type=application/pdf",
            "-F", "output_name=scanned-word-test",
            "$Url/api/convert/scanned-pdf-to-word"
        )

    $OfficePdf = Join-Path $Tmp "office.pdf"
    Invoke-CurlDownload `
        -Label "DOCX -> PDF" `
        -Output $OfficePdf `
        -CurlArgs @(
            "-F", "files=@$Docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "-F", "output_name=office-test",
            "$Url/api/convert/docx-to-pdf"
        )

    $BackToWord = Join-Path $Tmp "pdf-to-docx.docx"
    Invoke-CurlDownload `
        -Label "PDF -> DOCX" `
        -Output $BackToWord `
        -CurlArgs @(
            "-F", "files=@$Pdf;type=application/pdf",
            "-F", "output_name=pdf-word-test",
            "$Url/api/convert/pdf-to-docx"
        )

    Write-Host ""
    Write-Host "===============================================" -ForegroundColor DarkGreen
    Write-Host " AJN PDF LIVE BACKEND CRITICAL TESTS PASSED" -ForegroundColor Green
    Write-Host "===============================================" -ForegroundColor DarkGreen
}
finally {
    Remove-Item -LiteralPath $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}
