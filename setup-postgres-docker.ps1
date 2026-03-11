# Docker PostgreSQL Setup for ControlMe
# Requires Docker Desktop to be installed and running

Write-Host "=== Docker PostgreSQL Setup for ControlMe ===" -ForegroundColor Green
Write-Host ""

# Check if Docker is running
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker is not running or not installed" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "Docker is running" -ForegroundColor Green
Write-Host ""

$dbPasswordSecure = Read-Host "Enter a password to use for the PostgreSQL container" -AsSecureString
$dbPassword = [System.Net.NetworkCredential]::new("", $dbPasswordSecure).Password

# Check if container already exists
$existingContainer = docker ps -a --filter "name=controlme-postgres" --format "{{.Names}}"
if ($existingContainer -eq "controlme-postgres") {
    Write-Host "Container 'controlme-postgres' already exists" -ForegroundColor Yellow
    
    $running = docker ps --filter "name=controlme-postgres" --format "{{.Names}}"
    if ($running -eq "controlme-postgres") {
        Write-Host "Container is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting existing container..." -ForegroundColor Yellow
        docker start controlme-postgres
        Write-Host "Container started" -ForegroundColor Green
    }
} else {
    Write-Host "Creating new PostgreSQL container..." -ForegroundColor Yellow
    docker run --name controlme-postgres `
        -e POSTGRES_USER=postgres `
        -e POSTGRES_PASSWORD=$dbPassword `
        -e POSTGRES_DB=controlme `
        -p 5432:5432 `
        -d postgres:15
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Container created and started" -ForegroundColor Green
        Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "Failed to create container" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "PostgreSQL is running on localhost:5432" -ForegroundColor Green
Write-Host "Database: controlme" -ForegroundColor Green
Write-Host "User: postgres" -ForegroundColor Green
Write-Host "Password: the value you entered at setup time" -ForegroundColor Green
Write-Host ""
Write-Host "You can now run migrations:" -ForegroundColor Yellow
Write-Host "cd apps/backend" -ForegroundColor Cyan
Write-Host "npx prisma migrate dev --schema=../../prisma/schema.prisma" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop container: docker stop controlme-postgres" -ForegroundColor Gray
Write-Host "To start container: docker start controlme-postgres" -ForegroundColor Gray

