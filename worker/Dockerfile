FROM golang:1.22-alpine AS builder

WORKDIR /app

# Copia o go.mod e o main.go para o contexto
COPY go.mod ./
COPY main.go ./

# Gera automaticamente o go.sum e baixa dependências com base no main.go
RUN go mod tidy

# Faz o build do binário
RUN go build -o worker main.go

# ---- Runtime stage ----
FROM alpine:3.19

WORKDIR /app

COPY --from=builder /app/worker .

CMD ["./worker"]
