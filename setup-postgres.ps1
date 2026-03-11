# PostgreSQL Setup Script for ControlMe
# Run this script as Administrator if needed

Write-Host "=== PostgreSQL Setup for ControlMe ===" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "Checking PostgreSQL installation..." -ForegroundColor Yellow

$pgPath = Get-Command psql -ErrorAction SilentlyContinue
if (-not $pgPath) {
    Write-Host "PostgreSQL not found in PATH" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL:" -ForegroundColor Yellow
    Write-Host "1. Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Cyan
    Write-Host "2. Or use Chocolatey: choco install postgresql" -ForegroundColor Cyan
    Write-Host "3. Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=<your_password> -p 5432:5432 -d postgres" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host "PostgreSQL found at: $($pgPath.Source)" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL service is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService) {
    $running = $pgService | Where-Object { $_.Status -eq 'Running' }
    if ($running) {
        Write-Host "PostgreSQL service is running" -ForegroundColor Green
    } else {
        Write-Host "PostgreSQL service found but not running" -ForegroundColor Yellow
        Write-Host "Attempting to start service..." -ForegroundColor Yellow
        try {
            Start-Service -Name $pgService[0].Name
            Write-Host "Service started successfully" -ForegroundColor Green
        } catch {
            Write-Host "Failed to start service. Please start it manually." -ForegroundColor Red
            Write-Host "Service name: $($pgService[0].Name)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "PostgreSQL service not found. Checking if running on port 5432..." -ForegroundColor Yellow
}

# Test connection
Write-Host ""
Write-Host "Testing connection to PostgreSQL..." -ForegroundColor Yellow

$securePassword = Read-Host "Enter the PostgreSQL password for user 'postgres'" -AsSecureString
$env:PGPASSWORD = [System.Net.NetworkCredential]::new("", $securePassword).Password
$testConnection = psql -h localhost -U postgres -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Connection successful!" -ForegroundColor Green
    Write-Host ""
    
    # Create database
    Write-Host "Creating database 'controlme'..." -ForegroundColor Yellow
    $createDb = psql -h localhost -U postgres -d postgres -c "CREATE DATABASE controlme;" 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $createDb -match "already exists") {
        Write-Host "Database 'controlme' is ready" -ForegroundColor Green
        Write-Host ""
        Write-Host "=== Setup Complete ===" -ForegroundColor Green
        Write-Host "You can now run migrations:" -ForegroundColor Yellow
        Write-Host "cd apps/backend" -ForegroundColor Cyan
        Write-Host "npx prisma migrate dev --schema=../../prisma/schema.prisma" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to create database. Error:" -ForegroundColor Red
        Write-Host $createDb -ForegroundColor Red
    }
} else {
    Write-Host "Connection failed. Please check:" -ForegroundColor Red
    Write-Host "1. PostgreSQL is installed and running" -ForegroundColor Yellow
    Write-Host "2. Service is started (check Services.msc)" -ForegroundColor Yellow
    Write-Host "3. The password you entered is correct (or update your .env file)" -ForegroundColor Yellow
    Write-Host "4. Port 5432 is not blocked by firewall" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Connection test output:" -ForegroundColor Yellow
    Write-Host $testConnection
}

$env:PGPASSWORD = ""

