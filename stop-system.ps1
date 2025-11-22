# Script PowerShell para parar o sistema GDASH
# Uso: .\stop-system.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🛑 Parando Sistema GDASH" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Docker está disponível
try {
    docker ps 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Docker não está rodando ou não está acessível." -ForegroundColor Yellow
        exit 0
    }
} catch {
    Write-Host "⚠️  Docker não está disponível." -ForegroundColor Yellow
    exit 0
}

# Parar containers
Write-Host "📦 Parando containers..." -ForegroundColor Cyan
docker compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Sistema GDASH parado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Para remover volumes também (apaga dados):" -ForegroundColor Yellow
    Write-Host "   docker compose down -v" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "⚠️  Alguns containers podem não ter sido parados." -ForegroundColor Yellow
    Write-Host "   Verifique manualmente: docker ps" -ForegroundColor Yellow
    Write-Host ""
}

