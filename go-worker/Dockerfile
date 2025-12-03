# 1. Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copia apenas o go.mod (deixe o builder gerar um go.sum consistente)
COPY go.mod ./

# Baixa as dependências
RUN go mod download || true

# Garantir que o módulo específico seja baixado (evita falta de entrada no go.sum)
RUN go get github.com/go-redis/redis/v8@v8.11.5

# Copia o código fonte
COPY main.go .

# Compila o aplicativo
RUN go build -ldflags="-s -w" -o /go-worker main.go

# 2. Production stage (base pequena)
FROM alpine:latest

# Copia o binário compilado
COPY --from=builder /go-worker /usr/local/bin/go-worker

# Variáveis de ambiente
ENV REDIS_HOST=redis \
    REDIS_PORT=6379 \
    API_URL=http://nestjs-api:3000/api/weather/process

# Executa o worker
CMD ["go-worker"]