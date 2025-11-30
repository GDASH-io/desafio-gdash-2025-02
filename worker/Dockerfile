# --- Estágio 1: Build (Compilação) ---
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Copia dependências e baixa
COPY go.mod go.sum ./
RUN go mod download

# Copia o código fonte
COPY . .

# Compila o binário estático
# CGO_ENABLED=0 garante compatibilidade total com Alpine
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

# --- Estágio 2: Runtime (Imagem Leve) ---
FROM alpine:latest

WORKDIR /app

# 1. Instala o tzdata para corrigir o horário (Timezone)
# Como é uma imagem Alpine, usamos apk
RUN apk add --no-cache tzdata

# 2. Copia o binário compilado do estágio anterior
COPY --from=builder /app/main .

# 3. Copia o arquivo .env (caso seu código Go tente ler o arquivo explicitamente)
COPY --from=builder /app/.env .

# 4. Comando de execução
CMD ["./main"]