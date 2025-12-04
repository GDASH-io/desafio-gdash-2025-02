# Railway Deploy Helper Script
# Execute este script localmente para preparar o projeto antes do deploy

Write-Host "🚀 Preparando projeto para deploy na Railway..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se todos os arquivos necessários existem
Write-Host "📋 Verificando arquivos necessários..." -ForegroundColor Yellow

$requiredFiles = @(
    "docker-compose.yml",
    "docs/RAILWAY_DEPLOY.md",
    "railway.toml",
    ".env",
    "nestjs-api/Dockerfile",
    "python-weather-collector/Dockerfile",
    "go-weather-worker/Dockerfile",
    "desafio_gdash/Dockerfile",
    "desafio_gdash/nginx.conf"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file - AUSENTE!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "❌ Alguns arquivos necessários estão faltando!" -ForegroundColor Red
    exit 1
}

# 2. Verificar se o .env está configurado
Write-Host "🔐 Verificando variáveis de ambiente..." -ForegroundColor Yellow

$envContent = Get-Content .env -Raw
$requiredVars = @(
    "MONGO_USERNAME",
    "MONGO_PASSWORD",
    "RABBITMQ_USER",
    "RABBITMQ_PASS",
    "JWT_SECRET",
    "DEFAULT_USER_EMAIL",
    "DEFAULT_USER_PASSWORD"
)

foreach ($var in $requiredVars) {
    if ($envContent -match "$var=(.+)") {
        $value = $matches[1].Trim()
        if ($value -and $value -ne "" -and $value -notlike "*your_*" -and $value -notlike "*changeme*") {
            Write-Host "  ✅ $var configurado" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $var precisa ser atualizado" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ❌ $var não encontrado" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Gerar chaves de segurança se necessário
Write-Host "🔑 Gerando chaves de segurança..." -ForegroundColor Yellow

function New-SecureKey {
    param([int]$length = 32)
    $bytes = New-Object byte[] $length
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    $rng.GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()
}

$jwtSecret = New-SecureKey -length 32
$rabbitPass = New-SecureKey -length 16
$adminPass = New-SecureKey -length 12

Write-Host ""
Write-Host "📝 Copie estas chaves para usar na Railway:" -ForegroundColor Cyan
Write-Host ""
Write-Host "JWT_SECRET=$jwtSecret" -ForegroundColor White
Write-Host "RABBITMQ_PASS=$rabbitPass" -ForegroundColor White
Write-Host "DEFAULT_USER_PASSWORD=$adminPass" -ForegroundColor White
Write-Host ""

# 4. Verificar Git
Write-Host "📦 Verificando Git..." -ForegroundColor Yellow

if (Test-Path .git) {
    Write-Host "  ✅ Repositório Git inicializado" -ForegroundColor Green
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "  ⚠️  Existem alterações não commitadas:" -ForegroundColor Yellow
        Write-Host ""
        git status --short
        Write-Host ""
        Write-Host "  💡 Faça commit das mudanças antes do deploy!" -ForegroundColor Cyan
    } else {
        Write-Host "  ✅ Working tree limpo" -ForegroundColor Green
    }
    
    # Verificar remote
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "  ✅ Remote configurado: $remote" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Nenhum remote configurado" -ForegroundColor Yellow
        Write-Host "  💡 Configure com: git remote add origin <url>" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ❌ Git não inicializado" -ForegroundColor Red
    Write-Host "  💡 Execute: git init && git add . && git commit -m 'Initial commit'" -ForegroundColor Cyan
}

Write-Host ""

# 5. Verificar dependências
Write-Host "📚 Verificando dependências..." -ForegroundColor Yellow

# NestJS
if (Test-Path "nestjs-api/node_modules") {
    Write-Host "  ✅ NestJS - dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  NestJS - executar: cd nestjs-api && npm install" -ForegroundColor Yellow
}

# Frontend
if (Test-Path "desafio_gdash/node_modules") {
    Write-Host "  ✅ Frontend - dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Frontend - executar: cd desafio_gdash && npm install" -ForegroundColor Yellow
}

# Go
if (Test-Path "go-weather-worker/go.sum") {
    Write-Host "  ✅ Go Worker - dependências configuradas" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Go Worker - executar: cd go-weather-worker && go mod download" -ForegroundColor Yellow
}

# Python
if (Test-Path "python-weather-collector/requirements.txt") {
    Write-Host "  ✅ Python Collector - requirements.txt existe" -ForegroundColor Green
} else {
    Write-Host "  ❌ Python Collector - requirements.txt não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Verificação completa!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Leia o arquivo docs/RAILWAY_DEPLOY.md para instruções detalhadas" -ForegroundColor White
Write-Host "   2. Ou use docs/RAILWAY_QUICK_START.md para deploy rápido (10 min)" -ForegroundColor White
Write-Host "   3. Faça commit de todas as mudanças: git add . && git commit -m 'Preparar deploy'" -ForegroundColor White
Write-Host "   4. Push para GitHub: git push origin main" -ForegroundColor White
Write-Host "   5. Acesse railway.app e conecte seu repositório" -ForegroundColor White
Write-Host "   6. Configure as variáveis de ambiente em cada serviço" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Boa sorte com o deploy! 🚀" -ForegroundColor Green
