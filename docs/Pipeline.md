# Pipeline de Dados - GDASH Challenge 2025/02

**Versão:** 1.0  
**Última atualização:** 23/11/2025

---

## Visão Geral

Este documento descreve detalhadamente o pipeline de dados do sistema GDASH, desde a coleta de dados climáticos até a exibição no frontend, incluindo processamento, armazenamento e geração de insights.

## Arquitetura do Pipeline

```
┌─────────────────┐
│  Open-Meteo API │
│  (Dados Clima)  │
└────────┬────────┘
         │
         │ HTTP GET (horário)
         ▼
┌─────────────────┐
│   Collector     │
│   (Python)      │
│   Porta: 8080   │
└────────┬────────┘
         │
         │ Publica no Kafka
         │ Topic: ana.raw.readings
         ▼
┌─────────────────┐
│     Kafka       │
│  Message Broker │
│  Porta: 9092    │
└────────┬────────┘
         │
         │ Consome mensagens
         ▼
┌─────────────────┐
│     Worker      │
│      (Go)       │
│   Porta: 8081   │
└────────┬────────┘
         │
         │ Processa e calcula métricas PV
         │ Publica no Kafka
         │ Topic: ana.processed.readings
         │
         │ Envia para API NestJS
         │ POST /api/v1/weather/logs
         ▼
┌─────────────────┐
│   API NestJS    │
│   Porta: 3000   │
└────────┬────────┘
         │
         │ Armazena no MongoDB
         │ Gera insights (IA)
         │
         │ Expõe endpoints REST
         ▼
┌─────────────────┐
│   MongoDB       │
│  Porta: 27017   │
└─────────────────┘
         │
         │ Dados consultados via API
         ▼
┌─────────────────┐
│    Frontend     │
│   (React)       │
│  Porta: 5173    │
└─────────────────┘
```

## Componentes do Pipeline

### 1. Coleta de Dados (Collector - Python)

**Serviço:** `gdash-collector`  
**Linguagem:** Python 3.10+  
**Porta:** 8080 (healthcheck)  
**Frequência:** A cada 1 hora (3600 segundos)

#### Responsabilidades

1. **Coleta de Dados Climáticos**
   - Consulta a API Open-Meteo para dados horários e diários
   - Região: Coronel Fabriciano, MG (Lat: -19.5186, Lon: -42.6289)
   - Parâmetros coletados:
     - Temperatura (temperature_2m)
     - Umidade relativa (relative_humidity_2m)
     - Precipitação (precipitation)
     - Velocidade do vento (wind_speed_10m)
     - Direção do vento (wind_direction_10m)
     - Rajadas de vento (wind_gusts_10m)
     - Cobertura de nuvens (cloud_cover)
     - Código do tempo (weather_code)
     - Pressão ao nível do mar (pressure_msl)
     - Índice UV (uv_index)
     - Visibilidade (visibility)

2. **Normalização de Dados**
   - Converte dados da API Open-Meteo para formato padrão
   - Adiciona metadados (source, city, coords, fetched_at)
   - Valida dados antes de publicar

3. **Publicação no Kafka**
   - Topic: `ana.raw.readings`
   - Formato: JSON
   - Estrutura da mensagem:
     ```json
     {
       "source": "openmeteo",
       "city": "Coronel Fabriciano",
       "coords": {
         "lat": -19.5186,
         "lon": -42.6289
       },
       "fetched_at": "2025-11-23T14:00:00-03:00",
       "interval": "hourly",
       "payload": [
         {
           "timestamp": "2025-11-23T14:00:00-03:00",
           "temperature_c": 25.3,
           "relative_humidity": 72,
           "precipitation_mm": 0.0,
           "wind_speed_m_s": 3.2,
           "wind_direction_10m": 180,
           "wind_gusts_10m": 4.5,
           "clouds_percent": 45,
           "weather_code": 61,
           "pressure_msl": 1013.5,
           "uv_index": 5.2,
           "visibility": 10000
         }
       ]
     }
     ```

