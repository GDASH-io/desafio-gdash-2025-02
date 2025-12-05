# 1. Fase de Build (Go Builder)
FROM golang:1.25.4-alpine AS builder

WORKDIR /app

# Copia dependências
COPY go.mod go.sum ./
RUN go mod download

# Copia código
COPY worker.go .

# Compila o binário e salva na raiz do builder com o nome /go-worker
RUN CGO_ENABLED=0 GOOS=linux go build -o /go-worker .

# ---------------------------------------------------------------------------------------------------

# 2. Fase de Produção
FROM alpine:latest

WORKDIR /root/

# CORREÇÃO: Copia do builder (/go-worker) para a raiz da imagem final (/go-worker)
# Antes estava copiando para "." (que seria /root/go-worker)
COPY --from=builder /go-worker /go-worker

# Agora o arquivo existe no caminho absoluto /go-worker
RUN chmod +x /go-worker

# Executa o binário pelo caminho absoluto
CMD ["/go-worker"]