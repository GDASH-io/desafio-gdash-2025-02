# Fase 3 - Worker (Go)

**Status:** Concluída  
**Data de Conclusão:** 20/11/2025  
**Progresso:** 100%

---

## Objetivo

Implementar um worker em Go que consuma mensagens do Kafka topic `ana.raw.readings`, valide e transforme os dados, calcule métricas de energia solar (PV), e envie os registros processados para a API NestJS.

## Requisitos do Desafio

Conforme README.md do desafio:

- Consumir mensagens da fila
- Validar e transformar os dados
- Enviar registros para API NestJS (ex: `POST /api/weather/logs`)
- Confirmar mensagens com ack/nack
- Implementar retry básico
- Registrar logs das operações principais

## Arquitetura Implementada

### Clean Architecture

O worker segue Clean Architecture com as seguintes camadas:

```
worker-go/
├── cmd/worker/
│   └── main.go                    # Entry point
├── domain/
│   ├── entities/
│   │   └── processed_reading.go   # Entidade ProcessedReading
│   └── repositories/
│       ├── kafka_consumer.go     # Interface KafkaConsumer
│       ├── kafka_producer.go     # Interface KafkaProducer
│       └── api_client.go         # Interface APIClient
├── application/
│   ├── usecases/
│   │   └── process_reading.go    # Use case principal
│   └── services/
│       ├── pv_metrics_calculator.go  # Cálculo de métricas PV
│       └── validator.go              # Validação de dados
├── infra/
│   ├── messaging/
│   │   ├── kafka_consumer.go     # Implementação Kafka consumer
│   │   └── kafka_producer.go     # Implementação Kafka producer
│   └── http/
│       ├── api_client.go         # Cliente HTTP para API NestJS
│       └── healthcheck.go        # Servidor healthcheck
└── internal/
    ├── config/
    │   └── config.go            # Configurações
    └── logger/
        └── logger.go            # Logger estruturado
```

### Componentes Principais

#### 1. Domain Layer

**ProcessedReading (Entidade)**
- Representa uma leitura processada com métricas PV
- Campos adicionais: estimated_irradiance_w_m2, temp_effect_factor, soiling_risk, wind_derating_flag, pv_derating_pct

**Repositories (Interfaces)**
- `KafkaConsumer`: Contrato para consumo de mensagens
- `KafkaProducer`: Contrato para publicação de mensagens processadas
- `APIClient`: Contrato para envio de dados à API NestJS

#### 2. Application Layer

**ProcessReadingUseCase**
- Orquestra o processamento de mensagens
- Fluxo:
  1. Consome mensagem do Kafka
  2. Valida estrutura
  3. Calcula métricas PV
  4. Publica mensagem processada no Kafka
  5. Envia dados para API NestJS

**PVMetricsCalculator**
- Calcula métricas específicas de energia solar
- Métricas: irradiância estimada, fator de temperatura, risco de sujeira, derating por vento

**Validator**
- Valida estrutura de mensagens raw
- Verifica campos obrigatórios
- Valida tipos de dados

#### 3. Infrastructure Layer

**KafkaConsumerImpl**
- Implementação do consumer Kafka
- Biblioteca: Sarama
- Consumer group: `gdash-worker-group`
- Retry automático

**APIClientImpl**
- Cliente HTTP para API NestJS
- Endpoint: `POST /api/v1/weather/logs`
- Retry com exponential backoff
- Timeout configurável

**HealthcheckServer**
- Servidor HTTP para healthcheck
- Endpoint: `GET /healthz`
- Verifica conexões com Kafka e API

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Go | 1.21+ | Linguagem principal |
| Sarama | Latest | Cliente Kafka |
| net/http | Standard | Cliente HTTP |
| encoding/json | Standard | Serialização JSON |

## Métricas PV Calculadas

### 1. Estimated Irradiance (W/m²)

Estimativa de irradiância baseada em:
- Percentual de nuvens
- Weather code (WMO)

**Fórmula:**
```
irradiance = base_irradiance * (1 - clouds_percent / 100) * weather_factor
```

### 2. Temperature Effect Factor

Fator de derating por temperatura:
- Coeficiente: -0.4% por °C acima de 25°C
- Fórmula: `factor = 1 - max(0, (temp - 25) * 0.004)`

### 3. Soiling Risk

Risco de sujeira baseado em precipitação:

| Nível | Condição | Penalidade |
|-------|----------|------------|
| low | < 5mm em 24h | 0% |
| medium | 5-20mm em 24h | 2% |
| high | ≥ 20mm em 24h | 5% |

### 4. Wind Derating Flag

Flag indicando vento extremo:
- `true`: vento > 20 m/s (penalidade 3%)
- `false`: vento ≤ 20 m/s (sem penalidade)

### 5. PV Derating Total (%)

Percentual total de derating considerando:
- Derating por temperatura
- Penalidade por soiling (0%, 2%, 5%)
- Penalidade por vento (0% ou 3%)

**Fórmula:**
```
pv_derating = temp_derating + soiling_penalty + wind_penalty
```

