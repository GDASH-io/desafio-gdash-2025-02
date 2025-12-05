# Script para inicializar todo o sistema G-Dash no Windows
# Uso: powershell -ExecutionPolicy Bypass -File start-all.ps1 start
#      powershell -ExecutionPolicy Bypass -File start-all.ps1 stop

param(
    [string]$Command = "start"
)

# Variáveis globais
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $PROJECT_DIR "backend"
$FRONTEND_DIR = Join-Path $PROJECT_DIR "frontend"
$WORKER_DIR = Join-Path $PROJECT_DIR "worker"
$LOGS_DIR = Join-Path $PROJECT_DIR "logs"

$RABBITMQ_PORT = 5673
$MONGODB_PORT = 27017
$BACKEND_PORT = 3000
$FRONTEND_PORT = 5173

# Cores
function Write-Success {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $args" -ForegroundColor Green
}

function Write-Error {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ERROR: $args" -ForegroundColor Red
}

function Write-Warning {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] WARNING: $args" -ForegroundColor Yellow
}

function Write-Info {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] INFO: $args" -ForegroundColor Cyan
}

# Criar diretório de logs se não existir
if (!(Test-Path $LOGS_DIR)) {
    New-Item -ItemType Directory -Path $LOGS_DIR | Out-Null
}

# Verificar .env
function Check-EnvFile {
    $envFile = Join-Path $BACKEND_DIR ".env"
    if (!(Test-Path $envFile)) {
        Write-Error "Arquivo .env não encontrado em $BACKEND_DIR"
        Write-Error "Use: Copy-Item backend\.env.example backend\.env"
        exit 1
    }
    Write-Success ".env encontrado ✓"
}

# Verificar se porta está livre
function Port-IsFree {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $false
    }
    catch {
        return $true
    }
}

# Encontrar porta disponível
function Find-AvailablePort {
    param([int]$BasePort)
    $port = $BasePort
    $maxAttempts = 10
    
    for ($i = 0; $i -lt $maxAttempts; $i++) {
        if (Port-IsFree -Port $port) {
            return $port
        }
        $port++
    }
    
    Write-Error "Não foi possível encontrar porta disponível a partir de $BasePort"
    exit 1
}

# Verificar Docker
function Check-Docker {
    try {
        $dockerVersion = docker --version 2>$null
        if ($null -eq $dockerVersion) {
            throw "Docker não respondeu"
        }
        Write-Success "Docker está rodando ✓"
    }
    catch {
        Write-Error "Docker não está rodando. Inicie o Docker Desktop primeiro."
        exit 1
    }
}

# Parar todos os serviços
function Stop-AllServices {
    Write-Info "Parando todos os serviços..."
    
    # Parar processos Node
    try {
        Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Success "Processos Node parados"
    }
    catch {
        Write-Warning "Nenhum processo Node encontrado"
    }
    
    # Parar processos Worker (Go)
    try {
        Get-Process worker -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Success "Worker (Go) parado"
    }
    catch {
        Write-Warning "Nenhum processo Worker encontrado"
    }

    # Parar processos Python
    try {
        Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*producer*" } | Stop-Process -Force
        Write-Success "Processos Python parados"
    }
    catch {
        Write-Warning "Nenhum processo Python encontrado"
    }
    
    # Parar Vite (npm dev server)
    try {
        Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
        Write-Success "Vite parado"
    }
    catch {
        Write-Warning "Nenhum processo Vite encontrado"
    }
    
    # Parar containers Docker
    Write-Info "Parando containers Docker..."
    docker stop rabbitmq mongodb 2>$null | Out-Null
    Write-Success "Containers Docker parados"
    
    Start-Sleep -Seconds 1
    Write-Success "Todos os serviços parados ✓"
}

