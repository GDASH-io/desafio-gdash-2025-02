# Script para iniciar Docker Desktop e containers do GDASH
# Este script garante que todos os serviços estejam rodando

$ErrorActionPreference = "Stop"

Write-Host "=== Iniciando Docker e Containers GDASH ===" -ForegroundColor Cyan

# Função para verificar se Docker está rodando
function Test-DockerRunning {
    try {
        docker info 2>&1 | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Função para iniciar Docker Desktop
function Start-DockerDesktop {
    Write-Host "Iniciando Docker Desktop..." -ForegroundColor Yellow
    
    $dockerPath = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process -FilePath $dockerPath
        Write-Host "Docker Desktop iniciado. Aguardando inicialização..." -ForegroundColor Yellow
        
        # Aguardar até Docker estar pronto (máximo 60 segundos)
        $timeout = 60
        $elapsed = 0
        while (-not (Test-DockerRunning) -and $elapsed -lt $timeout) {
            Start-Sleep -Seconds 2
            $elapsed += 2
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
        Write-Host ""
        
        if (Test-DockerRunning) {
            Write-Host "Docker Desktop está rodando!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Timeout: Docker Desktop não iniciou a tempo." -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "Docker Desktop não encontrado em: $dockerPath" -ForegroundColor Red
        Write-Host "Por favor, instale o Docker Desktop primeiro." -ForegroundColor Red
        return $false
    }
}

# Verificar se Docker está rodando
if (-not (Test-DockerRunning)) {
    Write-Host "Docker não está rodando. Tentando iniciar..." -ForegroundColor Yellow
    if (-not (Start-DockerDesktop)) {
        Write-Host "Falha ao iniciar Docker Desktop. Encerrando." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Docker já está rodando!" -ForegroundColor Green
}

# Navegar para o diretório do projeto
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptPath

if (-not (Test-Path "$projectRoot\docker-compose.yml")) {
    Write-Host "Arquivo docker-compose.yml não encontrado em: $projectRoot" -ForegroundColor Red
    exit 1
}

Set-Location $projectRoot
Write-Host "Diretório do projeto: $projectRoot" -ForegroundColor Cyan

# Verificar se os containers já estão rodando
Write-Host "`nVerificando status dos containers..." -ForegroundColor Cyan
$containers = docker-compose ps --services 2>&1

if ($LASTEXITCODE -eq 0) {
    $running = docker-compose ps --services --filter "status=running" 2>&1
    $allServices = docker-compose ps --services 2>&1
    
    if ($running.Count -eq $allServices.Count -and $allServices.Count -gt 0) {
        Write-Host "Todos os containers já estão rodando!" -ForegroundColor Green
        docker-compose ps
        exit 0
    }
}

# Iniciar containers
Write-Host "`nIniciando containers..." -ForegroundColor Cyan
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nContainers iniciados com sucesso!" -ForegroundColor Green
    Write-Host "`nAguardando containers ficarem prontos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host "`nStatus dos containers:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host "`n=== Containers iniciados! ===" -ForegroundColor Green
    Write-Host "Para ver os logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "Para parar: docker-compose down" -ForegroundColor Yellow
} else {
    Write-Host "`nErro ao iniciar containers!" -ForegroundColor Red
    Write-Host "Verifique os logs com: docker-compose logs" -ForegroundColor Yellow
    exit 1
}

