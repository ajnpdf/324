param(
    [string]$Url = "",
    [switch]$Extended
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Url) {
    $UrlFile = Join-Path $Root "CLOUD_RUN_BACKEND_URL.txt"
    if (Test-Path $UrlFile) {
        $Url = (Get-Content $UrlFile -Raw).Trim()
    }
}
if (-not $Url) {
    throw "Pass -Url https://...run.app or deploy first so CLOUD_RUN_BACKEND_URL.txt exists."
}
$Url = $Url.TrimEnd("/")

if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    throw "curl.exe is required for live multipart acceptance tests."
}

function Assert-OutputFile {
    param(
        [string]$Path,
        [string]$Label,
        [int]$MinimumBytes = 20
    )
    if (-not (Test-Path -LiteralPath $Path)) {
        throw "$Label failed: output file was not created."
    }
    $Length = (Get-Item -LiteralPath $Path).Length
    if ($Length -lt $MinimumBytes) {
        $Body = ""
        try { $Body = Get-Content -LiteralPath $Path -Raw -ErrorAction SilentlyContinue } catch {}
        throw "$Label failed: output is only $Length bytes. $Body"
    }
    Write-Host "$Label: PASS ($Length bytes)" -ForegroundColor Green
}

function Curl-Post {
    param(
        [string]$Output,
        [string[]]$FormArgs,
        [string]$Endpoint,
        [string]$Label
    )
    $Args = @("-fsS", "--max-time", "300", "-o", $Output)
    foreach ($Item in $FormArgs) {
        $Args += @("-F", $Item)
    }
    $Args += "$Url$Endpoint"
    & curl.exe @Args
    if ($LASTEXITCODE -ne 0) {
        throw "$Label failed: curl exited with code $LASTEXITCODE."
    }
    Assert-OutputFile -Path $Output -Label $Label
}

Write-Host "==================================================" -ForegroundColor DarkCyan
Write-Host " AJN PDF LIVE CLOUD RUN ACCEPTANCE" -ForegroundColor Cyan
Write-Host " $Url" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor DarkCyan

$Health = Invoke-RestMethod -Uri "$Url/health" -TimeoutSec 60
$Ready = Invoke-RestMethod -Uri "$Url/ready" -TimeoutSec 60
$Manifest = Invoke-RestMethod -Uri "$Url/api/tools" -TimeoutSec 60

if ($Health.status -ne "ok") { throw "/health is not OK." }
if ($Ready.status -ne "ok") { throw "/ready is not OK." }

Write-Host "Health: $($Health.status) version=$($Health.version)" -ForegroundColor Green
Write-Host "Ready : $($Ready.status)" -ForegroundColor Green
Write-Host "Checks:" -ForegroundColor Green
$Ready.checks.PSObject.Properties | ForEach-Object {
    Write-Host " - $($_.Name): $($_.Value)"
}

$Tools = @($Manifest.tools)
$Available = @($Tools | Where-Object { $_.available -eq $true })
$Unavailable = @($Tools | Where-Object { $_.available -ne $true })

Write-Host "Tools : $($Available.Count)/$($Tools.Count) available" -ForegroundColor Green

$CriticalIds = @(
    "protect-pdf", "unlock-pdf", "repair-pdf",
    "scanned-pdf-to-text", "scanned-pdf-to-word", "scanned-pdf-to-searchable-pdf",
    "image-to-text", "image-to-word", "image-to-searchable-pdf",
    "docx-to-pdf", "xlsx-to-pdf", "pptx-to-pdf",
    "odt-to-pdf", "ods-to-pdf", "odp-to-pdf",
    "pdf-to-docx", "pdf-to-xlsx", "pdf-to-pptx",
    "epub-to-pdf", "mobi-to-pdf", "azw3-to-pdf",
    "pdf-to-mobi", "pdf-to-azw3",
    "msg-to-pdf", "url-to-pdf"
)

