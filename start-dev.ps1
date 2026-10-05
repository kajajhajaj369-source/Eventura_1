# EVENTURA – Local Development Start Script (Windows PowerShell)
# Run this from the project root: .\start-dev.ps1

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURE THESE BEFORE RUNNING
# ─────────────────────────────────────────────────────────────────────────────
$DATABASE_URL       = "postgresql://neondb_owner:npg_6Rd4OYrocxsB@ep-tiny-sea-b58kfric-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require"
$CLERK_PUB_KEY      = "pk_test_YW1wbGUtZ2Vja28tNzQ2LmNsZXJrLmFjY291bnRzLmRldiQ"
$CLERK_SECRET_KEY   = "sk_test_mWFMYPNMbagKK3VHQvePpqR0po4lo63q5kwefJlyiE"
# ─────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  EVENTURA – Starting local development servers" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Build & Start API server (port 5000) ─────────────────────────────────
Write-Host "[API]  Building api-server..." -ForegroundColor Yellow

$env:DATABASE_URL           = $DATABASE_URL
$env:CLERK_PUBLISHABLE_KEY  = $CLERK_PUB_KEY
$env:CLERK_SECRET_KEY       = $CLERK_SECRET_KEY
$env:PORT                   = "5000"
$env:NODE_ENV               = "development"

# Build first (esbuild)
Push-Location ".\artifacts\api-server"
pnpm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[API]  Build FAILED. Fix errors above and try again." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

Write-Host "[API]  Build OK. Starting server on http://localhost:5000 ..." -ForegroundColor Green

$apiJob = Start-Job -ScriptBlock {
    param($dbUrl, $clerkPub, $clerkSecret)
    $env:DATABASE_URL           = $dbUrl
    $env:CLERK_PUBLISHABLE_KEY  = $clerkPub
    $env:CLERK_SECRET_KEY       = $clerkSecret
    $env:PORT                   = "5000"
    $env:NODE_ENV               = "development"
    Set-Location $using:PWD
    node --enable-source-maps .\artifacts\api-server\dist\index.mjs
} -ArgumentList $DATABASE_URL, $CLERK_PUB_KEY, $CLERK_SECRET_KEY

# Give the API a moment to start and seed demo data
Write-Host "[API]  Waiting for API server to start and seed demo data..." -ForegroundColor Yellow
Start-Sleep -Seconds 4

# ── 2. Start Frontend Vite dev server (port 3000) ────────────────────────────
Write-Host "[WEB]  Starting Vite frontend on http://localhost:3000 ..." -ForegroundColor Green

$env:PORT       = "3000"
$env:BASE_PATH  = "/"
$env:VITE_CLERK_PUBLISHABLE_KEY = $CLERK_PUB_KEY

$webJob = Start-Job -ScriptBlock {
    param($clerkPub)
    $env:PORT                       = "3000"
    $env:BASE_PATH                  = "/"
    $env:VITE_CLERK_PUBLISHABLE_KEY = $clerkPub
    Set-Location $using:PWD
    pnpm --filter @workspace/eventura run dev
} -ArgumentList $CLERK_PUB_KEY

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Both servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend  →  http://localhost:3000" -ForegroundColor White
Write-Host "  API       →  http://localhost:5000/api/healthz" -ForegroundColor White
Write-Host "  Role demo →  http://localhost:3000/dev/role-preview" -ForegroundColor White
Write-Host ""
Write-Host "  Press Ctrl+C to stop both servers." -ForegroundColor Gray
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Stream output from both jobs until Ctrl+C
try {
    while ($true) {
        Receive-Job -Job $apiJob | ForEach-Object { Write-Host "[API] $_" -ForegroundColor DarkCyan }
        Receive-Job -Job $webJob | ForEach-Object { Write-Host "[WEB] $_" -ForegroundColor DarkGreen }
        Start-Sleep -Milliseconds 500

        if ($apiJob.State -eq "Failed" -or $webJob.State -eq "Failed") {
            Write-Host "A server crashed. Check output above." -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "`nStopping servers..." -ForegroundColor Yellow
    Stop-Job -Job $apiJob, $webJob -ErrorAction SilentlyContinue
    Remove-Job -Job $apiJob, $webJob -ErrorAction SilentlyContinue
    Write-Host "Done." -ForegroundColor Gray
}
