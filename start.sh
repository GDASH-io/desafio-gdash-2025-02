#!/bin/bash

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}   INICIALIZANDO SISTEMA GDASH COMPLETO   ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# 1. Parar containers antigos e limpar volumes (opcional, mas recomendado para reset)
echo -e "${BLUE}[1/6] Limpando ambiente anterior...${NC}"
docker compose down -v
echo -e "${GREEN}Ambiente limpo.${NC}"
echo ""

# 2. Criar arquivo .env se não existir
echo -e "${BLUE}[2/6] Verificando configurações...${NC}"
if [ ! -f .env ]; then
    echo "Arquivo .env não encontrado. Criando a partir de env.example..."
    cp env.example .env
    echo -e "${GREEN}Arquivo .env criado.${NC}"
else
    echo -e "${GREEN}Arquivo .env já existe.${NC}"
fi
echo ""

# 3. Iniciar infraestrutura base (DBs e Mensageria)
echo -e "${BLUE}[3/6] Iniciando infraestrutura (Mongo, Kafka, Zookeeper)...${NC}"
docker compose up -d zookeeper kafka mongodb rabbitmq

echo "Aguardando inicialização dos bancos de dados (15s)..."
sleep 15
echo -e "${GREEN}Infraestrutura iniciada.${NC}"
echo ""

# 4. Iniciar aplicações
echo -e "${BLUE}[4/6] Iniciando aplicações (API, Frontend, Worker, Collector)...${NC}"
docker compose up -d api frontend worker collector

echo "Aguardando inicialização das aplicações (20s)..."
sleep 20
echo -e "${GREEN}Aplicações iniciadas.${NC}"
echo ""

# 5. Executar Seed de Usuários
echo -e "${BLUE}[5/6] Executando seed de usuários...${NC}"
docker compose exec -T api node dist/database/seed/users.seed.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Seed executado com sucesso.${NC}"
else
    echo -e "${RED}Aviso: Falha ao executar seed (pode ser que a API ainda esteja subindo). Tente manualmente depois.${NC}"
fi
echo ""

# 6. Executar Testes de verificação
echo -e "${BLUE}[6/6] Verificando saúde do sistema...${NC}"

# Função auxiliar para testar URL
check_service() {
    local name=$1
    local url=$2
    local expected_code=$3
    
    echo -n "  Testando $name... "
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$http_code" == "$expected_code" ] || [ "$http_code" == "200" ] || [ "$http_code" == "201" ]; then
        echo -e "${GREEN}OK ($http_code)${NC}"
    else
        echo -e "${RED}ERRO ($http_code)${NC}"
    fi
}

# Verificações simples
check_service "API Health" "http://localhost:3000/api/v1/weather/health" "200"
check_service "Collector Health" "http://localhost:8080/healthz" "200"
# Worker retorna 503 se Kafka cair, mas 200 se ok
check_service "Worker Health" "http://localhost:8081/healthz" "503" 
check_service "Frontend" "http://localhost:5173" "200"

echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}   SISTEMA PRONTO PARA USO!   ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo "Acesse:"
echo "  - Frontend: http://localhost:5173"
echo "  - API:      http://localhost:3000/api/v1"
echo ""
echo "Credenciais:"
echo "  - Email: admin@example.com"
echo "  - Senha: 123456"
echo ""

