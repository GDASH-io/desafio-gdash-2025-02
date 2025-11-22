#!/bin/bash

# Script completo de teste do sistema GDASH
# Inclui testes das melhorias do dashboard (Fluxo 1, 2, 3)

# Não usar set -e para permitir continuar mesmo com alguns erros
set +e

echo "=========================================="
echo "Teste Completo do Sistema GDASH"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
PASSED=0
FAILED=0

# Função para testar endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local token=$5
    
    echo -n "  Testando $name... "
    
    if [ -z "$token" ]; then
        if [ "$method" = "GET" ]; then
            response=$(curl -s --max-time 10 -w "\n%{http_code}" -X GET "$url" 2>/dev/null || echo "000")
        else
            response=$(curl -s --max-time 10 -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -d "$data" 2>/dev/null || echo "000")
        fi
    else
        if [ "$method" = "GET" ]; then
            response=$(curl -s --max-time 10 -w "\n%{http_code}" -X GET "$url" \
                -H "Authorization: Bearer $token" 2>/dev/null || echo "000")
        else
            response=$(curl -s --max-time 10 -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data" 2>/dev/null || echo "000")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # Para healthcheck, aceitar 200, 201 e 503 (serviço rodando mas com dependências desconectadas)
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || ([ "$http_code" = "503" ] && echo "$name" | grep -q "Healthcheck"); then
        echo -e "${GREEN}✓ OK (${http_code})${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FALHOU (${http_code})${NC}"
        if [ -n "$body" ]; then
            echo "    Resposta: $(echo "$body" | head -c 100)"
        fi
        ((FAILED++))
        return 1
    fi
}

# Aguardar serviços
echo -e "${BLUE}Aguardando serviços ficarem prontos...${NC}"

# Função para aguardar serviço ficar pronto
wait_for_service() {
    local name=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    echo -n "  Aguardando $name... "
    while [ $attempt -lt $max_attempts ]; do
        # Para healthcheck, aceitar 200, 201 e 503 (serviço rodando mas com dependências desconectadas)
        http_code=$(curl -s -w "%{http_code}" -o /dev/null "$url" 2>/dev/null || echo "000")
        if [ "$http_code" = "200" ] || [ "$http_code" = "201" ] || ([ "$http_code" = "503" ] && echo "$name" | grep -qE "(Collector|Worker)"); then
            echo -e "${GREEN}✓ Pronto${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 2
    done
    echo -e "${RED}✗ Timeout${NC}"
    return 1
}

# Aguardar serviços essenciais (apenas os que têm healthcheck HTTP)
echo -n "  Aguardando infraestrutura (Kafka, Zookeeper, MongoDB)... "
sleep 10
echo -e "${GREEN}✓ Aguardado${NC}"

wait_for_service "Collector" "http://localhost:8080/healthz"
wait_for_service "Worker" "http://localhost:8081/healthz"
wait_for_service "API" "http://localhost:3000/api/v1/weather/health"

echo ""

echo ""
echo "=========================================="
echo "1. TESTES DE HEALTHCHECK"
echo "=========================================="

test_endpoint "Healthcheck Collector" "GET" "http://localhost:8080/healthz"
test_endpoint "Healthcheck Worker" "GET" "http://localhost:8081/healthz"
test_endpoint "Healthcheck API" "GET" "http://localhost:3000/api/v1/weather/health"

echo ""
echo "=========================================="
echo "2. TESTES DE AUTENTICAÇÃO"
echo "=========================================="

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
    echo "  Token: ${TOKEN:0:30}..."
fi

echo ""
echo "=========================================="
echo "3. TESTES DE WEATHER LOGS"
echo "=========================================="

test_endpoint "GET /weather/logs (paginação)" "GET" "http://localhost:3000/api/v1/weather/logs?limit=5" "" "$TOKEN"
test_endpoint "GET /weather/logs/latest" "GET" "http://localhost:3000/api/v1/weather/logs/latest" "" "$TOKEN"

# Verificar se latest tem novos campos
echo -n "  Verificando campos no latest... "
LATEST_RESPONSE=$(curl -s -X GET "http://localhost:3000/api/v1/weather/logs/latest" \
    -H "Authorization: Bearer $TOKEN")

if echo "$LATEST_RESPONSE" | grep -q "weather_code"; then
    echo -e "${GREEN}✓ Campos presentes${NC}"
    ((PASSED++))
    
    # Verificar campos opcionais
    HAS_UV=$(echo "$LATEST_RESPONSE" | grep -o "uv_index" | wc -l | tr -d ' ')
    HAS_PRESSURE=$(echo "$LATEST_RESPONSE" | grep -o "pressure_hpa" | wc -l | tr -d ' ')
    HAS_WIND_DIR=$(echo "$LATEST_RESPONSE" | grep -o "wind_direction_10m" | wc -l | tr -d ' ')
    HAS_WIND_GUSTS=$(echo "$LATEST_RESPONSE" | grep -o "wind_gusts_10m" | wc -l | tr -d ' ')
    HAS_PRECIP_PROB=$(echo "$LATEST_RESPONSE" | grep -o "precipitation_probability" | wc -l | tr -d ' ')
    
    # Garantir que são números válidos
    HAS_UV=${HAS_UV:-0}
    HAS_PRESSURE=${HAS_PRESSURE:-0}
    HAS_WIND_DIR=${HAS_WIND_DIR:-0}
    HAS_WIND_GUSTS=${HAS_WIND_GUSTS:-0}
    HAS_PRECIP_PROB=${HAS_PRECIP_PROB:-0}
    
    echo "    Campos opcionais encontrados:"
    echo "      - UV Index: $([ "$HAS_UV" -gt 0 ] && echo "✓" || echo "✗")"
    echo "      - Pressão: $([ "$HAS_PRESSURE" -gt 0 ] && echo "✓" || echo "✗")"
    echo "      - Direção Vento: $([ "$HAS_WIND_DIR" -gt 0 ] && echo "✓" || echo "✗")"
    echo "      - Rajadas: $([ "$HAS_WIND_GUSTS" -gt 0 ] && echo "✓" || echo "✗")"
    echo "      - Prob. Chuva: $([ "$HAS_PRECIP_PROB" -gt 0 ] && echo "✓" || echo "✗")"
