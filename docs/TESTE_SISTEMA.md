# Guia de Teste do Sistema GDASH

Este documento descreve como testar o sistema completo após a implementação da Fase 6.

## 🚀 Pré-requisitos

- Docker e Docker Compose instalados
- Portas disponíveis: 3000, 5173, 8080, 8081, 27017, 9092, 9093, 15672

## 📋 Passo 1: Iniciar os Serviços

```bash
# Na raiz do projeto
docker-compose up --build -d
```

Isso irá iniciar:
- Zookeeper (porta 2181)
- Kafka (portas 9092, 9093)
- MongoDB (porta 27017)
- RabbitMQ (portas 5672, 15672)
- Collector Python (porta 8080)
- Worker Go (porta 8081)
- API NestJS (porta 3000)
- Frontend React (porta 5173)

## ⏳ Passo 2: Aguardar Inicialização

Aguarde aproximadamente 30-60 segundos para todos os serviços iniciarem completamente.

```bash
# Verificar logs
docker-compose logs -f

# Ou verificar status
docker-compose ps
```

## 🧪 Passo 3: Testar Endpoints

### Opção A: Usar o Script Automatizado

```bash
./test-system.sh
```

### Opção B: Testar Manualmente

#### 3.1. Healthchecks

```bash
# Collector
curl http://localhost:8080/healthz

# Worker
curl http://localhost:8081/healthz

# API
curl http://localhost:3000/api/v1/weather/health
```

#### 3.2. Autenticação

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# Salvar o token retornado para usar nos próximos testes
export TOKEN="seu_token_aqui"
```

#### 3.3. Weather Logs

```bash
# Listar logs (requer autenticação)
curl -X GET "http://localhost:3000/api/v1/weather/logs?limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Último log
curl -X GET "http://localhost:3000/api/v1/weather/logs/latest" \
  -H "Authorization: Bearer $TOKEN"
```

#### 3.4. Insights de IA (NOVO!)

```bash
# Calcular datas (últimos 7 dias)
TO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
FROM_DATE=$(date -u -d "7 days ago" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || \
  python3 -c "from datetime import datetime, timedelta; print((datetime.utcnow() - timedelta(days=7)).isoformat() + 'Z')")

# Buscar insights (com cache)
curl -X GET "http://localhost:3000/api/v1/weather/insights?from=${FROM_DATE}&to=${TO_DATE}" \
  -H "Authorization: Bearer $TOKEN"

# Forçar regeneração de insights
curl -X POST "http://localhost:3000/api/v1/weather/insights" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"from\":\"${FROM_DATE}\",\"to\":\"${TO_DATE}\"}"
```

#### 3.5. Export de Dados

```bash
# Export CSV
curl -X GET "http://localhost:3000/api/v1/weather/export.csv" \
  -H "Authorization: Bearer $TOKEN" \
  -o weather_logs.csv

# Export XLSX
curl -X GET "http://localhost:3000/api/v1/weather/export.xlsx" \
  -H "Authorization: Bearer $TOKEN" \
  -o weather_logs.xlsx
```

#### 3.6. Usuários

```bash
# Listar usuários (admin only)
curl -X GET "http://localhost:3000/api/v1/users" \
  -H "Authorization: Bearer $TOKEN"
```

## 🌐 Passo 4: Testar Frontend

1. Abra o navegador em: **http://localhost:5173**

2. Faça login:
   - Email: `admin@example.com`
   - Senha: `123456`

3. Verifique o Dashboard:
   - ✅ Cards com dados atuais (temperatura, umidade, vento, etc.)
   - ✅ Gráfico de temperatura e irradiância
   - ✅ **NOVO: Seção de Insights de IA** com:
     - Resumo gerado por IA
     - Pontuações (conforto e produção PV)
     - Métricas PV (soiling risk, cloudy days, heat derating)
     - Estatísticas
     - Alertas contextuais

4. Navegue para outras páginas:
   - `/records` - Tabela de registros com export
   - `/users` - CRUD de usuários (admin only)

## 🔍 Passo 5: Verificar Pipeline Completo

### 5.1. Verificar Coleta de Dados

```bash
# Ver logs do collector
docker logs gdash-collector -f

# Verificar se está coletando dados
# O collector deve publicar no Kafka a cada 1 hora (ou intervalo configurado)
```

### 5.2. Verificar Processamento

```bash
# Ver logs do worker
docker logs gdash-worker -f

# O worker deve consumir do Kafka e enviar para a API
```

### 5.3. Verificar Dados no MongoDB

```bash
# Conectar ao MongoDB
docker exec -it gdash-mongodb mongosh -u root -p root --authenticationDatabase admin

