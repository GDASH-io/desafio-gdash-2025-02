# Worker Go - GDASH Challenge

Serviço em Go responsável por consumir mensagens do Kafka topic `ana.raw.readings`, processar dados climáticos, calcular métricas de energia solar (PV), e publicar mensagens processadas no Kafka topic `ana.processed.readings` e enviar para API NestJS via POST `/api/v1/weather/logs`.

## Arquitetura

O projeto segue **Clean Architecture** com as seguintes camadas:

- **Domain**: Entidades e interfaces de repositórios
- **Application**: Use cases e serviços de negócio (validação, cálculo de métricas PV)
- **Infrastructure**: Implementações concretas (Kafka consumer/producer, HTTP client, healthcheck)
- **Internal**: Configurações e logger

## Estrutura

```
worker-go/
├── cmd/worker/          # Entry point
├── internal/            # Configurações e logger
├── domain/              # Entidades e interfaces
├── application/         # Use cases e serviços
├── infra/              # Implementações de infraestrutura
└── tests/              # Testes unitários e integração
```

## Métricas PV Calculadas

### Estimated Irradiance (W/m²)
Estimativa de irradiância baseada em:
- Percentual de nuvens
- Weather code (WMO)

### Temperature Effect Factor
Fator de derating por temperatura:
- Coeficiente: -0.4% por °C acima de 25°C
- Fórmula: `factor = 1 - max(0, (temp - 25) * 0.004)`

### Soiling Risk
Risco de sujeira baseado em precipitação:
- **low**: < 5mm em 24h
- **medium**: 5-20mm em 24h
- **high**: ≥ 20mm em 24h

### Wind Derating Flag
Flag indicando vento extremo:
- `true`: vento > 20 m/s
- `false`: vento ≤ 20 m/s

### PV Derating Total (%)
Percentual total de derating considerando:
- Derating por temperatura
- Penalidade por soiling (0%, 2%, 5%)
- Penalidade por vento (0% ou 3%)

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

## Execução Local

### Pré-requisitos
- Go 1.21+
- Kafka rodando (via Docker Compose)

### Executar

```bash
# Instalar dependências
go mod download

# Executar
go run cmd/worker/main.go
```

### Com Docker

```bash
# Build
docker build -t worker-go .

# Executar
docker run --env-file .env worker-go
```

## Healthcheck

O worker expõe um endpoint de healthcheck em `http://localhost:8081/healthz`:

```json
{
  "status": "healthy",
  "kafka": "connected",
  "api": "connected"
}
```

## Testes

### Executar testes unitários

```bash
go test ./tests/unit/... -v
```

### Executar todos os testes

```bash
go test ./... -v
```

## Fluxo de Processamento

1. **Consumo**: Worker consome mensagens do Kafka topic `ana.raw.readings`
2. **Validação**: Valida estrutura da mensagem raw
3. **Cálculo**: Calcula métricas PV para cada item do payload
4. **Publicação**: Publica mensagens processadas no Kafka topic `ana.processed.readings`
5. **API**: Envia dados para API NestJS via POST `/api/v1/weather/logs`

## Contrato de Mensagem Processada

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

## Retry e Resiliência

- **Kafka Consumer**: Retry automático via Sarama
- **API Client**: Retry com exponential backoff (3 tentativas)
- **Graceful Shutdown**: Aguarda finalização de mensagens em processamento

## Logs

Logs estruturados em JSON:

```json
{
  "timestamp": "2025-11-19T20:00:00Z",
  "level": "INFO",
  "service": "worker-go",
  "message": "Mensagem processada com sucesso",
  "context": {
    "message_size": 1024
  }
}
```

## Próximos Passos

Após implementar o worker:
1. Validar pipeline completo: Collector → Kafka → Worker → API NestJS
2. Iniciar Fase 4 (API NestJS) para receber dados do worker
3. Testar integração end-to-end

