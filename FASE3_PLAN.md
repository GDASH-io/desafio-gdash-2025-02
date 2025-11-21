# Fase 3 - Worker Go - Plano Detalhado

## Resumo
Implementar worker em Go que consome mensagens do Kafka topic `ana.raw.readings`, valida, enriquece com métricas de energia solar (PV), e publica em `ana.processed.readings` e envia para API NestJS via POST `/api/v1/weather/logs`.

## Checklist de Tarefas

### 1. Preparação do Ambiente
- [ ] Criar estrutura de diretórios seguindo Clean Architecture
- [ ] Configurar `go.mod` com dependências
- [ ] Criar `Dockerfile` para worker Go
- [ ] Criar `.env.example` específico do worker

### 2. Camada de Domínio
- [ ] Criar `domain/entities/processed_reading.go` (entidade com métricas PV)
- [ ] Criar `domain/repositories/kafka_consumer.go` (interface)
- [ ] Criar `domain/repositories/api_client.go` (interface)

### 3. Camada de Infraestrutura
- [ ] Criar `infra/messaging/kafka_consumer.go` (consumer Kafka)
- [ ] Criar `infra/http/api_client.go` (cliente HTTP para NestJS)
- [ ] Criar `infra/http/healthcheck.go` (servidor healthcheck)

### 4. Camada de Aplicação
- [ ] Criar `application/usecases/process_reading.go` (lógica de processamento)
- [ ] Criar `application/services/pv_metrics_calculator.go` (cálculo de métricas PV)
- [ ] Criar `application/services/validator.go` (validação de mensagens)

### 5. Métricas PV a Calcular
- [ ] `estimated_irradiance_w_m2`: Estimativa baseada em clouds_percent e weather_code
- [ ] `temp_effect_factor`: Fator de derating por temperatura (coeficiente típico: -0.4%/°C acima de 25°C)
- [ ] `soiling_risk`: Risco de sujeira baseado em precipitação acumulada
- [ ] `wind_derating_flag`: Flag indicando se vento extremo causa derating
- [ ] `pv_derating_pct`: Percentual total de derating (soma de todos os fatores)

### 6. Main e Configuração
- [ ] Criar `cmd/worker/main.go` (loop principal)
- [ ] Criar `internal/config/config.go` (configurações)
- [ ] Criar `internal/logger/logger.go` (logger estruturado)

### 7. Testes
- [ ] Testes unitários para cálculo de métricas PV
- [ ] Testes unitários para validação
- [ ] Testes de integração (Kafka consumer + API client)

### 8. Documentação
- [ ] README.md com instruções de execução
- [ ] Documentar variáveis de ambiente

## Estrutura de Arquivos

```
worker-go/
├── cmd/
│   └── worker/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   └── logger/
│       └── logger.go
├── domain/
│   ├── entities/
│   │   └── processed_reading.go
│   └── repositories/
│       ├── kafka_consumer.go
│       └── api_client.go
├── application/
│   ├── usecases/
│   │   └── process_reading.go
│   └── services/
│       ├── pv_metrics_calculator.go
│       └── validator.go
├── infra/
│   ├── messaging/
│   │   └── kafka_consumer.go
│   └── http/
│       ├── api_client.go
│       └── healthcheck.go
├── Dockerfile
├── go.mod
├── go.sum
├── .env.example
└── README.md
```

## Contrato de Mensagem Processed

```json
{
  "msg_id": "uuid-v4",
  "source": "openmeteo",
  "city": "Coronel Fabriciano",
  "timestamp": "2025-11-19T20:00:00-03:00",
  "temperature_c": 23.5,
  "relative_humidity": 78,
  "precipitation_mm": 0.0,
  "wind_speed_m_s": 2.3,
  "clouds_percent": 75,
  "weather_code": 801,
  "estimated_irradiance_w_m2": 420.0,
  "temp_effect_factor": 0.98,
  "soiling_risk": "low",
  "wind_derating_flag": false,
  "pv_derating_pct": 2.0,
  "processed_at": "2025-11-19T20:01:00-03:00"
}
```

## Variáveis de Ambiente

```env
# Kafka
KAFKA_BOOTSTRAP_SERVERS=kafka:9093
KAFKA_TOPIC_RAW=ana.raw.readings
KAFKA_TOPIC_PROCESSED=ana.processed.readings
KAFKA_GROUP_ID=gdash-worker-group

# API NestJS
API_URL=http://api:3000
API_TIMEOUT_SECONDS=10
API_MAX_RETRIES=3

# Worker
WORKER_MAX_RETRIES=3
WORKER_BATCH_SIZE=10
WORKER_PROCESSING_INTERVAL_MS=1000

# Healthcheck
HEALTHCHECK_PORT=8081

# Logging
LOG_LEVEL=INFO
LOG_FORMAT=json
```

## Fórmulas de Métricas PV

### Estimated Irradiance
```
base_irradiance = 1000 W/m² (irradiância padrão)
cloud_factor = 1 - (clouds_percent / 100)
estimated_irradiance = base_irradiance * cloud_factor * weather_factor

weather_factor:
- Clear (800): 1.0
- Few clouds (801): 0.9
- Scattered clouds (802): 0.7
- Broken clouds (803): 0.5
- Overcast (804): 0.3
```

### Temperature Effect Factor
```
temp_effect_factor = 1 - max(0, (temp_c - 25) * 0.004)
// Coeficiente típico: -0.4% por °C acima de 25°C
```

### Soiling Risk
```
soiling_risk = "low" | "medium" | "high"
- low: precipitation_mm < 5mm em 24h
- medium: 5mm <= precipitation_mm < 20mm em 24h
- high: precipitation_mm >= 20mm em 24h
```

### Wind Derating Flag
```
wind_derating_flag = wind_speed_m_s > 20 m/s
```

### PV Derating Total
```
pv_derating_pct = 
  (1 - temp_effect_factor) * 100 +
  (soiling_penalty) +
  (wind_penalty)

soiling_penalty:
- low: 0%
- medium: 2%
- high: 5%

wind_penalty:
- wind_derating_flag = true: 3%
- wind_derating_flag = false: 0%
```

## Critérios de Aceitação

- [ ] Worker consome mensagens de `ana.raw.readings`
- [ ] Worker calcula todas as métricas PV corretamente
- [ ] Worker publica mensagens processadas em `ana.processed.readings`
- [ ] Worker envia POST para API NestJS `/api/v1/weather/logs`
- [ ] Worker implementa retry com exponential backoff
- [ ] Worker implementa idempotência (evita processar mesma mensagem 2x)
- [ ] Healthcheck responde 200 quando worker está saudável
- [ ] Logs estruturados (JSON)
- [ ] Testes unitários cobrem cálculo de métricas
- [ ] Testes de integração validam fluxo completo

## Comandos Git Sugeridos

```bash
# Commits conforme desenvolvimento
git add worker-go/
git commit -m "feat(worker): implement Kafka consumer with PV metrics calculation"
```

## Próximos Passos Após Fase 3

1. Validar pipeline completo: Collector → Kafka → Worker → API NestJS
2. Iniciar Fase 4 (API NestJS) para receber dados do worker
3. Opcionalmente iniciar Fase 2 (ANA pagination) em paralelo

