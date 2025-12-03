# Build stage
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum (se existir)
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fonte
COPY main.go ./

# Build do binário
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker .

# Runtime stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binário do stage de build
COPY --from=builder /app/worker .

# Healthcheck simples (verificar se processo está rodando)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD pgrep worker > /dev/null || exit 1

# Executar worker
CMD ["./worker"]