$CriticalFailures = @()
foreach ($Id in $CriticalIds) {
    $Entry = @($Tools | Where-Object { $_.id -eq $Id } | Select-Object -First 1)
    if ($Entry.Count -eq 0) {
        $CriticalFailures += "$Id (missing from manifest)"
    }
    elseif ($Entry[0].available -ne $true) {
        $CriticalFailures += "$Id ($($Entry[0].unavailableReason))"
    }
}
if ($CriticalFailures.Count -gt 0) {
    throw "Critical capabilities failed manifest validation: $($CriticalFailures -join '; ')"
}
Write-Host "Critical capability manifest: PASS" -ForegroundColor Green

if ($Unavailable.Count -gt 0) {
    Write-Host "Dependency-gated capabilities:" -ForegroundColor Yellow
    $Unavailable | ForEach-Object {
        Write-Host " - $($_.id): $($_.unavailableReason)"
    }
}

# CORS preflight from the Vercel production preview origin.
$Headers = @{
    Origin = "https://ajn-delta.vercel.app"
    "Access-Control-Request-Method" = "POST"
    "Access-Control-Request-Headers" = "content-type,x-request-id"
}
try {
    $Cors = Invoke-WebRequest -Uri "$Url/api/pdf/protect" -Method Options -Headers $Headers -TimeoutSec 30
    $AllowOrigin = $Cors.Headers["Access-Control-Allow-Origin"]
    if ($AllowOrigin -ne "https://ajn-delta.vercel.app") {
        throw "Unexpected Access-Control-Allow-Origin: $AllowOrigin"
    }
    Write-Host "CORS Vercel origin: PASS" -ForegroundColor Green
}
catch {
    throw "CORS preflight failed: $($_.Exception.Message)"
}

$Fixtures = Join-Path $Root "backend\test-fixtures"
$RequiredFixtures = @("sample.pdf", "ocr.png", "sample.docx", "sample.xlsx", "sample.pptx", "sample.epub")
foreach ($Name in $RequiredFixtures) {
    if (-not (Test-Path -LiteralPath (Join-Path $Fixtures $Name))) {
        throw "Missing live-test fixture: backend\test-fixtures\$Name"
    }
}

