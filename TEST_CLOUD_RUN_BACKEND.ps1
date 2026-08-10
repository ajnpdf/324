param([string]$Url = "")
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $Url) {
    $UrlFile = Join-Path $Root "CLOUD_RUN_BACKEND_URL.txt"
    if (Test-Path $UrlFile) { $Url = (Get-Content $UrlFile -Raw).Trim() }
}
if (-not $Url) { throw "Pass -Url https://...run.app or deploy first so CLOUD_RUN_BACKEND_URL.txt exists." }
$Url = $Url.TrimEnd('/')

Write-Host "Testing $Url" -ForegroundColor Cyan
$Health = Invoke-RestMethod "$Url/health" -TimeoutSec 30
$Ready = Invoke-RestMethod "$Url/ready" -TimeoutSec 30
$Manifest = Invoke-RestMethod "$Url/api/tools" -TimeoutSec 30
$Available = @($Manifest.tools | Where-Object { $_.available -eq $true }).Count
$Unavailable = @($Manifest.tools | Where-Object { -not $_.available })
Write-Host "Health: $($Health.status) version=$($Health.version)" -ForegroundColor Green
Write-Host "Ready : $($Ready.status)" -ForegroundColor Green
Write-Host "Tools : $Available/$(@($Manifest.tools).Count) available" -ForegroundColor Green
if ($Unavailable.Count) {
    Write-Host "Dependency-gated tools:" -ForegroundColor Yellow
    $Unavailable | ForEach-Object { Write-Host " - $($_.id): $($_.unavailableReason)" }
}

$Py = Join-Path $Root "backend\.venv\Scripts\python.exe"
if (-not (Test-Path $Py)) {
    Write-Host "Local backend venv not found; endpoint/capability tests passed. Functional fixture tests skipped." -ForegroundColor Yellow
    exit 0
}
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    Write-Host "curl.exe not found; endpoint/capability tests passed. Functional fixture tests skipped." -ForegroundColor Yellow
    exit 0
}

$Tmp = Join-Path $env:TEMP ("ajn-cloud-test-" + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory $Tmp -Force | Out-Null
try {
    $Pdf = Join-Path $Tmp "sample.pdf"
    $Png = Join-Path $Tmp "ocr.png"
    $Docx = Join-Path $Tmp "sample.docx"
    & $Py -c "import fitz; d=fitz.open(); p=d.new_page(); p.insert_text((72,72),'AJN PDF CLOUD RUN TEST'); d.save(r'$Pdf')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate PDF fixture." }
    & $Py -c "from PIL import Image,ImageDraw; im=Image.new('RGB',(1200,300),'white'); ImageDraw.Draw(im).text((50,100),'AJN OCR TEST 123',fill='black'); im.save(r'$Png')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate OCR fixture." }
    & $Py -c "from docx import Document; d=Document(); d.add_heading('AJN Cloud Run',0); d.add_paragraph('LibreOffice conversion test.'); d.save(r'$Docx')"
    if ($LASTEXITCODE -ne 0) { throw "Could not generate DOCX fixture." }

    $Protected = Join-Path $Tmp "protected.pdf"
    & curl.exe -fsS -o $Protected -F "file=@$Pdf;type=application/pdf" -F "user_password=AJNTest123!" -F "owner_password=AJNOwner123!" -F "output_name=protected-test" -F "allow_printing=true" -F "allow_copying=true" -F "allow_editing=false" -F "allow_annotations=false" -F "allow_form_filling=false" "$Url/api/pdf/protect"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $Protected)) { throw "Protect PDF live test failed." }
    Write-Host "Protect PDF: PASS" -ForegroundColor Green

    $Unlocked = Join-Path $Tmp "unlocked.pdf"
    & curl.exe -fsS -o $Unlocked -F "file=@$Protected;type=application/pdf" -F "password=AJNTest123!" -F "authorized=true" -F "output_name=unlocked-test" "$Url/api/pdf/unlock"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $Unlocked)) { throw "Unlock PDF live test failed." }
    Write-Host "Unlock PDF : PASS" -ForegroundColor Green

    $Ocr = Join-Path $Tmp "ocr.txt"
    & curl.exe -fsS -o $Ocr -F "files=@$Png;type=image/png" -F "output_name=ocr-test" -F 'options_json={"language":"eng"}' "$Url/api/convert/image-to-text"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $Ocr)) { throw "OCR live test failed." }
    Write-Host "OCR image->text: PASS" -ForegroundColor Green

    $OfficePdf = Join-Path $Tmp "office.pdf"
    & curl.exe -fsS -o $OfficePdf -F "files=@$Docx;type=application/vnd.openxmlformats-officedocument.wordprocessingml.document" -F "output_name=office-test" -F "options_json={}" "$Url/api/convert/docx-to-pdf"
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path $OfficePdf)) { throw "DOCX to PDF live test failed." }
    Write-Host "DOCX -> PDF: PASS" -ForegroundColor Green

    Write-Host "AJN PDF LIVE BACKEND CRITICAL TESTS PASSED" -ForegroundColor Green
}
finally {
    Remove-Item $Tmp -Recurse -Force -ErrorAction SilentlyContinue
}
