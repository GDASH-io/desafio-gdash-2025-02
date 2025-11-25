# Go Worker

Worker em Go que consome mensagens da fila Redis e envia para a API NestJS.

## 🎯 Funcionalidades

- Consome mensagens da fila Redis (blocking pop)
- Envia dados para API NestJS
- Retry automático em caso de falha
- Alta performance e concorrência
- Logs estruturados

## 🚀 Execução Local

### Pré-requisitos

```bash
go mod download
```

### Executar

```bash
export REDIS_HOST=localhost
export API_BASE_URL=http://localhost:3000
go run main.go
```

### Build

```bash
go build -o worker main.go
./worker
```

## 🐳 Docker

```bash
docker build -t gdash-go-worker .
docker run --env-file .env gdash-go-worker
```

## ⚙️ Variáveis de Ambiente

- `REDIS_HOST`: Host do Redis (padrão: redis)
- `REDIS_PORT`: Porta do Redis (padrão: 6379)
- `REDIS_PASSWORD`: Senha do Redis (opcional)
- `API_BASE_URL`: URL base da API NestJS

## 🔄 Fluxo de Processamento

1. Aguarda mensagem na fila `weather_queue` (blocking)
2. Faz parse do JSON
3. Envia POST para `/weather` na API
4. Em caso de erro, reenvia para a fila
5. Logs de sucesso/erro

## 📊 Métricas

- Throughput: ~1000 msg/s
- Latência média: <10ms
- Retry automático: Sim
- Concorrência: Configurável