$Tmp = Join-Path $env:TEMP ("ajn-cloud-run-r2-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $Tmp -Force | Out-Null

try {
    $Pdf = Join-Path $Fixtures "sample.pdf"
    $Png = Join-Path $Fixtures "ocr.png"
    $Docx = Join-Path $Fixtures "sample.docx"
    $Xlsx = Join-Path $Fixtures "sample.xlsx"
    $Pptx = Join-Path $Fixtures "sample.pptx"
    $Epub = Join-Path $Fixtures "sample.epub"

    # PDF security family
    $Protected = Join-Path $Tmp "protected.pdf"
    Curl-Post -Output $Protected -Endpoint "/api/pdf/protect" -Label "Protect PDF" -FormArgs @(
        "file=@$Pdf;type=application/pdf",
        "user_password=AJNTest123!",
        "owner_password=AJNOwner123!",
        "output_name=protected-test",
        "allow_printing=true",
        "allow_copying=true",
        "allow_editing=false",
        "allow_annotations=false",
        "allow_form_filling=true"
    )

    $Unlocked = Join-Path $Tmp "unlocked.pdf"
    Curl-Post -Output $Unlocked -Endpoint "/api/pdf/unlock" -Label "Unlock PDF" -FormArgs @(
        "file=@$Protected;type=application/pdf",
        "password=AJNTest123!",
        "authorized=true",
        "output_name=unlocked-test"
    )

    $Repaired = Join-Path $Tmp "repaired.pdf"
    Curl-Post -Output $Repaired -Endpoint "/api/pdf/repair" -Label "Repair PDF" -FormArgs @(
        "file=@$Pdf;type=application/pdf",
        "output_name=repaired-test"
    )

    # OCR family
    $OcrText = Join-Path $Tmp "ocr.txt"
    Curl-Post -Output $OcrText -Endpoint "/api/convert/image-to-text" -Label "Image -> Text OCR" -FormArgs @(
        "files=@$Png;type=image/png",
        "output_name=ocr-test",
        'options_json={"language":"eng","dpi":150,"quality":90}'
    )

    $Searchable = Join-Path $Tmp "searchable.pdf"
    Curl-Post -Output $Searchable -Endpoint "/api/convert/image-to-searchable-pdf" -Label "Image -> Searchable PDF" -FormArgs @(
        "files=@$Png;type=image/png",
        "output_name=searchable-test",
        'options_json={"language":"eng","dpi":150,"quality":90}'
    )

    # LibreOffice family
    $DocxPdf = Join-Path $Tmp "docx.pdf"
    Curl-Post -Output $DocxPdf -Endpoint "/api/convert/docx-to-pdf" -Label "DOCX -> PDF" -FormArgs @(
        "files=@$Docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "output_name=docx-test",
        "options_json={}"
    )

    $XlsxPdf = Join-Path $Tmp "xlsx.pdf"
    Curl-Post -Output $XlsxPdf -Endpoint "/api/convert/xlsx-to-pdf" -Label "XLSX -> PDF" -FormArgs @(
        "files=@$Xlsx;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "output_name=xlsx-test",
        "options_json={}"
    )

    $PptxPdf = Join-Path $Tmp "pptx.pdf"
    Curl-Post -Output $PptxPdf -Endpoint "/api/convert/pptx-to-pdf" -Label "PPTX -> PDF" -FormArgs @(
        "files=@$Pptx;type=application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "output_name=pptx-test",
        "options_json={}"
    )

    # PDF editable-output family
    $PdfDocx = Join-Path $Tmp "pdf.docx"
    Curl-Post -Output $PdfDocx -Endpoint "/api/convert/pdf-to-docx" -Label "PDF -> DOCX" -FormArgs @(
        "files=@$Pdf;type=application/pdf",
        "output_name=pdf-docx-test",
        "options_json={}"
    )

    # eBook family
    $EpubPdf = Join-Path $Tmp "epub.pdf"
    Curl-Post -Output $EpubPdf -Endpoint "/api/convert/epub-to-pdf" -Label "EPUB -> PDF" -FormArgs @(
        "files=@$Epub;type=application/epub+zip",
        "output_name=epub-test",
        "options_json={}"
    )

    $PdfMobi = Join-Path $Tmp "sample.mobi"
    Curl-Post -Output $PdfMobi -Endpoint "/api/convert/pdf-to-mobi" -Label "PDF -> MOBI" -FormArgs @(
        "files=@$Pdf;type=application/pdf",
        "output_name=pdf-mobi-test",
        "options_json={}"
    )

    $MobiPdf = Join-Path $Tmp "mobi.pdf"
    Curl-Post -Output $MobiPdf -Endpoint "/api/convert/mobi-to-pdf" -Label "MOBI -> PDF" -FormArgs @(
        "files=@$PdfMobi;type=application/x-mobipocket-ebook",
        "output_name=mobi-pdf-test",
        "options_json={}"
    )

    if ($Extended) {
        $PdfAzw3 = Join-Path $Tmp "sample.azw3"
        Curl-Post -Output $PdfAzw3 -Endpoint "/api/convert/pdf-to-azw3" -Label "PDF -> AZW3" -FormArgs @(
            "files=@$Pdf;type=application/pdf",
            "output_name=pdf-azw3-test",
            "options_json={}"
        )

        $Azw3Pdf = Join-Path $Tmp "azw3.pdf"
        Curl-Post -Output $Azw3Pdf -Endpoint "/api/convert/azw3-to-pdf" -Label "AZW3 -> PDF" -FormArgs @(
            "files=@$PdfAzw3;type=application/vnd.amazon.ebook",
            "output_name=azw3-pdf-test",
            "options_json={}"
        )

        $UrlPdf = Join-Path $Tmp "url.pdf"
        Curl-Post -Output $UrlPdf -Endpoint "/api/convert/url-to-pdf" -Label "URL -> PDF" -FormArgs @(
            "source_url=https://example.com",
            "output_name=url-test",
            "options_json={}"
        )
    }

    Write-Host "`n==================================================" -ForegroundColor DarkGreen
    Write-Host " AJN PDF LIVE BACKEND CRITICAL TESTS PASSED" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor DarkGreen
    if (-not $Extended) {
        Write-Host "Optional extended checks: .\TEST_CLOUD_RUN_BACKEND.ps1 -Extended" -ForegroundColor Yellow
    }
}
finally {
    Remove-Item -LiteralPath $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}
