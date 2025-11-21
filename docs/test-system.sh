#!/bin/bash

# Script para testar o sistema completo GDASH

set -e

echo "🚀 Iniciando testes do sistema GDASH..."
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local token=$5
    
    echo -n "Testando $name... "
    
    if [ -z "$token" ]; then
        if [ "$method" = "GET" ]; then
            response=$(curl -s -w "\n%{http_code}" -X GET "$url" 2>/dev/null || echo "000")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -d "$data" 2>/dev/null || echo "000")
        fi
    else
        if [ "$method" = "GET" ]; then
            response=$(curl -s -w "\n%{http_code}" -X GET "$url" \
                -H "Authorization: Bearer $token" 2>/dev/null || echo "000")
        else
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" 2>/dev/null || echo "000")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ OK (${http_code})${NC}"
        return 0
    else
        echo -e "${RED}✗ FALHOU (${http_code})${NC}"
        echo "  Resposta: $body"
        return 1
    fi
}

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços ficarem prontos..."
sleep 10

# Teste 1: Healthcheck do Collector
echo ""
echo "1️⃣ Testando Collector (Python)..."
test_endpoint "Healthcheck Collector" "GET" "http://localhost:8080/healthz"

# Teste 2: Healthcheck do Worker
echo ""
echo "2️⃣ Testando Worker (Go)..."
test_endpoint "Healthcheck Worker" "GET" "http://localhost:8081/healthz"

# Teste 3: Healthcheck da API
echo ""
echo "3️⃣ Testando API NestJS..."
test_endpoint "Healthcheck API" "GET" "http://localhost:3000/api/v1/weather/health"

# Teste 4: Login
echo ""
echo "4️⃣ Testando Autenticação..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"123456"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Falha no login${NC}"
    echo "  Resposta: $LOGIN_RESPONSE"
    exit 1
else
    echo -e "${GREEN}✓ Login OK${NC}"
    echo "  Token obtido: ${TOKEN:0:20}..."
fi

# Teste 5: Buscar logs de clima
echo ""
echo "5️⃣ Testando Endpoint de Weather Logs..."
test_endpoint "GET /weather/logs" "GET" "http://localhost:3000/api/v1/weather/logs?limit=5" "" "$TOKEN"

# Teste 6: Buscar último log
echo ""
echo "6️⃣ Testando Último Log..."
test_endpoint "GET /weather/logs/latest" "GET" "http://localhost:3000/api/v1/weather/logs/latest" "" "$TOKEN"

# Teste 7: Buscar Insights
echo ""
echo "7️⃣ Testando Insights de IA..."
# Calcular datas (últimos 7 dias)
TO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
FROM_DATE=$(date -u -d "7 days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v-7d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || python3 -c "from datetime import datetime, timedelta; print((datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z')")

test_endpoint "GET /weather/insights" "GET" "http://localhost:3000/api/v1/weather/insights?from=${FROM_DATE}&to=${TO_DATE}" "" "$TOKEN"

# Teste 8: Gerar Insights (POST)
echo ""
echo "8️⃣ Testando Geração de Insights..."
test_endpoint "POST /weather/insights" "POST" "http://localhost:3000/api/v1/weather/insights" \
    "{\"from\":\"${FROM_DATE}\",\"to\":\"${TO_DATE}\"}" "$TOKEN"

# Teste 9: Listar Usuários
echo ""
echo "9️⃣ Testando CRUD de Usuários..."
test_endpoint "GET /users" "GET" "http://localhost:3000/api/v1/users?limit=5" "" "$TOKEN"

# Teste 10: Export CSV
echo ""
echo "🔟 Testando Export CSV..."
CSV_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "http://localhost:3000/api/v1/weather/export.csv" \
    -H "Authorization: Bearer $TOKEN")
CSV_CODE=$(echo "$CSV_RESPONSE" | tail -n1)
if [ "$CSV_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Export CSV OK${NC}"
else
    echo -e "${YELLOW}⚠ Export CSV retornou ${CSV_CODE}${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo ""
echo "📊 Resumo:"
echo "  - Frontend: http://localhost:5173"
echo "  - API: http://localhost:3000/api/v1"
echo "  - MongoDB: localhost:27017"
echo "  - Kafka: localhost:9092"
echo ""
echo "🔑 Credenciais:"
echo "  - Email: admin@example.com"
echo "  - Senha: 123456"
echo ""

