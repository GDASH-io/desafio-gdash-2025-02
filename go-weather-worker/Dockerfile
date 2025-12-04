# Stage 1: Build
FROM golang:1.21-alpine AS builder

# Instalar dependências de build
RUN apk add --no-cache git

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar código fonte
COPY . .

# Build do binário
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker ./cmd/worker

# Stage 2: Runtime
FROM alpine:latest

# Instalar certificados SSL (para HTTPS)
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binário do stage anterior
COPY --from=builder /app/worker .

# Comando para executar
CMD ["./worker"]