# Iniciar serviços
function Start-AllServices {
    Write-Info "Iniciando sistema G-Dash..."
    
    # Verificar portas
    Write-Info "Verificando portas disponíveis..."
    
    if (!(Port-IsFree -Port $RABBITMQ_PORT)) {
        Write-Warning "Porta $RABBITMQ_PORT já em uso"
        $RABBITMQ_PORT = Find-AvailablePort -BasePort $RABBITMQ_PORT
        Write-Info "RabbitMQ será usado na porta $RABBITMQ_PORT"
    }
    
    if (!(Port-IsFree -Port $MONGODB_PORT)) {
        Write-Warning "Porta $MONGODB_PORT já em uso"
        $MONGODB_PORT = Find-AvailablePort -BasePort $MONGODB_PORT
        Write-Info "MongoDB será usado na porta $MONGODB_PORT"
    }
    
    if (!(Port-IsFree -Port $BACKEND_PORT)) {
        Write-Warning "Porta $BACKEND_PORT já em uso"
        $BACKEND_PORT = Find-AvailablePort -BasePort $BACKEND_PORT
        Write-Info "Backend será usado na porta $BACKEND_PORT"
    }
    
    if (!(Port-IsFree -Port $FRONTEND_PORT)) {
        Write-Warning "Porta $FRONTEND_PORT já em uso"
        $FRONTEND_PORT = Find-AvailablePort -BasePort $FRONTEND_PORT
        Write-Info "Frontend será usado na porta $FRONTEND_PORT"
    }
    
    # Iniciar Docker
    Write-Info "Iniciando containers Docker..."
    
    docker run -d `
        --name rabbitmq `
        -p ${RABBITMQ_PORT}:5672 `
        -p $((RABBITMQ_PORT + 10000)):15672 `
        -e RABBITMQ_DEFAULT_USER=guest `
        -e RABBITMQ_DEFAULT_PASS=guest `
        rabbitmq:3.12-management 2>$null
    
    docker run -d `
        --name mongodb `
        -p ${MONGODB_PORT}:27017 `
        -e MONGO_INITDB_ROOT_USERNAME=gdash_user `
        -e MONGO_INITDB_ROOT_PASSWORD=gdash_password_secure `
        -e MONGO_INITDB_DATABASE=gdash_weather `
        mongo:7.0 2>$null
    
    Start-Sleep -Seconds 5
    Write-Success "Docker containers iniciados ✓"
    
    # Iniciar Backend
    Write-Info "Iniciando Backend..."
    Push-Location $BACKEND_DIR
    $backendLog = Join-Path $LOGS_DIR "backend.log"
    Start-Process npm -ArgumentList "start" -NoNewWindow -RedirectStandardOutput $backendLog -RedirectStandardError $backendLog
    Pop-Location
    Write-Success "Backend iniciado (porta $BACKEND_PORT)"
    
    # Iniciar Frontend
    Write-Info "Iniciando Frontend..."
    Push-Location $FRONTEND_DIR
    $frontendLog = Join-Path $LOGS_DIR "frontend.log"
    Start-Process npm -ArgumentList "run dev" -NoNewWindow -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendLog
    Pop-Location
    Write-Success "Frontend iniciado (porta $FRONTEND_PORT)"
    
    # Iniciar Worker (Go)
    Write-Info "Iniciando Worker (Go)..."
    Push-Location $WORKER_DIR
    $workerLog = Join-Path $LOGS_DIR "worker.log"
    Start-Process "go" -ArgumentList "run worker.go" -NoNewWindow -RedirectStandardOutput $workerLog -RedirectStandardError $workerLog
    Pop-Location
    Write-Success "Worker iniciado"
    
    # Iniciar Producer
    Write-Info "Iniciando Producer..."
    Push-Location $PROJECT_DIR
    $producerLog = Join-Path $LOGS_DIR "producer.log"
    $pythonExe = python --version 2>&1 | Select-Object -First 1
    if ($pythonExe) {
        Start-Process python -ArgumentList "producer/producer.py" -NoNewWindow -RedirectStandardOutput $producerLog -RedirectStandardError $producerLog
        Write-Success "Producer iniciado"
    }
    else {
        Write-Warning "Python não encontrado, Producer não foi iniciado"
    }
    Pop-Location
    
    Start-Sleep -Seconds 5
    Write-Success "Sistema iniciado com sucesso! ✓"
    Write-Info ""
    Write-Info "URLs:"
    Write-Info "  Frontend:  http://localhost:$FRONTEND_PORT"
    Write-Info "  Backend:   http://localhost:$BACKEND_PORT"
    Write-Info "  RabbitMQ:  http://localhost:$((RABBITMQ_PORT + 10000))"
    Write-Info ""
    Write-Info "Credenciais:"
    Write-Info "  Email: admin@gdash.com"
    Write-Info "  Senha: admin123456"
    Write-Info ""
}

# Main
Check-EnvFile
Check-Docker

switch ($Command.ToLower()) {
    "start" {
        Stop-AllServices  # Limpar tudo antes
        Start-AllServices
    }
    "stop" {
        Stop-AllServices
    }
    "status" {
        Write-Info "Verificando status..."
        Get-Process node -ErrorAction SilentlyContinue | ForEach-Object { Write-Success "Node rodando: $($_.ProcessName) (PID: $($_.Id))" }
        Get-Process python -ErrorAction SilentlyContinue | ForEach-Object { Write-Success "Python rodando: $($_.ProcessName) (PID: $($_.Id))" }
        Get-Process worker -ErrorAction SilentlyContinue | ForEach-Object { Write-Success "Worker (Go) rodando: $($_.ProcessName) (PID: $($_.Id))" }
        docker ps | Select-Object -Skip 1 | ForEach-Object { Write-Success "Docker: $_" }
    }
    "restart" {
        Stop-AllServices
        Start-Sleep -Seconds 2
        Start-AllServices
    }
    default {
        Write-Info "Uso: powershell -ExecutionPolicy Bypass -File start-all.ps1 [comando]"
        Write-Info ""
        Write-Info "Comandos:"
        Write-Info "  start   - Inicia todo o sistema"
        Write-Info "  stop    - Para todo o sistema"
        Write-Info "  status  - Mostra status dos serviços"
        Write-Info "  restart - Reinicia todo o sistema"
    }
}
