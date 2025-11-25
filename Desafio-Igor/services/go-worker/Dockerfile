FROM golang:1.21-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git

# Copiar go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copiar código fonte
COPY . .

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Imagem final
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copiar binário
COPY --from=builder /app/main .

# Executar
CMD ["./main"]
