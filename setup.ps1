# Script de Setup Inicial - G-Dash 2025/02 (PowerShell)
# Uso: powershell -ExecutionPolicy Bypass -File setup.ps1

# Configurações
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $PROJECT_DIR "backend"
$FRONTEND_DIR = Join-Path $PROJECT_DIR "frontend"
$LOGS_DIR = Join-Path $PROJECT_DIR "logs"

# Cores (usando Write-Host com cores)
function Write-Success {
    Write-Host "$args" -ForegroundColor Green
}

function Write-Error {
    Write-Host "ERROR: $args" -ForegroundColor Red
}

function Write-Warning {
    Write-Host "WARNING: $args" -ForegroundColor Yellow
}

function Write-Info {
    Write-Host "$args" -ForegroundColor Cyan
}

# Header
Write-Host ""
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🌤️  G-DASH 2025/02 Setup Script   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Função de verificação
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# 1. Verificar pré-requisitos
Write-Info "1️⃣  Verificando pré-requisitos..."
Write-Host ""

$has_errors = $false

if (Test-Command "git") {
    Write-Success "✓ Git encontrado"
} else {
    Write-Error "Git não encontrado"
    $has_errors = $true
}

if (Test-Command "docker") {
    Write-Success "✓ Docker encontrado"
} else {
    Write-Error "Docker não encontrado"
    $has_errors = $true
}

if (Test-Command "node") {
    Write-Success "✓ Node.js encontrado"
} else {
    Write-Error "Node.js não encontrado"
    $has_errors = $true
}

if (Test-Command "npm") {
    Write-Success "✓ npm encontrado"
} else {
    Write-Error "npm não encontrado"
    $has_errors = $true
}

if (Test-Command "python") {
    Write-Success "✓ Python encontrado"
} else {
    Write-Error "Python não encontrado"
    $has_errors = $true
}

if (Test-Command "go") {
    Write-Success "✓ Go encontrado"
} else {
    Write-Error "Go não encontrado"
    $has_errors = $true
}

if ($has_errors) {
    Write-Host ""
    Write-Error "Alguns pré-requisitos não foram encontrados."
    Write-Warning "Instale todos antes de continuar:"
    Write-Host "  - Git: https://git-scm.com/downloads"
    Write-Host "  - Docker: https://www.docker.com/products/docker-desktop"
    Write-Host "  - Node.js 18+: https://nodejs.org/"
    Write-Host "  - Python 3.10+: https://www.python.org/downloads/"
    Write-Host "  - Go 1.20+: https://go.dev/dl/"
    Write-Host ""
    exit 1
}

# 2. Criar arquivo .env se não existir
Write-Host ""
Write-Info "2️⃣  Configurando ambiente..."
Write-Host ""

$ENV_FILE = Join-Path $BACKEND_DIR ".env"
if (!(Test-Path $ENV_FILE)) {
    Write-Warning "Criando .env a partir de .env.example"
    Copy-Item (Join-Path $BACKEND_DIR ".env.example") $ENV_FILE
    Write-Success "✓ .env criado"
} else {
    Write-Success "✓ .env já existe"
}

# 3. Instalar dependências Backend
Write-Host ""
Write-Info "3️⃣  Instalando dependências Backend..."
Write-Host ""

if (Test-Path (Join-Path $BACKEND_DIR "package.json")) {
    Push-Location $BACKEND_DIR
    npm install
    Pop-Location
    Write-Success "✓ Dependências Backend instaladas"
} else {
    Write-Error "package.json não encontrado em backend"
    exit 1
}

# 4. Instalar dependências Frontend
Write-Host ""
Write-Info "4️⃣  Instalando dependências Frontend..."
Write-Host ""

if (Test-Path (Join-Path $FRONTEND_DIR "package.json")) {
    Push-Location $FRONTEND_DIR
    npm install
    Pop-Location
    Write-Success "✓ Dependências Frontend instaladas"
} else {
    Write-Error "package.json não encontrado em frontend"
    exit 1
}

# 5. Criar diretório de logs
Write-Host ""
Write-Info "5️⃣  Preparando diretórios..."
Write-Host ""

if (!(Test-Path $LOGS_DIR)) {
    New-Item -ItemType Directory -Path $LOGS_DIR | Out-Null
}
Write-Success "✓ Diretório de logs criado"

# 6. Resumo final
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Success "✅ Setup concluído com sucesso!"
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Warning "Próximos passos:"
Write-Host ""
Write-Host "1. Inicie o sistema:"
Write-Info "   powershell -ExecutionPolicy Bypass -File .\start-all.ps1 start"
Write-Host ""
Write-Host "2. Acesse http://localhost:5173"
Write-Host ""
Write-Host "3. Login com:"
Write-Info "   Email:  admin@gdash.com"
Write-Info "   Senha:  ChangeMe123!@#_strong_password"
Write-Host ""

Write-Warning "Documentação:"
Write-Host "  • README.md - Descrição do projeto"
Write-Host "  • WINDOWS_SETUP.md - Setup específico para Windows"
Write-Host "  • TECHNICAL_REFERENCE.md - Referência técnica"
Write-Host ""

Write-Success "Boa sorte! 🚀"
Write-Host ""
