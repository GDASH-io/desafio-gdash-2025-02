# Script para verificar e reiniciar containers se necessário
# Este script deve ser executado periodicamente (ex: a cada 5 minutos)

$ErrorActionPreference = "Continue"

# Navegar para o diretório do projeto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

if (-not (Test-Path "$projectRoot\docker-compose.yml")) {
    Write-Host "Arquivo docker-compose.yml não encontrado" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot

# Função para verificar se Docker está rodando
function Test-DockerRunning {
    try {
        docker info 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Verificar se Docker está rodando
if (-not (Test-DockerRunning)) {
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Docker não está rodando. Tentando iniciar..." -ForegroundColor Yellow
    
    $dockerPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process -FilePath $dockerPath
        Start-Sleep -Seconds 30  # Aguardar Docker iniciar
    } else {
        Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Docker Desktop não encontrado" -ForegroundColor Red
        exit 1
    }
}

# Verificar status dos containers
$allServices = docker-compose ps --services 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Erro ao verificar serviços" -ForegroundColor Red
    exit 1
}

$runningServices = docker-compose ps --services --filter "status=running" 2>&1
$stoppedServices = docker-compose ps --services --filter "status=stopped" 2>&1
$exitedServices = docker-compose ps --services --filter "status=exited" 2>&1

$needsRestart = $false

# Verificar se algum container importante está parado
$criticalServices = @("producer", "worker", "backend", "rabbitmq", "mongodb")

foreach ($service in $criticalServices) {
    if ($allServices -contains $service) {
        $status = docker-compose ps $service --format "{{.Status}}" 2>&1
        if ($status -notmatch "Up" -and $status -notmatch "running") {
            Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Serviço $service está parado (Status: $status)" -ForegroundColor Yellow
            $needsRestart = $true
        }
    }
}

if ($needsRestart) {
    Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Reiniciando containers..." -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Containers reiniciados com sucesso" -ForegroundColor Green
    } else {
        Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Erro ao reiniciar containers" -ForegroundColor Red
    }
} else {
    # Log apenas se houver problema (para não encher o log)
    # Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Todos os containers estão rodando" -ForegroundColor Green
}