4. **Healthcheck**
   - Endpoint: `GET /healthz`
   - Verifica conexão com Kafka
   - Retorna status do serviço

#### Fluxo de Execução

1. Inicialização do serviço
2. Conexão com Kafka
3. Loop principal:
   - Aguarda intervalo configurado (1 hora)
   - Busca dados da API Open-Meteo
   - Normaliza dados
   - Publica no Kafka
   - Registra logs
4. Tratamento de sinais (SIGTERM, SIGINT) para shutdown graceful

### 2. Message Broker (Kafka)

**Serviço:** `gdash-kafka`  
**Imagem:** `confluentinc/cp-kafka:7.5.0`  
**Portas:** 9092 (externo), 9093 (interno)  
**Dependência:** Zookeeper

#### Tópicos Utilizados

1. **ana.raw.readings**
   - **Produtor:** Collector (Python)
   - **Consumidor:** Worker (Go)
   - **Formato:** JSON
   - **Partições:** 1 (padrão)
   - **Replicação:** 1 (desenvolvimento)

2. **ana.processed.readings**
   - **Produtor:** Worker (Go)
   - **Consumidor:** Nenhum (tópico de auditoria)
   - **Formato:** JSON
   - **Partições:** 1 (padrão)
   - **Replicação:** 1 (desenvolvimento)

#### Configurações

- **Auto-create topics:** Habilitado
- **Offset retention:** Padrão (7 dias)
- **Compression:** Nenhuma (desenvolvimento)

### 3. Processamento (Worker - Go)

**Serviço:** `gdash-worker`  
**Linguagem:** Go 1.21+  
**Porta:** 8081 (healthcheck)

#### Responsabilidades

1. **Consumo de Mensagens**
   - Consome do tópico `ana.raw.readings`
   - Implementa retry com exponential backoff
   - Confirma mensagens (ack/nack)

2. **Validação**
   - Valida estrutura JSON
   - Verifica campos obrigatórios
   - Valida tipos de dados
   - Implementa idempotência via UUID

3. **Cálculo de Métricas PV**
   - **Estimated Irradiance:** Cálculo baseado em temperatura, umidade e cobertura de nuvens
   - **Temp Effect Factor:** Fator de derating por temperatura
   - **Soiling Risk:** Risco de sujeira nos painéis (baseado em precipitação)
   - **Wind Derating Flag:** Flag de derating por vento forte
   - **PV Derating Percent:** Percentual total de derating

4. **Publicação no Kafka**
   - Publica mensagens processadas no tópico `ana.processed.readings`
   - Mantém histórico de processamento

5. **Envio para API NestJS**
   - POST `/api/v1/weather/logs`
   - Retry com exponential backoff (até 3 tentativas)
   - Tratamento de erros HTTP

6. **Healthcheck**
   - Endpoint: `GET /healthz`
   - Verifica conexão com Kafka
   - Verifica conexão com API NestJS

#### Fluxo de Processamento

1. Consome mensagem do Kafka
2. Valida estrutura e dados
3. Calcula métricas PV
4. Publica no tópico `ana.processed.readings`
5. Envia para API NestJS
6. Confirma mensagem (ack)
7. Em caso de erro, faz nack e retry

### 4. API e Armazenamento (NestJS + MongoDB)

**Serviço:** `gdash-api`  
**Linguagem:** TypeScript (NestJS)  
**Porta:** 3000  
**Banco de Dados:** MongoDB 6

#### Responsabilidades

1. **Recebimento de Dados**
   - Endpoint: `POST /api/v1/weather/logs`
   - Recebe array de logs processados
   - Valida dados com DTOs
   - Armazena no MongoDB

2. **Armazenamento**
   - Coleção: `weather_logs`
   - Schema: WeatherLog (Mongoose)
   - Índices:
     - `timestamp` (descendente)
     - `city` (texto)
     - `createdAt` (TTL opcional)

3. **Geração de Insights**
   - Módulo de Insights (IA)
   - Análise estatística
   - Regras heurísticas
   - Cache em MongoDB (TTL 1 hora)