## Configuração

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `KAFKA_BOOTSTRAP_SERVERS` | Servidores Kafka | kafka:9093 |
| `KAFKA_TOPIC_RAW` | Tópico de entrada | ana.raw.readings |
| `KAFKA_TOPIC_PROCESSED` | Tópico de saída | ana.processed.readings |
| `KAFKA_GROUP_ID` | Consumer group | gdash-worker-group |
| `API_URL` | URL da API NestJS | http://api:3000 |
| `API_TIMEOUT_SECONDS` | Timeout HTTP | 10 |
| `API_MAX_RETRIES` | Máximo de tentativas | 3 |
| `WORKER_MAX_RETRIES` | Retry interno | 3 |
| `WORKER_BATCH_SIZE` | Tamanho do batch | 10 |
| `WORKER_PROCESSING_INTERVAL_MS` | Intervalo de processamento | 1000 |
| `HEALTHCHECK_PORT` | Porta do healthcheck | 8081 |
| `LOG_LEVEL` | Nível de log | INFO |
| `LOG_FORMAT` | Formato: json ou text | json |

## Contrato de Mensagem Processada

### Formato JSON Enviado para API NestJS

```json
{
  "timestamp": "2025-11-19T20:00:00-03:00",
  "city": "Coronel Fabriciano",
  "source": "openmeteo",
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
  "pv_derating_pct": 2.0
}
```

## Funcionalidades Implementadas

### 1. Consumo de Mensagens

- Consumer group para distribuição de carga
- Commit automático após processamento
- Nack em caso de erro

### 2. Validação

- Validação de estrutura JSON
- Verificação de campos obrigatórios
- Validação de tipos de dados

### 3. Cálculo de Métricas PV

- Cálculo de irradiância estimada
- Fator de efeito de temperatura
- Classificação de risco de sujeira
- Detecção de vento extremo
- Cálculo de derating total

### 4. Publicação Processada

- Publicação no Kafka topic `ana.processed.readings`
- Mensagens processadas disponíveis para outros consumidores

### 5. Envio para API

- POST para `/api/v1/weather/logs`
- Retry com exponential backoff
- Tratamento de erros HTTP

### 6. Idempotência

- UUID único por mensagem processada
- Prevenção de processamento duplicado

### 7. Healthcheck

- Endpoint `/healthz`
- Verifica conexão com Kafka
- Verifica conexão com API NestJS

### 8. Logs Estruturados

- Formato JSON
- Níveis: DEBUG, INFO, WARNING, ERROR
- Contexto adicional

## Testes

### Cobertura de Testes

| Tipo | Arquivo | Cobertura |
|------|---------|-----------|
| Unitários | `pv_metrics_calculator_test.go` | Cálculo de métricas PV |
| Unitários | `validator_test.go` | Validação de dados |

### Execução

```bash
# Todos os testes
go test ./... -v

# Apenas unitários
go test ./tests/unit/... -v
```

## Dockerização

### Dockerfile

```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker ./cmd/worker

# Runtime stage
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/worker .
CMD ["./worker"]
```

## Retry e Resiliência

### Kafka Consumer

- Retry automático via Sarama
- Commit apenas após processamento bem-sucedido
- Nack em caso de erro

### API Client

- Retry com exponential backoff
- Máximo de 3 tentativas
- Timeout configurável

### Graceful Shutdown

- Aguarda finalização de mensagens em processamento
- Fecha conexões adequadamente
- Logs de encerramento

## Logs

### Exemplo de Log Estruturado

```json
{
  "timestamp": "2025-11-19T20:00:00Z",
  "level": "INFO",
  "service": "worker-go",
  "message": "Mensagem processada com sucesso",
  "context": {
    "message_size": 30706
  }
}
```

### Healthcheck Response

```json
{
  "status": "healthy",
  "kafka": "connected",
  "api": "connected"
}
```

## Decisões Técnicas

### 1. Linguagem

**Decisão:** Go

**Razões:**
- Performance
- Concorrência nativa
- Binário único
- Baixo consumo de recursos

### 2. Biblioteca Kafka

**Decisão:** Sarama

**Razões:**
- Biblioteca oficial Go para Kafka
- Suporte completo a consumer groups
- Retry automático
- Documentação completa

### 3. Arquitetura

**Decisão:** Clean Architecture

**Razões:**
- Separação de responsabilidades
- Testabilidade
- Manutenibilidade

## Problemas Encontrados e Soluções

### Problema 1: Conexão com Kafka no Docker

**Solução:** Uso de `kafka:9093` (porta interna) e configuração adequada de listeners

### Problema 2: Retry de API

**Solução:** Implementação de exponential backoff com máximo de tentativas

## Próximos Passos (Após Fase 3)

1. Validar pipeline completo: Collector → Kafka → Worker → API NestJS
2. Iniciar Fase 4 (API NestJS) para receber dados do worker
3. Testar integração end-to-end

## Referências

- [Sarama Documentation](https://github.com/IBM/sarama)
- [Go Kafka Consumer Groups](https://kafka.apache.org/documentation/#consumerconfigs)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

---

**Última atualização:** 21/11/2025

