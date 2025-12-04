#!/usr/bin/env pwsh
# Script de teste completo do Weather Dashboard

Write-Host "🧪 Testando Weather Dashboard..." -ForegroundColor Cyan
Write-Host ""

# Teste 1: Verificar containers
Write-Host "1️⃣  Verificando containers Docker..." -ForegroundColor Yellow
$containers = docker-compose ps --format json | ConvertFrom-Json
$services = @("mongodb", "rabbitmq", "python-weather-collector", "go-weather-worker", "nestjs-api")

foreach ($service in $services) {
    $container = $containers | Where-Object { $_.Service -eq $service }
    if ($container -and $container.State -eq "running") {
        Write-Host "   ✅ $service está rodando" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $service NÃO está rodando" -ForegroundColor Red
    }
}
Write-Host ""

# Teste 2: Verificar API
Write-Host "2️⃣  Testando API NestJS..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri "http://localhost:3000/api/weather/stats" -Method Get
    Write-Host "   ✅ API respondendo" -ForegroundColor Green
    Write-Host "   📊 Total de registros: $($stats.total_records)" -ForegroundColor Cyan
    Write-Host "   🌡️  Última temperatura: $($stats.latest_record.temperature)°C" -ForegroundColor Cyan
    Write-Host "   💧 Última umidade: $($stats.latest_record.humidity)%" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Erro ao conectar na API: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 3: Verificar MongoDB
Write-Host "3️⃣  Testando MongoDB..." -ForegroundColor Yellow
try {
    $mongoCount = docker exec gdash-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin weather_dashboard --quiet --eval "db.weathers.countDocuments()"
    Write-Host "   ✅ MongoDB conectado" -ForegroundColor Green
    Write-Host "   📊 Documentos na collection: $mongoCount" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Erro ao conectar no MongoDB: $_" -ForegroundColor Red
}
Write-Host ""

# Teste 4: Verificar RabbitMQ
Write-Host "4️⃣  Testando RabbitMQ..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:15672/api/queues/%2F/weather_data" -Method Get -Credential (New-Object System.Management.Automation.PSCredential("admin", (ConvertTo-SecureString "admin123" -AsPlainText -Force)))
    Write-Host "   ✅ RabbitMQ conectado" -ForegroundColor Green
    Write-Host "   📦 Mensagens na fila: $($response.messages)" -ForegroundColor Cyan
    Write-Host "   📥 Mensagens consumidas: $($response.messages_ready)" -ForegroundColor Cyan
} catch {
    Write-Host "   ⚠️  RabbitMQ Management UI não acessível (esperado se não configurado)" -ForegroundColor Yellow
}
Write-Host ""

# Teste 5: Verificar Frontend
Write-Host "5️⃣  Testando Frontend React..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend respondendo em http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Frontend não está rodando. Execute: cd desafio_gdash && npm run dev" -ForegroundColor Yellow
}
Write-Host ""

# Resumo
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Testes concluídos!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 URLs importantes:" -ForegroundColor Cyan
Write-Host "   • Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   • API: http://localhost:3000/api/weather/stats" -ForegroundColor White
Write-Host "   • RabbitMQ: http://localhost:15672 (admin/admin123)" -ForegroundColor White
Write-Host "   • MongoDB: localhost:27017 (admin/admin123)" -ForegroundColor White
Write-Host ""