4. **Exposição de Endpoints**
   - `GET /api/v1/weather/logs` - Lista com paginação
   - `GET /api/v1/weather/logs/latest` - Última leitura
   - `GET /api/v1/weather/precipitation/24h` - Chuva acumulada
   - `GET /api/v1/weather/forecast/7days` - Previsão 7 dias
   - `GET /api/v1/weather/forecast/day/:date` - Previsão horária
   - `GET /api/v1/weather/insights` - Insights de IA
   - `GET /api/v1/weather/export.csv` - Export CSV
   - `GET /api/v1/weather/export.xlsx` - Export XLSX
   - `GET /api/v1/nasa` - Imagens NASA

5. **Autenticação e Autorização**
   - JWT (JSON Web Token)
   - Guards e decorators
   - Controle de roles (admin/user)

#### Estrutura de Dados no MongoDB

**Coleção: weather_logs**
```json
{
  "_id": ObjectId("..."),
  "timestamp": ISODate("2025-11-23T14:00:00.000Z"),
  "city": "Coronel Fabriciano",
  "source": "openmeteo",
  "temperature_c": 25.3,
  "relative_humidity": 72,
  "precipitation_mm": 0.0,
  "wind_speed_m_s": 3.2,
  "wind_direction_10m": 180,
  "wind_gusts_10m": 4.5,
  "clouds_percent": 45,
  "weather_code": 61,
  "pressure_hpa": 1013.5,
  "uv_index": 5.2,
  "visibility_m": 10000,
  "precipitation_probability": 20,
  "estimated_irradiance_w_m2": 450.5,
  "temp_effect_factor": 0.98,
  "soiling_risk": "low",
  "wind_derating_flag": false,
  "pv_derating_pct": 2.0,
  "createdAt": ISODate("2025-11-23T14:01:00.000Z"),
  "updatedAt": ISODate("2025-11-23T14:01:00.000Z")
}
```

**Coleção: insights**
```json
{
  "_id": ObjectId("..."),
  "period": {
    "from": ISODate("2025-11-16T00:00:00.000Z"),
    "to": ISODate("2025-11-23T00:00:00.000Z")
  },
  "pv_metrics": { ... },
  "statistics": { ... },
  "alerts": [ ... ],
  "summary": "...",
  "scores": { ... },
  "generated_at": ISODate("2025-11-23T14:00:00.000Z"),
  "expires_at": ISODate("2025-11-23T15:00:00.000Z")
}
```

### 5. Frontend (React)

**Serviço:** `gdash-frontend`  
**Linguagem:** TypeScript (React + Vite)  
**Porta:** 5173  
**Servidor Web:** Nginx

#### Responsabilidades

1. **Autenticação**
   - Login/Logout
   - Gerenciamento de token JWT
   - Rotas protegidas

2. **Dashboard**
   - Exibição de dados em tempo real
   - Cards de métricas
   - Gráficos (Chart.js)
   - Insights de IA
   - Previsão 7 dias

3. **Páginas Especializadas**
   - `/dashboard` - Dashboard principal
   - `/records` - Tabela de registros
   - `/nasa` - Imagens de satélite NASA
   - `/users` - CRUD de usuários (admin)

4. **Polling**
   - Atualização automática a cada 30 segundos
   - Hook customizado `usePolling`

5. **Exportação**
   - Download CSV/XLSX
   - Integração com endpoints de export

## Fluxo Completo de Dados

### Fluxo Normal (Happy Path)

1. **T+0:00** - Collector executa coleta
   - Busca dados da Open-Meteo API
   - Normaliza dados
   - Publica no Kafka (`ana.raw.readings`)

2. **T+0:01** - Worker consome mensagem
   - Valida dados
   - Calcula métricas PV
   - Publica no Kafka (`ana.processed.readings`)
   - Envia para API NestJS

3. **T+0:02** - API NestJS processa
   - Valida dados
   - Armazena no MongoDB
   - Gera insights (se necessário)
   - Retorna 201 Created

4. **T+0:03** - Frontend atualiza
   - Polling detecta novo dado
   - Atualiza dashboard
   - Exibe novos gráficos

