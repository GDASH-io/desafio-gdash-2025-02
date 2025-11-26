#!/bin/bash

# Script para inicializar todo o sistema G-Dash
# Uso: ./start-all.sh {start|stop|status|restart}
# IMPORTANTE: Configure backend/.env com suas credenciais antes de usar!

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
WORKER_DIR="$PROJECT_DIR/worker"

# Variáveis de portas (podem ser alteradas se ocupadas)
RABBITMQ_PORT=5673
RABBITMQ_MGMT_PORT=15673
MONGODB_PORT=27017
BACKEND_PORT=3000
FRONTEND_PORT=5173

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR: $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO: $1${NC}"
}

# Carregar variáveis do .env existente
load_env_file() {
    if [ -f "$BACKEND_DIR/.env" ]; then
        set -a
        source "$BACKEND_DIR/.env"
        set +a
        info "Variáveis carregadas do arquivo .env existente"
    else
        error "Arquivo .env não encontrado em $BACKEND_DIR"
        error "Por favor, crie o arquivo .env com as credenciais necessárias"
        error "Use: cp backend/.env.example backend/.env"
        exit 1
    fi
}

# Função para verificar se porta está livre
port_is_free() {
    local port=$1
    ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1
}

# Função para encontrar porta disponível
find_available_port() {
    local base_port=$1
    local port=$base_port
    local max_attempts=10

    for ((i=0; i<max_attempts; i++)); do
        if port_is_free $port; then
            echo $port
            return 0
        fi
        port=$((port + 1))
    done

    error "Não foi possível encontrar porta disponível a partir de $base_port"
    exit 1
}

# Verificar se Docker está rodando
check_docker() {
    if ! docker info >/dev/null 2>&1; then
        error "Docker não está rodando. Inicie o Docker primeiro."
        exit 1
    fi
    log "Docker está rodando ✓"
}

# Verificar e liberar portas
check_and_allocate_ports() {
    info "Verificando portas disponíveis..."

    # Verificar RabbitMQ
    if ! port_is_free $RABBITMQ_PORT; then
        warn "Porta $RABBITMQ_PORT (RabbitMQ) já está em uso"
        RABBITMQ_PORT=$(find_available_port $RABBITMQ_PORT)
        RABBITMQ_MGMT_PORT=$((RABBITMQ_PORT + 10000))
        info "RabbitMQ será usado na porta $RABBITMQ_PORT"
    fi

    # Verificar MongoDB
    if ! port_is_free $MONGODB_PORT; then
        warn "Porta $MONGODB_PORT (MongoDB) já está em uso"
        MONGODB_PORT=$(find_available_port $MONGODB_PORT)
        info "MongoDB será usado na porta $MONGODB_PORT"
    fi

    # Verificar Backend
    if ! port_is_free $BACKEND_PORT; then
        warn "Porta $BACKEND_PORT (Backend) já está em uso"
        BACKEND_PORT=$(find_available_port $BACKEND_PORT)
        info "Backend será usado na porta $BACKEND_PORT"
    fi

    # Verificar Frontend
    if ! port_is_free $FRONTEND_PORT; then
        warn "Porta $FRONTEND_PORT (Frontend) já está em uso"
        FRONTEND_PORT=$(find_available_port $FRONTEND_PORT)
        info "Frontend será usado na porta $FRONTEND_PORT"
    fi

    log "Portas alocadas com sucesso ✓"
}

# Atualizar .env do backend apenas com as portas corretas (sem alterar secrets)
update_backend_env() {
    info "Atualizando configurações do backend com portas dinâmicas..."
    
    # Ler variáveis existentes do .env
    local node_env="${NODE_ENV:-development}"
    local db_uri="${MONGODB_URI:-mongodb://gdash_user:gdash_password_secure@localhost:$MONGODB_PORT/gdash_weather?authSource=admin}"
    local gemini_key="${GEMINI_API_KEY}"
    local jwt_secret="${JWT_SECRET}"
    local admin_email="${DEFAULT_ADMIN_EMAIL}"
    local admin_password="${DEFAULT_ADMIN_PASSWORD}"
    
    # Validar que GEMINI_API_KEY está configurado
    if [ -z "$gemini_key" ]; then
        error "GEMINI_API_KEY não está configurado em $BACKEND_DIR/.env"
        exit 1
    fi
    
    # Atualizar MongoDB URI com a porta correta se necessário
    db_uri=$(echo "$db_uri" | sed "s/:27017/:$MONGODB_PORT/")
    
    # Atualizar RabbitMQ URL com a porta correta
    local rabbitmq_url="amqp://guest:guest@localhost:$RABBITMQ_PORT/"
    
    # Recriar .env com as portas atualizadas
    cat > "$BACKEND_DIR/.env" << EOF
NODE_ENV=$node_env
MONGODB_URI=$db_uri
GEMINI_API_KEY=$gemini_key
JWT_SECRET=$jwt_secret
DEFAULT_ADMIN_EMAIL=$admin_email
DEFAULT_ADMIN_PASSWORD=$admin_password
RABBITMQ_URL=$rabbitmq_url
EOF
    
    log "Backend configurado com portas dinâmicas ✓"
}

