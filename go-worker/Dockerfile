# Stage 1: Build
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Instalar dependências de build
RUN apk add --no-cache git

# Copiar go.mod e go.sum
COPY go.mod go.sum ./
RUN go mod download

# Copiar código fonte
COPY . .

# Build do binário
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o worker .

# Stage 2: Runtime
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binário do stage de build
COPY --from=builder /app/worker .

# Expor porta (não usado, mas bom para documentação)
EXPOSE 8080

# Rodar worker
CMD ["./worker"]