### Fluxo com Erros

#### Erro na Coleta

1. Collector falha ao buscar dados da API
   - Retry automático (3 tentativas)
   - Log de erro
   - Continua loop (próxima hora)

#### Erro no Worker

1. Worker falha ao processar
   - Nack da mensagem
   - Retry automático (3 tentativas)
   - Se persistir, mensagem vai para DLQ (Dead Letter Queue)

#### Erro na API

1. API falha ao armazenar
   - Worker faz retry (exponential backoff)
   - Se persistir, mensagem permanece no Kafka
   - Worker tenta novamente no próximo ciclo

## Garantias do Pipeline

### At-Least-Once Delivery

- Mensagens podem ser processadas mais de uma vez
- Idempotência implementada via UUID
- Validação de duplicatas no MongoDB

### Durabilidade

- Mensagens persistidas no Kafka
- Dados armazenados no MongoDB
- Logs em todos os serviços

### Ordem

- Mensagens processadas em ordem (single partition)
- Timestamps preservados
- Ordenação por timestamp no MongoDB

## Monitoramento

### Healthchecks

- **Collector:** `GET http://localhost:8080/healthz`
- **Worker:** `GET http://localhost:8081/healthz`
- **API:** `GET http://localhost:3000/api/v1/weather/health`

### Métricas Disponíveis

- Número de mensagens publicadas (Collector)
- Número de mensagens processadas (Worker)
- Número de registros armazenados (API)
- Taxa de erro por serviço
- Latência do pipeline

### Logs

- Todos os serviços geram logs estruturados
- Formato: JSON (quando possível)
- Níveis: DEBUG, INFO, WARN, ERROR

## Performance

### Throughput

- **Coleta:** 1 requisição/hora (configurável)
- **Processamento:** ~100 mensagens/segundo (Worker)
- **Armazenamento:** ~1000 inserções/segundo (MongoDB)

### Latência

- **Coleta → Kafka:** < 1 segundo
- **Kafka → Worker:** < 1 segundo
- **Worker → API:** < 2 segundos
- **API → MongoDB:** < 100ms
- **Total:** < 5 segundos

### Escalabilidade

- **Collector:** Pode ser escalado horizontalmente (múltiplas instâncias)
- **Worker:** Pode ser escalado horizontalmente (consumer groups)
- **API:** Pode ser escalado horizontalmente (load balancer)
- **MongoDB:** Pode ser escalado (replica set, sharding)

## Segurança

### Autenticação

- API protegida com JWT
- Tokens expiram em 1 hora
- Refresh token (futuro)

### Autorização

- Controle de roles (admin/user)
- Endpoints protegidos com guards
- Validação de permissões

### Dados Sensíveis

- Senhas hasheadas (bcrypt)
- Tokens não armazenados em logs
- Dados de API não expostos

## Resiliência

### Retry

- Collector: 3 tentativas para API externa
- Worker: 3 tentativas para API NestJS
- Exponential backoff em todos os retries

### Circuit Breaker

- Não implementado (futuro)
- Pode ser adicionado no Worker

### Dead Letter Queue

- Não implementado (futuro)
- Mensagens com erro podem ser enviadas para DLQ

## Melhorias Futuras

1. **Monitoramento Avançado**
   - Prometheus + Grafana
   - Alertas automáticos
   - Dashboards de métricas

2. **Processamento Assíncrono**
   - Queue para geração de insights
   - Background jobs
   - Agendamento de tarefas

3. **Cache**
   - Redis para cache de insights
   - Cache de dados frequentes
   - Redução de carga no MongoDB

4. **Replicação**
   - MongoDB replica set
   - Kafka com múltiplas partições
   - Load balancer para API

5. **Testes E2E**
   - Testes end-to-end do pipeline completo
   - Simulação de falhas
   - Testes de carga

---

**Documentação relacionada:**
- [STATUS.md](./STATUS.md) - Status atual do projeto
- [system-architecture.md](./system-architecture.md) - Arquitetura do sistema
- [Endpoints.md](./Endpoints.md) - Documentação de endpoints