# No MongoDB shell:
use gdash

# Verificar logs de clima
db.weather_logs.countDocuments()
db.weather_logs.find().sort({timestamp: -1}).limit(5).pretty()

# Verificar insights (NOVO!)
db.insights_cache.countDocuments()
db.insights_cache.find().sort({generated_at: -1}).limit(1).pretty()

# Verificar usuários
db.users.find().pretty()
```

## 🐛 Troubleshooting

### Problema: Serviços não iniciam

```bash
# Verificar logs
docker-compose logs

# Reiniciar serviços
docker-compose restart

# Reconstruir imagens
docker-compose up --build --force-recreate
```

### Problema: API retorna erro 500

```bash
# Verificar logs da API
docker logs gdash-api -f

# Verificar conexão com MongoDB
docker exec -it gdash-api ping mongodb
```

### Problema: Frontend não carrega

```bash
# Verificar logs do frontend
docker logs gdash-frontend -f

# Verificar se a API está acessível
curl http://localhost:3000/api/v1/weather/health
```

### Problema: Insights não aparecem

1. Verificar se há dados no período solicitado:
   ```bash
   # Verificar quantos logs existem
   docker exec -it gdash-mongodb mongosh -u root -p root --authenticationDatabase admin \
     --eval "use gdash; db.weather_logs.countDocuments()"
   ```

2. Se não houver dados, aguardar o collector coletar (intervalo padrão: 1 hora)

3. Ou forçar coleta manualmente (se o collector tiver endpoint para isso)

4. Verificar logs da API:
   ```bash
   docker logs gdash-api | grep -i insight
   ```

## ✅ Checklist de Validação

- [ ] Todos os serviços estão rodando (`docker-compose ps`)
- [ ] Healthchecks retornam 200 OK
- [ ] Login funciona e retorna token
- [ ] Endpoint de weather logs retorna dados
- [ ] **Endpoint de insights retorna dados válidos** (NOVO!)
- [ ] Frontend carrega corretamente
- [ ] Dashboard exibe dados
- [ ] **Seção de Insights aparece no Dashboard** (NOVO!)
- [ ] Export CSV/XLSX funciona
- [ ] CRUD de usuários funciona (admin)

## 📊 Métricas Esperadas

Após algumas horas de execução:

- **Weather Logs**: Deve ter centenas de registros
- **Insights Cache**: Deve ter alguns insights cacheados
- **Usuários**: Deve ter pelo menos 1 usuário (admin)

## 🎯 Testes Específicos da Fase 6

### Teste 1: Geração de Insights

```bash
# Buscar insights dos últimos 7 dias
curl -X GET "http://localhost:3000/api/v1/weather/insights?from=2025-11-14T00:00:00-03:00&to=2025-11-21T00:00:00-03:00" \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Esperado:**
- `pv_metrics` com soiling_risk, consecutive_cloudy_days, heat_derating, wind_derating
- `statistics` com avg_temp, avg_humidity, trend, classification
- `alerts` array com alertas contextuais
- `summary` com texto gerado
- `scores` com comfort_score e pv_production_score

### Teste 2: Cache de Insights

```bash
# Primeira chamada (gera e cacheia)
time curl -X GET "http://localhost:3000/api/v1/weather/insights?from=2025-11-14T00:00:00-03:00&to=2025-11-21T00:00:00-03:00" \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Segunda chamada (deve ser mais rápida - usa cache)
time curl -X GET "http://localhost:3000/api/v1/weather/insights?from=2025-11-14T00:00:00-03:00&to=2025-11-21T00:00:00-03:00" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
```

**Esperado:** Segunda chamada deve ser significativamente mais rápida (< 100ms vs > 500ms)

### Teste 3: Forçar Regeneração

```bash
# Forçar regeneração (ignora cache)
curl -X POST "http://localhost:3000/api/v1/weather/insights" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"from":"2025-11-14T00:00:00-03:00","to":"2025-11-21T00:00:00-03:00"}' | jq
```

**Esperado:** Deve gerar novos insights mesmo se já existir cache

## 📝 Notas

- O collector coleta dados a cada 1 hora por padrão
- Insights são cacheados por 1 hora
- O frontend faz polling a cada 30 segundos para atualizar dados
- Todos os endpoints de insights requerem autenticação JWT

## 🔗 Links Úteis

- **Frontend**: http://localhost:5173
- **API Swagger** (se configurado): http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)
- **MongoDB**: localhost:27017

---

**Última atualização:** 21/11/2025 - Sistema completo com Fase 6 implementada

