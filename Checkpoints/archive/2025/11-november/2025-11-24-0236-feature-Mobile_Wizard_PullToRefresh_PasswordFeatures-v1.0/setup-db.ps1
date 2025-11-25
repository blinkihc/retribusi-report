# Docker PostgreSQL Setup Script
# Run this after Docker Desktop is installed and running

Write-Host "🐳 Docker PostgreSQL Setup for Retribusi Report" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📋 Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker installed: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found! Please install Docker Desktop first." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running! Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Stop and remove existing container if exists
Write-Host "📋 Step 2: Cleaning up existing containers..." -ForegroundColor Yellow
$existingContainer = docker ps -a --filter "name=retribusi-postgres" --format "{{.Names}}"
if ($existingContainer) {
    Write-Host "   Stopping existing container..." -ForegroundColor Gray
    docker stop retribusi-postgres | Out-Null
    Write-Host "   Removing existing container..." -ForegroundColor Gray
    docker rm retribusi-postgres | Out-Null
    Write-Host "✅ Cleaned up existing container" -ForegroundColor Green
} else {
    Write-Host "✅ No existing container found" -ForegroundColor Green
}

Write-Host ""

# Start PostgreSQL container
Write-Host "📋 Step 3: Starting PostgreSQL container..." -ForegroundColor Yellow
try {
    docker-compose up -d
    Write-Host "✅ PostgreSQL container started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start container!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Wait for PostgreSQL to be ready
Write-Host "📋 Step 4: Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts -and -not $ready) {
    $attempt++
    Write-Host "   Attempt $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $healthCheck = docker exec retribusi-postgres pg_isready -U postgres 2>&1
        if ($healthCheck -match "accepting connections") {
            $ready = $true
            Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
        } else {
            Start-Sleep -Seconds 2
        }
    } catch {
        Start-Sleep -Seconds 2
    }
}

if (-not $ready) {
    Write-Host "❌ PostgreSQL failed to start in time!" -ForegroundColor Red
    Write-Host "   Check logs: docker logs retribusi-postgres" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Backup existing .env
Write-Host "📋 Step 5: Updating .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup" -Force
    Write-Host "✅ Backed up .env to .env.backup" -ForegroundColor Green
}

Copy-Item ".env.local" ".env" -Force
Write-Host "✅ Updated .env with local database connection" -ForegroundColor Green

Write-Host ""

# Push database schema
Write-Host "📋 Step 6: Creating database tables..." -ForegroundColor Yellow
try {
    bun run db:push
    Write-Host "✅ Database tables created" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create tables!" -ForegroundColor Red
    Write-Host "   Try running manually: bun run db:push" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verify tables
Write-Host "📋 Step 7: Verifying tables..." -ForegroundColor Yellow
$tables = docker exec retribusi-postgres psql -U postgres -d retribusi_dev -c "\dt" 2>&1
if ($tables -match "users" -and $tables -match "opd" -and $tables -match "jenis_retribusi") {
    Write-Host "✅ All tables created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tables might be missing" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 DATABASE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Database Info:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 5432" -ForegroundColor White
Write-Host "   Database: retribusi_dev" -ForegroundColor White
Write-Host "   Username: postgres" -ForegroundColor White
Write-Host "   Password: postgres" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Start server: bun run dev:server" -ForegroundColor White
Write-Host "   2. Test & seed: node test-api.js" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker logs retribusi-postgres" -ForegroundColor White
Write-Host "   Stop DB: docker-compose down" -ForegroundColor White
Write-Host "   Start DB: docker-compose up -d" -ForegroundColor White
Write-Host "   Connect: docker exec -it retribusi-postgres psql -U postgres -d retribusi_dev" -ForegroundColor White
Write-Host ""