# Limpar containers antigos
cleanup() {
    info "Limpando containers antigos..."
    docker stop rabbitmq mongodb 2>/dev/null || true
    docker rm rabbitmq mongodb 2>/dev/null || true
    log "Containers limpos ✓"
    
    # Limpar pasta dist do backend (problema de permissão)
    info "Limpando build do backend..."
    if [ -d "$BACKEND_DIR/dist" ]; then
        rm -rf "$BACKEND_DIR/dist" 2>/dev/null || sudo rm -rf "$BACKEND_DIR/dist" 2>/dev/null || true
    fi
    
    # Limpar pasta node_modules/.cache
    if [ -d "$BACKEND_DIR/node_modules/.cache" ]; then
        rm -rf "$BACKEND_DIR/node_modules/.cache" 2>/dev/null || true
    fi
    
    log "Build limpo ✓"
}

# Iniciar RabbitMQ
start_rabbitmq() {
    info "Iniciando RabbitMQ na porta $RABBITMQ_PORT..."
    docker run -d --name rabbitmq \
        -p $RABBITMQ_PORT:5672 \
        -p $RABBITMQ_MGMT_PORT:15672 \
        --restart unless-stopped \
        rabbitmq:3-management >/dev/null

    # Aguardar RabbitMQ ficar pronto
    info "Aguardando RabbitMQ ficar pronto..."
    for i in {1..30}; do
        if docker exec rabbitmq rabbitmq-diagnostics -q ping >/dev/null 2>&1; then
            log "RabbitMQ pronto ✓"
            return 0
        fi
        sleep 2
    done
    error "RabbitMQ não ficou pronto em 60 segundos"
    exit 1
}

# Iniciar MongoDB
start_mongodb() {
    info "Iniciando MongoDB na porta $MONGODB_PORT..."
    docker run -d --name mongodb \
        -p $MONGODB_PORT:27017 \
        -e MONGO_INITDB_ROOT_USERNAME=gdash_user \
        -e MONGO_INITDB_ROOT_PASSWORD=gdash_password_secure \
        --restart unless-stopped \
        mongo:latest >/dev/null

    # Aguardar MongoDB ficar pronto
    info "Aguardando MongoDB ficar pronto..."
    for i in {1..30}; do
        if docker exec mongodb mongosh --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
            log "MongoDB pronto ✓"
            return 0
        fi
        sleep 2
    done
    error "MongoDB não ficou pronto em 60 segundos"
    exit 1
}

# Função para iniciar serviço em background
start_service() {
    local name="$1"
    local command="$2"
    local cwd="$3"

    info "Iniciando $name..."

    # Criar arquivo de log
    local log_file="$PROJECT_DIR/logs/${name}.log"
    mkdir -p "$PROJECT_DIR/logs"

    # Iniciar em background com melhor tratamento
    (
        cd "$cwd" || exit 1
        # Para Python, garantir que venv está ativado
        if [ "$name" = "producer" ]; then
            source "$PROJECT_DIR/venv/bin/activate" 2>/dev/null || true
            python producer.py >> "$log_file" 2>&1 &
        else
            eval "$command" >> "$log_file" 2>&1 &
        fi
        echo $! > "$PROJECT_DIR/logs/${name}.pid"
    )

    # Aguardar mais tempo para serviços inicializarem
    sleep 5

    # Verificar se está rodando
    if [ -f "$PROJECT_DIR/logs/${name}.pid" ]; then
        local pid=$(cat "$PROJECT_DIR/logs/${name}.pid")
        if kill -0 "$pid" 2>/dev/null; then
            log "$name iniciado (PID: $pid) ✓"
            return 0
        else
            # Se falhou, mostrar log de erro
            error "$name falhou ao iniciar"
            error "Log:"
            tail -20 "$log_file" | sed 's/^/  /'
            return 1
        fi
    fi

    error "$name falhou ao iniciar (sem PID)"
    return 1
}

