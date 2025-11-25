# 🚀 Script de Inicialização Rápida - GDASH

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    GDASH - Weather Intelligence System        " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    docker --version | Out-Null
    Write-Host "✅ Docker instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado! Por favor, instale o Docker Desktop." -ForegroundColor Red
    Write-Host "   Download: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar Docker Compose
Write-Host "🔍 Verificando Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verificar arquivo .env
if (-not (Test-Path ".env")) {
    Write-Host "⚙️  Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Arquivo .env criado" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Configure as seguintes variáveis no arquivo .env:" -ForegroundColor Yellow
    Write-Host "   - OPENWEATHER_API_KEY (obtenha em https://openweathermap.org/api)" -ForegroundColor White
    Write-Host "   - OPENAI_API_KEY (opcional, para insights de IA)" -ForegroundColor White
    Write-Host "   - JWT_SECRET (use uma chave forte)" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "Deseja continuar? (S/N)"
    if ($continue -ne "S" -and $continue -ne "s") {
        Write-Host "Instalação cancelada." -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ Arquivo .env encontrado" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🐳 Iniciando containers Docker..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down 2>$null

Write-Host ""
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Yellow
Write-Host "   Isso pode levar alguns minutos na primeira vez..." -ForegroundColor Gray
Write-Host ""

# Iniciar containers
docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Green
    Write-Host "✅ Sistema iniciado com sucesso!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "📊 Status dos serviços:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "🌐 Acesse os serviços:" -ForegroundColor Cyan
    Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor White
    Write-Host "   API:       http://localhost:3000" -ForegroundColor White
    Write-Host "   API Docs:  http://localhost:3000/api/docs" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📝 Comandos úteis:" -ForegroundColor Cyan
    Write-Host "   Ver logs:         docker-compose logs -f" -ForegroundColor White
    Write-Host "   Parar serviços:   docker-compose down" -ForegroundColor White
    Write-Host "   Reiniciar:        docker-compose restart" -ForegroundColor White
    Write-Host ""
    
    Write-Host "📚 Documentação completa em: docs/GETTING-STARTED.md" -ForegroundColor Yellow
    Write-Host ""
    
    $openBrowser = Read-Host "Deseja abrir o frontend no navegador? (S/N)"
    if ($openBrowser -eq "S" -or $openBrowser -eq "s") {
        Start-Process "http://localhost:5173"
    }
    
} else {
    Write-Host ""
    Write-Host "❌ Erro ao iniciar containers!" -ForegroundColor Red
    Write-Host "   Verifique os logs com: docker-compose logs" -ForegroundColor Yellow
    exit 1
}
