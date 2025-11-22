# Script PowerShell para iniciar o sistema GDASH
# Uso: .\start-system.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 Iniciando Sistema GDASH" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está instalado
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker não encontrado"
    }
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não está instalado ou não está no PATH!" -ForegroundColor Red
    Write-Host "   Por favor, instale o Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar se Docker Compose está disponível
try {
    $composeVersion = docker compose version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose não encontrado"
    }
    Write-Host "✅ Docker Compose encontrado: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose não encontrado!" -ForegroundColor Red
    exit 1
}

# Verificar se Docker Desktop está rodando
Write-Host ""
Write-Host "🔍 Verificando se Docker Desktop está rodando..." -ForegroundColor Yellow
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Desktop está rodando" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Docker Desktop não está rodando. Tentando iniciar..." -ForegroundColor Yellow
        
        # Tentar iniciar Docker Desktop (caminho padrão)
        $dockerPaths = @(
            "C:\Program Files\Docker\Docker\Docker Desktop.exe",
            "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
            "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe"
        )
        
        $dockerFound = $false
        foreach ($path in $dockerPaths) {
            if (Test-Path $path) {
                Write-Host "   Iniciando Docker Desktop em: $path" -ForegroundColor Yellow
                Start-Process $path
                $dockerFound = $true
                break
            }
        }
        
        if (-not $dockerFound) {
            Write-Host "❌ Docker Desktop não encontrado nos caminhos padrão." -ForegroundColor Red
            Write-Host "   Por favor, inicie o Docker Desktop manualmente e tente novamente." -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "⏳ Aguardando Docker Desktop iniciar (30 segundos)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Verificar novamente
        $retries = 0
        $maxRetries = 10
        while ($retries -lt $maxRetries) {
            docker ps 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Docker Desktop iniciado com sucesso!" -ForegroundColor Green
                break
            }
            $retries++
            Write-Host "   Tentativa $retries/$maxRetries..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        }
        
        if ($retries -eq $maxRetries) {
            Write-Host "❌ Docker Desktop não iniciou a tempo. Tente iniciar manualmente." -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Erro ao verificar Docker: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Iniciando containers Docker..." -ForegroundColor Cyan
Write-Host ""

# Executar docker compose up
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "⏳ Aguardando serviços iniciarem (10 segundos)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Write-Host ""
    Write-Host "📊 Status dos serviços:" -ForegroundColor Cyan
    docker compose ps
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Sistema GDASH iniciado com sucesso!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Acesse os serviços:" -ForegroundColor Cyan
    Write-Host "   Frontend: http://localhost:5173" -ForegroundColor White
    Write-Host "   API:      http://localhost:3000/api/v1" -ForegroundColor White
    Write-Host "   Health:   http://localhost:3000/api/v1/weather/health" -ForegroundColor White
    Write-Host ""
    Write-Host "🔐 Credenciais padrão:" -ForegroundColor Cyan
    Write-Host "   Email:    admin@example.com" -ForegroundColor White
    Write-Host "   Senha:    123456" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Para ver os logs:" -ForegroundColor Cyan
    Write-Host "   docker compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Host "🛑 Para parar o sistema:" -ForegroundColor Cyan
    Write-Host "   docker compose down" -ForegroundColor White
    Write-Host "   ou execute: .\stop-system.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro ao iniciar os containers!" -ForegroundColor Red
    Write-Host "   Verifique os logs: docker compose logs" -ForegroundColor Yellow
    exit 1
}

