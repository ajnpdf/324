$ErrorActionPreference = "Stop"

$Repo = "C:\Users\ANJAN PATEL\Desktop\AJN-PDF-GITHUB"
$BaseCommit = "085ee7250d4b753d49f0a53397c2c00a3fe7f342"
$ProdUrl = "https://ajn-pdf-api-rswf5f4f3q-el.a.run.app"
$Site = "https://www.ajnpdf.com"
$GitName = "Anjan Kumar"
$GitEmail = "anjandev325@gmail.com"

$PackageRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PayloadRoot = Join-Path $PackageRoot "payload"
$ChangedListSource = Join-Path $PackageRoot "R17_CHANGED_FILES.txt"
$NotesSource = Join-Path $PackageRoot "R17_TRUST_SEO_RELEASE_NOTES.md"

function Pass([string]$Text) {
    Write-Host "[PASS] $Text" -ForegroundColor Green
}
function Info([string]$Text) {
    Write-Host "[INFO] $Text" -ForegroundColor Cyan
}
function Fail([string]$Text) {
    throw $Text
}
function Write-Utf8NoBom([string]$Path, [string]$Content) {
    $Encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $Encoding)
}
function Replace-Exact([string]$Path, [string]$Old, [string]$New, [string]$Label) {
    $Content = [System.IO.File]::ReadAllText($Path)
    if (-not $Content.Contains($Old)) {
        Fail "R17 source patch anchor missing: $Label"
    }
    $Updated = $Content.Replace($Old, $New)
    Write-Utf8NoBom $Path $Updated
    Pass $Label
}
function Get-LivePage([string]$Url) {
    $Last = $null
    for ($i = 1; $i -le 24; $i++) {
        try {
            $Response = Invoke-WebRequest -Uri $Url -UseBasicParsing -MaximumRedirection 5 -TimeoutSec 30 -Headers @{
                "Cache-Control" = "no-cache"
                "Pragma" = "no-cache"
            }
            if ([int]$Response.StatusCode -eq 200) {
                return $Response
            }
        } catch {
            $Last = $_
        }
        Write-Host "Waiting for $Url [$i/24]" -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
    throw "Live route did not become HTTP 200: $Url`n$Last"
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " AJN PDF R17 :: TRUST + POLICY + INDEXING QUALITY CLOSURE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Backend source       : UNCHANGED" -ForegroundColor Yellow
Write-Host "Cloud Run redeploy   : NO" -ForegroundColor Yellow
Write-Host "R16 URL architecture : PRESERVED" -ForegroundColor Yellow
Write-Host "User main worktree   : WILL NOT BE RESET/STASHED" -ForegroundColor Yellow

if (-not (Test-Path -LiteralPath $Repo)) {
    Fail "Repository not found: $Repo"
}
if (-not (Test-Path -LiteralPath $PayloadRoot)) {
    Fail "R17 payload folder missing: $PayloadRoot"
}
if (-not (Test-Path -LiteralPath $ChangedListSource)) {
    Fail "R17_CHANGED_FILES.txt missing."
}

Set-Location -LiteralPath $Repo

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " VERIFY PRODUCTION BASE WITHOUT TOUCHING LOCAL CHANGES" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

& git.exe fetch origin main
if ($LASTEXITCODE -ne 0) { Fail "git fetch origin main failed." }

$RemoteBase = (& git.exe rev-parse origin/main).Trim()
if ($RemoteBase -ne $BaseCommit) {
    Fail "GitHub main moved since this R17 package was built. Expected $BaseCommit but found $RemoteBase. Stop instead of applying a stale patch."
}
Pass "GitHub main matches exact R17 base commit."

$MainStatusBefore = @(& git.exe status --short)
if ($MainStatusBefore.Count -gt 0) {
    Info "Local main has existing changes. They will remain untouched."
    $MainStatusBefore | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} else {
    Pass "Local main is clean; clean-worktree deployment will still be used."
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Worktree = Join-Path $env:TEMP "AJN-PDF-R17-TRUST-SEO-$Stamp"
$Completed = $false

try {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " CREATE CLEAN R17 WORKTREE" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    & git.exe worktree add --detach $Worktree $BaseCommit
    if ($LASTEXITCODE -ne 0) { Fail "Could not create R17 worktree." }

    $Head = (& git.exe -C $Worktree rev-parse HEAD).Trim()
    if ($Head -ne $BaseCommit) { Fail "R17 worktree has wrong base commit: $Head" }
    Pass "Clean R17 worktree created at exact production base."

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " APPLY R17 PAYLOAD" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    # Copy payload directory CONTENTS into the worktree.
    # Use -Path with wildcard so Windows PowerShell 5.1 preserves both
    # top-level directories (scripts/, src/) and all nested files.
    $PayloadItems = Join-Path $PayloadRoot "*"
    Copy-Item -Path $PayloadItems -Destination $Worktree -Recurse -Force

    $VerifierDestination = Join-Path $Worktree "scripts\verify-r17-trust-seo.mjs"
    if (-not (Test-Path -LiteralPath $VerifierDestination)) {
        Fail "R17 payload copy failed: scripts\verify-r17-trust-seo.mjs is missing."
    }

    Copy-Item -LiteralPath $ChangedListSource -Destination (Join-Path $Worktree "R17_CHANGED_FILES.txt") -Force
    Copy-Item -LiteralPath $NotesSource -Destination (Join-Path $Worktree "R17_TRUST_SEO_RELEASE_NOTES.md") -Force
    Copy-Item -LiteralPath $MyInvocation.MyCommand.Path -Destination (Join-Path $Worktree "R17_TRUST_SEO_SETUP_AND_DEPLOY.ps1") -Force
    Pass "R17 replacement/new files copied."

    # Package script wiring.
    $PackageJson = Join-Path $Worktree "package.json"
    Replace-Exact $PackageJson `
        '    "verify:r16-consistency": "node scripts/verify-r16-consistency.mjs",' `
        ('    "verify:r17-trust-seo": "node scripts/verify-r17-trust-seo.mjs",' + "`r`n" + '    "verify:r16-consistency": "node scripts/verify-r16-consistency.mjs",') `
        "package.json R17 verifier script"
    Replace-Exact $PackageJson `
        'npm run verify:r16-consistency && npm run lint' `
        'npm run verify:r16-consistency && npm run verify:r17-trust-seo && npm run lint' `
        "package.json npm check wiring"

    # R16 sitemap and redirect architecture are intentionally left byte-for-byte unchanged.

    # Give every canonical tool editorial page an internal crawl path to the guide hub.
    $EditorialPath = Join-Path $Worktree "src\components\junction\tool-editorial-content.tsx"
    $EditorialOld = '<Link href="/contact" className="rounded-2xl border border-border bg-card px-5 py-3 text-xs font-black text-card-foreground hover:bg-muted">Report a problem</Link>'
    $EditorialNew = '<Link href="/discover/guides" className="rounded-2xl border border-border bg-card px-5 py-3 text-xs font-black text-card-foreground hover:bg-muted">Guide library</Link>' + "`r`n          " + $EditorialOld
    Replace-Exact $EditorialPath $EditorialOld $EditorialNew "tool editorial guide-library internal link"

    Set-Location -LiteralPath $Worktree

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " R17 SOURCE REGRESSION GATE" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    & node.exe scripts\verify-r17-trust-seo.mjs
    if ($LASTEXITCODE -ne 0) { Fail "R17 trust/SEO verifier failed." }
    Pass "R17 trust/SEO verifier."

    & node.exe scripts\verify-r16-consistency.mjs
    if ($LASTEXITCODE -ne 0) { Fail "R16 consistency regressed." }
    Pass "R16 architecture consistency retained."

    & node.exe scripts\secret-scan.mjs
    if ($LASTEXITCODE -ne 0) { Fail "Source secret scan failed." }
    Pass "Source secret scan."

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " IMMUTABLE DEPENDENCIES + EXISTING FULL CHECK" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    & npm.cmd ci
    if ($LASTEXITCODE -ne 0) { Fail "npm ci failed." }
    Pass "npm ci."

    & npm.cmd run check
    if ($LASTEXITCODE -ne 0) { Fail "npm check failed. R17 worktree preserved for diagnosis: $Worktree" }
    Pass "Existing full npm check including R17 gate."

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " VERIFY EXISTING CLOUD RUN — NO REDEPLOY" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    $Ready = Invoke-RestMethod -Uri "$ProdUrl/ready" -TimeoutSec 30 -Headers @{ "Cache-Control" = "no-cache" }
    if ($Ready.status -ne "ok") { Fail "Existing backend /ready is not ok." }
    if ([int]$Ready.conversion_tools -ne 75) { Fail "Expected 75 conversion tools." }
    if ([int]$Ready.available_conversion_tools -ne 75) { Fail "Expected 75 available conversion tools." }
    if ([int]$Ready.max_file_mb -ne 30) { Fail "Expected live backend max_file_mb=30." }
    if ([int]$Ready.max_total_mb -ne 30) { Fail "Expected live backend max_total_mb=30." }
    Pass "Existing Cloud Run remains 75/75 and 30/30 MB."

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " EXACT R17 DIFF + COMMIT" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    $ExpectedFiles = @(
        Get-Content -LiteralPath (Join-Path $Worktree "R17_CHANGED_FILES.txt") |
        ForEach-Object { $_.Trim() } |
        Where-Object { $_ }
    )

    & git.exe add -- $ExpectedFiles
    if ($LASTEXITCODE -ne 0) { Fail "git add R17 files failed." }

    $ActualStaged = @(& git.exe diff --cached --name-only | ForEach-Object { $_.Trim() } | Where-Object { $_ })
    $Missing = @($ExpectedFiles | Where-Object { $_ -notin $ActualStaged })
    $Unexpected = @($ActualStaged | Where-Object { $_ -notin $ExpectedFiles })
    if ($Missing.Count -gt 0 -or $Unexpected.Count -gt 0) {
        Write-Host "Missing expected staged files:" -ForegroundColor Red
        $Missing
        Write-Host "Unexpected staged files:" -ForegroundColor Red
        $Unexpected
        Fail "R17 staged diff is not exact."
    }
    Pass "Only declared R17 files staged."

    & git.exe config user.name $GitName
    & git.exe config user.email $GitEmail

    & git.exe fetch origin main
    if ($LASTEXITCODE -ne 0) { Fail "Pre-push fetch failed." }
    $RemoteBeforeCommit = (& git.exe rev-parse origin/main).Trim()
    if ($RemoteBeforeCommit -ne $BaseCommit) {
        Fail "GitHub main moved during R17 validation. Stop instead of overwriting concurrent work."
    }

    & git.exe commit -m "fix: align trust policy and indexing content"
    if ($LASTEXITCODE -ne 0) { Fail "R17 commit failed." }

    $R17Commit = (& git.exe rev-parse HEAD).Trim()
    Pass "R17 commit created: $R17Commit"

    & git.exe push origin HEAD:main
    if ($LASTEXITCODE -ne 0) { Fail "R17 push failed. Commit remains in preserved worktree: $Worktree" }

    & git.exe fetch origin main
    $RemoteAfter = (& git.exe rev-parse origin/main).Trim()
    if ($RemoteAfter -ne $R17Commit) { Fail "GitHub main does not match R17 commit after push." }
    Pass "GitHub main updated to R17."

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " VERCEL R17 PRODUCTION DEPLOY" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    # Project identity is copied only after source secret verification/commit and is never staged.
    $SourceProjectFile = Join-Path $Repo ".vercel\project.json"
    if (-not (Test-Path -LiteralPath $SourceProjectFile)) {
        Fail ".vercel/project.json is missing from the user's repository."
    }
    $DeployVercelDir = Join-Path $Worktree ".vercel"
    New-Item -ItemType Directory -Path $DeployVercelDir -Force | Out-Null
    Copy-Item -LiteralPath $SourceProjectFile -Destination (Join-Path $DeployVercelDir "project.json") -Force

    $CachedVercel = $null
    $NpxCache = Join-Path $env:LOCALAPPDATA "npm-cache\_npx"
    if (Test-Path -LiteralPath $NpxCache) {
        $Candidates = @(
            Get-ChildItem -LiteralPath $NpxCache -Directory -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            ForEach-Object { Join-Path $_.FullName "node_modules\.bin\vercel.cmd" } |
            Where-Object { Test-Path -LiteralPath $_ }
        )
        foreach ($Candidate in $Candidates) {
            try {
                $VersionText = (& $Candidate --version 2>&1 | Out-String)
                if ($VersionText -match "59\.1\.3") {
                    $CachedVercel = $Candidate
                    break
                }
            } catch {}
        }
    }

    if ($CachedVercel) {
        Info "Using cached Vercel CLI 59.1.3: $CachedVercel"
        & $CachedVercel deploy --prod --yes --archive=tgz --logs `
            --build-env "NEXT_PUBLIC_PDF_BACKEND_URL=$ProdUrl" `
            --env "NEXT_PUBLIC_PDF_BACKEND_URL=$ProdUrl"
    } else {
        Info "Using pinned npx Vercel 59.1.3 fallback."
        & npx.cmd --yes vercel@59.1.3 deploy --prod --yes --archive=tgz --logs `
            --build-env "NEXT_PUBLIC_PDF_BACKEND_URL=$ProdUrl" `
            --env "NEXT_PUBLIC_PDF_BACKEND_URL=$ProdUrl"
    }
    if ($LASTEXITCODE -ne 0) {
        Fail "Vercel R17 deployment failed. GitHub is already at $R17Commit; resume Vercel only. Worktree: $Worktree"
    }
    Pass "Vercel R17 production deployment."

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " LIVE R17 ACCEPTANCE" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan

    $Paths = @(
        "/", "/about", "/faq", "/privacy", "/transparency", "/limits",
        "/file-processing-policy", "/security", "/discover", "/discover/guides",
        "/merge-pdf", "/pdf-to-word", "/scanned-pdf-to-text",
        "/sitemap.xml", "/robots.txt"
    )
    $Responses = @{}
    foreach ($Path in $Paths) {
        $Responses[$Path] = Get-LivePage "$Site$Path"
        Pass "$Path HTTP 200"
    }

    $PolicyHtml = [string]$Responses["/file-processing-policy"].Content
    if ($PolicyHtml -match '75\s*MB per file' -or $PolicyHtml -match 'five-minute') {
        Fail "Stale file-processing policy is still live."
    }
    if ($PolicyHtml -notmatch '30\s*MB') {
        Fail "Current 30 MB server policy is not visible on live file-processing policy."
    }
    Pass "Live file-processing policy is current."

    $SecurityHtml = [string]$Responses["/security"].Content
    if ($SecurityHtml -notmatch 'anjandev325@gmail\.com' -or $SecurityHtml -match 'anjanpatel325@gmail\.com') {
        Fail "Live security disclosure email is incorrect."
    }
    Pass "Live security disclosure email."

    $AboutHtml = [string]$Responses["/about"].Content
    if ($AboutHtml -notmatch 'Local when it can be') {
        Fail "Live About processing model missing."
    }
    Pass "Live About hybrid-processing section."

    $GuideHtml = [string]$Responses["/discover/guides"].Content
    if ($GuideHtml -notmatch 'Practical guides for real document workflows' -or $GuideHtml -notmatch 'Essential PDF workflows') {
        Fail "Live Discover guide library content missing."
    }
    Pass "Live Discover guide library."

    $MergeHtml = [string]$Responses["/merge-pdf"].Content
    if ($MergeHtml -notmatch 'Guide library') {
        Fail "Tool editorial does not expose the Discover guide-library link."
    }
    Pass "Tool-to-guide internal linking."

    $SitemapHtml = [string]$Responses["/sitemap.xml"].Content
    if ($SitemapHtml -match 'https://www\.ajnpdf\.com/tools/') {
        Fail "Legacy /tools/ URL found in live canonical sitemap."
    }
    Pass "Live R16 canonical sitemap remains free of legacy /tools/ URLs."

    $RobotsHtml = [string]$Responses["/robots.txt"].Content
    if ($RobotsHtml -notmatch 'https://www\.ajnpdf\.com/sitemap\.xml' -or $RobotsHtml -notmatch 'https://www\.ajnpdf\.com/image-sitemap\.xml') {
        Fail "Live robots.txt does not advertise both real XML sitemaps."
    }
    Pass "Live robots.txt sitemap declarations."

    # Remove untracked Vercel project identity before final source scan.
    Remove-Item -LiteralPath $DeployVercelDir -Recurse -Force -ErrorAction SilentlyContinue
    & node.exe scripts\secret-scan.mjs
    if ($LASTEXITCODE -ne 0) { Fail "Final source secret scan failed." }
    Pass "Final source secret scan."

    $Completed = $true

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host " AJN PDF R17 :: PRODUCTION CLOSURE PASS" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Base commit            : $BaseCommit"
    Write-Host "R17 commit             : $R17Commit"
    Write-Host "Git identity           : $GitName <$GitEmail>"
    Write-Host "Cloud Run redeploy     : SKIPPED"
    Write-Host "Backend                : 75/75, 30/30 MB"
    Write-Host "R16 canonical routing  : PRESERVED"
    Write-Host "File policy            : CURRENT"
    Write-Host "Security contact       : CURRENT"
    Write-Host "Discover guides        : LIVE"
    Write-Host "Tool internal links    : LIVE"
    Write-Host "R16 sitemap/robots     : PRESERVED + PASS"
    Write-Host "Vercel production      : PASS"
    Write-Host "User local main        : UNTOUCHED"
    Write-Host ""
    Write-Host "Manual GSC cleanup is listed in R17_TRUST_SEO_RELEASE_NOTES.md." -ForegroundColor Yellow

} catch {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host " R17 STOPPED AT FIRST FAILED GATE" -ForegroundColor Red
    Write-Host "============================================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Your original main worktree was not reset or stashed by R17." -ForegroundColor Yellow
    if (Test-Path -LiteralPath $Worktree) {
        Write-Host "Diagnostic R17 worktree preserved at:" -ForegroundColor Yellow
        Write-Host $Worktree -ForegroundColor Yellow
    }
    throw
} finally {
    Set-Location -LiteralPath $Repo
    if ($Completed -and (Test-Path -LiteralPath $Worktree)) {
        & git.exe worktree remove --force $Worktree
        & git.exe worktree prune
        if ($LASTEXITCODE -eq 0) {
            Pass "Temporary R17 worktree removed after successful closure."
        }
    }
}
