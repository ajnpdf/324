$ErrorActionPreference = "Stop"

$Root = $PSScriptRoot
$Target = Join-Path $Root "backend\tessdata"
New-Item -ItemType Directory -Path $Target -Force | Out-Null

$Languages = @{
  eng = "English"
  hin = "Hindi"
  tel = "Telugu"
  tam = "Tamil"
  kan = "Kannada"
  mal = "Malayalam"
  osd = "Orientation detection"
}

foreach ($Entry in $Languages.GetEnumerator() | Sort-Object Name) {
  $Code = $Entry.Key
  $Name = $Entry.Value
  $Destination = Join-Path $Target "$Code.traineddata"
  if (Test-Path -LiteralPath $Destination) {
    Write-Host "OCR language already present: $Name ($Code)" -ForegroundColor DarkGreen
    continue
  }
  $Url = "https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/$Code.traineddata"
  Write-Host "==> Downloading OCR language: $Name ($Code)" -ForegroundColor Cyan
  try {
    Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing -TimeoutSec 180
  } catch {
    Remove-Item -LiteralPath $Destination -Force -ErrorAction SilentlyContinue
    throw "Unable to download $Name OCR language data from the official Tesseract tessdata_fast repository. Check the internet connection and run setup again."
  }
  if ((Get-Item -LiteralPath $Destination).Length -lt 100000) {
    Remove-Item -LiteralPath $Destination -Force -ErrorAction SilentlyContinue
    throw "$Name OCR language data was incomplete. Run setup again."
  }
}

Write-Host "OCR language data ready: English, Hindi, Telugu, Tamil, Kannada, Malayalam and orientation detection." -ForegroundColor Green