# Iniciar todos os serviços
start_all() {
    mkdir -p "$PROJECT_DIR/logs"

    # Backend
    start_service "backend" "npm run start:dev" "$BACKEND_DIR" || {
        error "Falha ao iniciar backend. Verifique o log em logs/backend.log"
        return 1
    }

    # Worker
    start_service "worker" "go run worker.go" "$WORKER_DIR" || {
        error "Falha ao iniciar worker. Verifique o log em logs/worker.log"
        return 1
    }

    # Producer (com venv)
    start_service "producer" "python producer.py" "$PROJECT_DIR" || {
        error "Falha ao iniciar producer. Verifique o log em logs/producer.log"
        return 1
    }

    # Frontend
    start_service "frontend" "npm run dev" "$FRONTEND_DIR" || {
        error "Falha ao iniciar frontend. Verifique o log em logs/frontend.log"
        return 1
    }
}

# Mostrar status
show_status() {
    echo
    echo "========================================"
    echo "           G-DASH STATUS"
    echo "========================================"
    echo

    # Docker containers
    echo "🐳 Docker Containers:"
    docker ps --filter "name=rabbitmq" --filter "name=mongodb" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo

    # Serviços locais
    echo "⚙️  Serviços Locais:"
    local services=("backend" "worker" "producer" "frontend")
    for service in "${services[@]}"; do
        local pid_file="$PROJECT_DIR/logs/${service}.pid"
        local log_file="$PROJECT_DIR/logs/${service}.log"

        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "  ✅ $service (PID: $pid)"
            else
                echo -e "  ❌ $service (PID morto: $pid)"
            fi
        else
            echo -e "  ❌ $service (não iniciado)"
        fi
    done
    echo

    # URLs
    echo "🌐 URLs:"
    echo "  📊 RabbitMQ Management: http://localhost:$RABBITMQ_MGMT_PORT (guest/guest)"
    echo "  🍃 MongoDB: localhost:$MONGODB_PORT"
    echo "  🚀 Backend API: http://localhost:$BACKEND_PORT"
    echo "  🎨 Frontend: http://localhost:$FRONTEND_PORT"
    echo

    # Logs
    echo "📝 Logs em: $PROJECT_DIR/logs/"
    echo "     Backend log: tail -f $PROJECT_DIR/logs/backend.log"
    echo "     Worker log:  tail -f $PROJECT_DIR/logs/worker.log"
    echo "     Producer log: tail -f $PROJECT_DIR/logs/producer.log"
    echo "     Frontend log: tail -f $PROJECT_DIR/logs/frontend.log"
    echo
}

# Parar todos os serviços
stop_all() {
    info "Parando todos os serviços..."

    # Parar serviços locais
    local services=("backend" "worker" "producer" "frontend")
    for service in "${services[@]}"; do
        local pid_file="$PROJECT_DIR/logs/${service}.pid"
        if [ -f "$pid_file" ]; then
            local pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                log "$service parado (PID: $pid)"
            fi
            rm -f "$pid_file"
        fi
    done

    # Parar Docker containers
    docker stop rabbitmq mongodb 2>/dev/null || true
    log "Containers Docker parados"

    # NÃO deleta os logs, apenas os arquivos .pid
    log "Logs preservados em: $PROJECT_DIR/logs/"
}

# Função principal
main() {
    case "${1:-start}" in
        "start")
            log "🚀 Iniciando G-Dash..."
            load_env_file
            check_docker
            check_and_allocate_ports
            cleanup
            update_backend_env
            start_rabbitmq
            start_mongodb
            start_all
            sleep 5
            show_status
            log "🎉 Sistema iniciado com sucesso!"
            ;;
        "stop")
            stop_all
            log "🛑 Sistema parado"
            ;;
        "status")
            show_status
            ;;
        "restart")
            stop_all
            sleep 2
            main "start"
            ;;
        *)
            echo "Uso: $0 {start|stop|status|restart}"
            echo
            echo "Comandos:"
            echo "  start   - Inicia todo o sistema"
            echo "  stop    - Para todo o sistema"
            echo "  status  - Mostra status dos serviços"
            echo "  restart - Reinicia todo o sistema"
            echo
            echo "⚠️  IMPORTANTE: Configure o arquivo backend/.env com suas credenciais antes de usar!"
            echo "   - GEMINI_API_KEY: Sua chave da API Gemini (https://ai.google.dev/)"
            echo "   - JWT_SECRET: Sua chave secreta JWT"
            echo "   - Credenciais do banco de dados"
            echo
            echo "   Copie de backend/.env.example para começar:"
            echo "   cp backend/.env.example backend/.env"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
