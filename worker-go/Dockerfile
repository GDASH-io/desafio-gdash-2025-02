# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copiar go.mod e go.sum
COPY go.* ./

# Download dependencies
RUN go mod download

# Copiar código fonte
COPY . .

# Build da aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker .

# Production stage
FROM alpine:latest

# Instalar certificados SSL e curl
RUN apk --no-cache add ca-certificates curl

WORKDIR /root/

# Copiar binário do stage anterior
COPY --from=builder /app/worker .

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
  CMD pgrep worker || exit 1

# Comando de inicialização
CMD ["./worker"]
