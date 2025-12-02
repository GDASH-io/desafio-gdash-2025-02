# Build worker Go
FROM golang:1.20-alpine AS builder

WORKDIR /app

# Copia apenas arquivos de módulo para cache
COPY go.mod go.sum ./
RUN go mod download

# Copia código
COPY . .

# Build do binário
RUN go build -o worker main.go

# Segunda etapa: container final leve
FROM alpine:latest

WORKDIR /app
COPY --from=builder /app/worker .

CMD ["./worker"]
