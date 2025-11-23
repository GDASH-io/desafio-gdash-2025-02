# 🐹 Queue Worker (Go)

Worker em Go que consome mensagens do RabbitMQ, valida dados meteorológicos e envia para a API NestJS com retry automático.

## 📁 Estrutura do Projeto

```
queue-worker/
├── cmd/
│   └── worker/
│       └── main.go             # Entry point com graceful shutdown
├── internal/
│   ├── config/
│   │   └── config.go           # Carregamento de variáveis de ambiente
│   ├── consumer/
│   │   └── consumer.go         # Consumer RabbitMQ com QoS e retry
│   ├── validator/
│   │   └── validator.go        # Validação de dados meteorológicos
│   ├── api/
│   │   └── client.go           # HTTP client com timeout context
│   └── models/
│       └── weather.go          # Structs e transformação de dados
├── Dockerfile                  # Multi-stage build (golang:1.21-alpine)
├── go.mod                      # Dependências (amqp091-go, godotenv)
├── go.sum                      # Checksums
└── README.md
```

## 🚀 Funcionalidades

### ✅ Consumer RabbitMQ
- Conexão com exchange `direct` durável (`weather_exchange`)
- Consumo da fila `weather_data_queue` com binding key `weather.data`
- QoS configurado para processar 1 mensagem por vez
- ACK/NACK manual para controle de reprocessamento

### 🔍 Validação de Dados
- **Campos obrigatórios:** timestamp, city, condition
- **Coordenadas geográficas:** latitude (-90 a 90), longitude (-180 a 180)
- **Umidade:** 0-100%
- **Temperatura:** -100°C a 60°C (recordes mundiais)
- **Pressão atmosférica:** 800-1100 hPa
- **Velocidade do vento:** 0-500 km/h

### 🔄 Retry com Exponential Backoff
- **3 tentativas** configuráveis via `MAX_RETRIES`
- Backoff exponencial: 1s → 2s → 4s
- Timeout HTTP de 10 segundos com context
- Nack sem requeue após todas as tentativas (previne loop infinito)

### 🔀 Transformação de Dados
- Converte formato Python (snake_case) → NestJS (camelCase)
- Flatten da estrutura nested (location/current/metadata → root)
- Headers customizados: `X-Worker-ID` para rastreamento

## ⚙️ Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `RABBITMQ_URL` | `amqp://gdash:gdash123@localhost:5672/` | URL de conexão do RabbitMQ |
| `RABBITMQ_QUEUE` | `weather_data_queue` | Nome da fila a consumir |
| `RABBITMQ_EXCHANGE` | `weather_exchange` | Exchange para binding |
| `RABBITMQ_ROUTING_KEY` | `weather.data` | Routing key para binding |
| `API_URL` | `http://localhost:4000` | URL base da API NestJS |
| `API_ENDPOINT` | `/api/weather/logs` | Endpoint para enviar dados |
| `MAX_RETRIES` | `3` | Número de tentativas de envio |
| `WORKER_ID` | `queue-worker-01` | Identificador do worker |

## 🏃 Como Executar

### Localmente (requer Go 1.21+)
```bash
# Instalar dependências
go mod download

# Executar
go run cmd/worker/main.go

# Ou compilar e executar
go build -o worker cmd/worker/main.go
./worker
```

### Via Docker
```bash
# Build da imagem
docker build -t queue-worker .

# Executar container
docker run --rm \
  -e RABBITMQ_URL=amqp://gdash:gdash123@rabbitmq:5672/ \
  -e API_URL=http://api:4000 \
  --network gdash-network \
  queue-worker
```

### Via Docker Compose
```bash
docker-compose up queue-worker
```

## 📊 Fluxo de Processamento

```
┌─────────────────┐
│   RabbitMQ      │
│  weather_queue  │
└────────┬────────┘
         │
         │ Consume
         ▼
┌─────────────────┐
│   Deserialize   │
│   JSON → Struct │
└────────┬────────┘
         │
         │ Validate
         ▼
┌─────────────────┐
│   Validator     │
│ (ranges, types) │
└────────┬────────┘
         │
         │ Transform
         ▼
┌─────────────────┐
│  snake_case →   │
│   camelCase     │
└────────┬────────┘
         │
         │ Retry (3x)
         ▼
┌─────────────────┐
│  HTTP POST →    │
│  NestJS API     │
└────────┬────────┘
         │
    Success│Fail
         │
    ┌────▼────┐
    │ ACK/NACK│
    └─────────┘
```

## 🛡️ Tratamento de Erros

| Erro | Ação | Motivo |
|------|------|--------|
| JSON inválido | `Nack(requeue: false)` | Dados corrompidos não devem retornar |
| Validação falha | `Nack(requeue: false)` | Dados inválidos nunca passarão na validação |
| Falha HTTP (3x) | `Nack(requeue: false)` | Previne loop infinito se API estiver offline |
| Sucesso | `Ack()` | Mensagem processada com sucesso |

## 📝 Logs

```
2025/11/23 16:48:15 GDASH Queue Worker
2025/11/23 16:48:15 Config OK: Queue=weather_data_queue, API=http://localhost:4000/api/weather/logs
2025/11/23 16:48:15 Conectando ao RabbitMQ...
2025/11/23 16:48:15 RabbitMQ conectado (queue: weather_data_queue)
2025/11/23 16:48:15 Worker iniciado. Aguardando mensagens...
2025/11/23 16:48:15 Nova mensagem recebida
2025/11/23 16:48:15 Dados validados: São Paulo - 21.0°C
2025/11/23 16:48:15 Dados enviados para NestJS (status: 200)
2025/11/23 16:48:15 Mensagem processada!
```

## 🐛 Troubleshooting

### Worker não conecta no RabbitMQ
```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Testar conexão
telnet localhost 5672
```

### Mensagens não são consumidas
- Verificar se a fila existe no RabbitMQ Management (`http://localhost:15672`)
- Confirmar binding entre exchange e queue
- Validar routing key

### API retorna erro 500
- Worker fará 3 tentativas com backoff
- Após falhar, mensagem é descartada (Nack sem requeue)
- Verificar logs da API NestJS

## 📦 Dependências

```go
require (
    github.com/rabbitmq/amqp091-go v1.9.0
    github.com/joho/godotenv v1.5.1
)
```

## 🔐 Boas Práticas Implementadas

- ✅ Graceful shutdown (SIGINT/SIGTERM)
- ✅ Context timeout em requisições HTTP
- ✅ QoS para evitar sobrecarga
- ✅ Validações robustas com ranges realistas
- ✅ Logs estruturados para debugging
- ✅ Retry com backoff exponencial limitado
- ✅ Nack sem requeue para prevenir loops infinitos
- ✅ Multi-stage Dockerfile para imagem otimizada