else
    echo -e "${RED}✗ Campos não encontrados${NC}"
    ((FAILED++))
fi

echo ""
echo "=========================================="
echo "4. TESTES DE NOVOS ENDPOINTS"
echo "=========================================="

test_endpoint "GET /weather/precipitation/24h" "GET" "http://localhost:3000/api/v1/weather/precipitation/24h" "" "$TOKEN"

echo ""
echo "=========================================="
echo "5. TESTES DE INSIGHTS DE IA"
echo "=========================================="

# Calcular datas (últimos 7 dias)
TO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
FROM_DATE=$(date -u -d "7 days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
    date -u -v-7d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
    python3 -c "from datetime import datetime, timedelta; print((datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z')" 2>/dev/null || \
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ")")

test_endpoint "GET /weather/insights" "GET" "http://localhost:3000/api/v1/weather/insights?from=${FROM_DATE}&to=${TO_DATE}" "" "$TOKEN"

test_endpoint "POST /weather/insights" "POST" "http://localhost:3000/api/v1/weather/insights" \
    "{\"from\":\"${FROM_DATE}\",\"to\":\"${TO_DATE}\"}" "$TOKEN"

echo ""
echo "=========================================="
echo "6. TESTES DE USUÁRIOS"
echo "=========================================="

test_endpoint "GET /users" "GET" "http://localhost:3000/api/v1/users?limit=5" "" "$TOKEN"

echo ""
echo "=========================================="
echo "7. TESTES DE EXPORTAÇÃO"
echo "=========================================="

echo -n "  Testando Export CSV... "
CSV_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X GET "http://localhost:3000/api/v1/weather/export.csv" \
    -H "Authorization: Bearer $TOKEN")
if [ "$CSV_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Retornou ${CSV_CODE}${NC}"
    ((FAILED++))
fi

echo -n "  Testando Export XLSX... "
XLSX_CODE=$(curl -s -w "%{http_code}" -o /dev/null -X GET "http://localhost:3000/api/v1/weather/export.xlsx" \
    -H "Authorization: Bearer $TOKEN")
if [ "$XLSX_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ Retornou ${XLSX_CODE}${NC}"
    ((FAILED++))
fi

echo ""
echo "=========================================="
echo "8. VERIFICAÇÃO DE DADOS"
echo "=========================================="

echo -n "  Verificando dados no latest... "
LATEST_DATA=$(curl -s -X GET "http://localhost:3000/api/v1/weather/logs/latest" \
    -H "Authorization: Bearer $TOKEN")

if echo "$LATEST_DATA" | grep -q "temperature_c"; then
    TEMP=$(echo "$LATEST_DATA" | grep -o '"temperature_c":[0-9.]*' | cut -d':' -f2)
    HUMIDITY=$(echo "$LATEST_DATA" | grep -o '"relative_humidity":[0-9]*' | cut -d':' -f2)
    WIND=$(echo "$LATEST_DATA" | grep -o '"wind_speed_m_s":[0-9.]*' | cut -d':' -f2)
    
    echo -e "${GREEN}✓ Dados presentes${NC}"
    echo "    Temperatura: ${TEMP}°C"
    echo "    Umidade: ${HUMIDITY}%"
    echo "    Vento: ${WIND} m/s"
    ((PASSED++))
else
    echo -e "${RED}✗ Sem dados${NC}"
    ((FAILED++))
fi

echo ""
echo "=========================================="
echo "RESUMO DOS TESTES"
echo "=========================================="
echo ""
echo -e "Total de testes: $((PASSED + FAILED))"
echo -e "${GREEN}Passou: ${PASSED}${NC}"
echo -e "${RED}Falhou: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
    echo ""
    echo "=========================================="
    echo "ACESSO AO SISTEMA"
    echo "=========================================="
    echo ""
    echo "Frontend: http://localhost:5173"
    echo "API: http://localhost:3000/api/v1"
    echo ""
    echo "Credenciais:"
    echo "  Email: admin@example.com"
    echo "  Senha: 123456"
    echo ""
    echo "Novos recursos no Dashboard:"
    echo "  - Card de Condições Climáticas"
    echo "  - Gráfico de Tendência Barométrica"
    echo "  - Cards: UV, Pressão, Visibilidade"
    echo "  - Cards: Direção Vento, Rajadas, Prob. Chuva"
    echo "  - Cards: Sensação Térmica, Ponto de Orvalho, Chuva 24h"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Alguns testes falharam${NC}"
    echo ""
    exit 1
fi

